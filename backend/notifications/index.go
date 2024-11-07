package notifications

import (
	"chookeye-core/database"
	"chookeye-core/schemas"
	"fmt"
)

func SendPushNotification(alert schemas.Alert) error {

	userId := alert.UserID

	var user schemas.User

	// Fetch the user with their associated DeviceTokens
	if err := database.Store.Preload("DeviceTokens").First(&user, userId).Error; err != nil {
		return fmt.Errorf("failed to retrieve user: %w", err)
	}

	// Iterate over the user's device tokens to send the push notification
	for _, token := range user.DeviceTokens {

		if !token.IsValid {
			continue // Skip the token if it's invalid
		}

		payload := NotificationPayload{
			token: token.Token,
			title: alert.Title,
			body:  alert.Status,
		}

		// Placeholder function for sending a push notification
		if err := FirebaseSendNotification(payload); err != nil {
			return fmt.Errorf("failed to send notification to device %s: %w", token.Token, err)
		}

		fmt.Printf("\n\n\n Notification sent to device %v \n", token.Token)
	}

	return nil
}
