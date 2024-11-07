package processes

/*

Package provides functionality for managing and processing crowd-sourced alerts.

This file implements an alert verification and archiving system that:
- Calculates a verification score based on user flags (verifications vs dismissals)
- Applies time-based weighting to flags, prioritizing recent activity
- Considers alert urgency in archiving decisions
- Extends expiration for highly verified alerts
- Runs periodically to process all active alerts

The system aims to automatically manage alert lifecycle based on community feedback,
helping to maintain the relevance and accuracy of the alert database.

TODO:
    - revise the calculateScore function

*/

import (
	"chookeye-core/broadcast"
	"chookeye-core/database"
	"chookeye-core/schemas"
	"sync"
	"time"
)

const (
	VerificationWeight = 3
	DismissalWeight    = -2
	SpamWeight         = -2

	UrgencyFactor = 0.2
	MaxUrgency    = 10

	VerificationThreshold = 5
	ArchiveThreshold      = -5

	MaxDecayTime          = 24 * time.Hour // 1 day
	InitialExpirationTime = 12 * time.Hour
	ExtensionTime         = 6 * time.Hour
	ReductionTime         = 3 * time.Hour
)

func getFlagWeight(flagType string) float64 {
	switch flagType {
	case "verification":
		return VerificationWeight
	case "dismissal":
		return DismissalWeight
	case "spam":
		return SpamWeight
	default:
		return 0
	}
}

func archiveAlert(alert schemas.Alert) {
	alert.Status = "archived"
	database.Store.Save(&alert)
}

func extendAlertExpiration(alert schemas.Alert, duration time.Duration) {
	newExpiresAt := alert.ExpiresAt.Add(duration)
	if newExpiresAt.After(time.Now().Add(InitialExpirationTime)) {
		newExpiresAt = time.Now().Add(InitialExpirationTime)
	}
	alert.ExpiresAt = newExpiresAt
	database.Store.Save(&alert)
}

func reduceAlertExpiration(alert schemas.Alert, duration time.Duration) {
	newExpiresAt := alert.ExpiresAt.Add(-duration)
	if newExpiresAt.Before(time.Now()) {
		archiveAlert(alert)
	} else {
		alert.ExpiresAt = newExpiresAt
		database.Store.Save(&alert)
	}
}

// TODO: revise this
func calculateAlertScore(alert schemas.Alert) float64 {
	var score float64
	now := time.Now()

	for _, flag := range alert.Flags {
		weight := getFlagWeight(flag.Type)
		decayFactor := 1 - float64(now.Sub(flag.CreatedAt))/float64(MaxDecayTime)
		if decayFactor < 0 {
			decayFactor = 0
		}
		score += weight * decayFactor
	}

	// Factor in urgency (assuming urgency is 1-10)
	urgencyFactor := float64(alert.Urgency) / 10.0
	score *= urgencyFactor

	return score
}

func processAlert(alert schemas.Alert) {
	score := calculateAlertScore(alert)

	switch {
	case time.Now().After(alert.ExpiresAt):
		archiveAlert(alert)
	case score > VerificationThreshold:
		extendAlertExpiration(alert, ExtensionTime)
	case score < ArchiveThreshold:
		reduceAlertExpiration(alert, ReductionTime)
	default:
		// Alert remains active, no change to expiration
	}

	broadcast.TriggerAlertChange(alert)
}

func ProcessAlerts() error {
	var alerts []schemas.Alert

	if err := database.Store.Preload("Flags").Where("status = ?", "active").Find(&alerts).Error; err != nil {
		return err
	}

	var wg sync.WaitGroup
	for _, alert := range alerts {
		wg.Add(1)
		go func(a schemas.Alert) {
			defer wg.Done()
			processAlert(a)
		}(alert)
	}

	wg.Wait()
	return nil
}

// This function would be called by your cron job
func RunAlertManagement() {
	if err := ProcessAlerts(); err != nil {
	}
}
