package handlers

import (
	"bytes"
	"chookeye-core/broadcast"
	"chookeye-core/database"
	"chookeye-core/schemas"
	"chookeye-core/validators"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func GetAlertByIDHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID"})
		return
	}

	var alert schemas.Alert
	if err := database.Store.Preload("Flags").First(&alert, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"alert": alert})
}

//NOTE: GetalertsNearLocation handler is in database/alerts.go to avoid import cycles

type createAlertRequest struct {
	Content  string           `json:"content" validate:"required"`
	Location schemas.Location `json:"location"`
}

func CreateAlertHandler(c *gin.Context) {

	var requestBody createAlertRequest

	if !validators.ValidateRequestBody(c, &requestBody) {
		return
	}

	// Retrieve the user ID from the context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// If location is not provided, use the user's saved location from the database
	var location schemas.Location
	if requestBody.Location == (schemas.Location{}) {
		// Fetch user from the database to get the location
		var user schemas.User
		if err := database.Store.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
			return
		}
		location = user.Location
	} else {
		location = requestBody.Location
	}

	// Prepare the data to send to the Python service
	alertProcessingData := map[string]interface{}{
		"content": requestBody.Content,
	}

	// Default values in case the Python service fails
	translatedContent := requestBody.Content
	nextSteps := "Review the content and take appropriate action."
	urgencyScore := 8

	// Marshal the data to JSON
	jsonData, err := json.Marshal(alertProcessingData)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize request data"})
		return
	}

	fmt.Println("Making request to Python service")
	// Send a POST request to the Python service and handle errors
	resp, err := http.Post("http://flask:5000/process_alert", "application/json", bytes.NewBuffer(jsonData))
	if err == nil {
		defer resp.Body.Close()

		// Parse the response from the Python service
		var processingResult struct {
			IsAlert           int    `json:"isAlert"`
			NextSteps         string `json:"nextSteps"`
			TranslatedContent string `json:"translatedContent"`
			UrgencyScore      int    `json:"urgencyScore"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&processingResult); err == nil {
			if processingResult.IsAlert != 0 {
				// If the Python service successfully identified the content as an alert
				translatedContent = processingResult.TranslatedContent
				nextSteps = processingResult.NextSteps
				urgencyScore = processingResult.UrgencyScore
			} else {
				c.JSON(http.StatusBadRequest, gin.H{"error": "The content doesn't seem to be an alert. Please review and try again."})
				return
			}
		}
	} else {
		fmt.Println(err)
	}

	// Expiry date logic
	expirationDays := 2
	expiresAt := time.Now().Add(time.Hour * 24 * time.Duration(expirationDays))

	// Create the alert
	alert := schemas.Alert{
		UserID:      userID.(uint),
		Location:    location,
		Title:       translatedContent, // Use the translated content or original content
		Description: nextSteps,         // Use the next steps or default steps
		Status:      "active",          // Default status
		Urgency:     urgencyScore,      // Use the urgency score or default score
		ExpiresAt:   expiresAt,
	}

	if err := database.Store.Create(&alert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create alert"})
		return
	}

	log.Println("broadcasting .....")
	broadcast.TriggerNewAlertFromBackend(alert.Location.Latitude, alert.Location.Longitude, 1.0, alert)

	c.JSON(http.StatusCreated, gin.H{"alert": alert})
}
