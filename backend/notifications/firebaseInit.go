package notifications

import (
	"chookeye-core/utils"
	"context"
	"fmt"

	"firebase.google.com/go/v4/messaging"
)

type NotificationPayload struct {
	token string // The device token to send the notification to
	title string // The title of the notification
	body  string // The body text of the notification
}

func FirebaseSendNotification(
	payload NotificationPayload,
) error {
	client, err := utils.FirebaseApp.Messaging(context.Background())
	if err != nil {
		return err
	}
	response, err := client.Send(context.Background(), &messaging.Message{
		Notification: &messaging.Notification{
			Title: payload.title,
			Body:  payload.body,
		},
		Token: payload.token, // it's a single device token
	})
	if err != nil {
		return err
	}
	fmt.Printf("\n\n\n Response success count : %v\n\n", response)
	return nil
}
