package utils

import (
	"context"
	firebase "firebase.google.com/go/v4"
	//"firebase.google.com/go/v4/messaging"
	"google.golang.org/api/option"
)

var FirebaseApp *firebase.App

func FirebaseInit() error {
	opt := option.WithCredentialsFile("./private/fbadmin.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		return err
	}
	FirebaseApp = app
	return nil
}

// fcmClient, err := app.Messaging(ctx)
// if err != nil {
// 	return nil, err
// }
// return fcmClient, nil
