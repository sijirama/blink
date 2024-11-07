package broadcast

import (
	"chookeye-core/notifications"
	"chookeye-core/schemas"
	"chookeye-core/utils"
	"log"
	"sync"

	"github.com/zishang520/socket.io/v2/socket"
)

var clients sync.Map

type ClientLocation struct {
	Socket    *socket.Socket
	Latitude  float64
	Longitude float64
	Radius    float64
}

func TriggerNewAlertFromBackend(latitude, longitude, radius float64, alertData schemas.Alert) {
	go func() {
		broadcastAlertToNearbyClients(latitude, longitude, radius, alertData)
	}()
}

func TriggerAlertChange(alert schemas.Alert) {
	go func() {
		broadcastAlertToNearbyClients(alert.Location.Latitude, alert.Location.Longitude, 1.0, alert)
	}()
}

func broadcastAlertToNearbyClients(latitude, longitude, radius float64, alertData schemas.Alert) {
	clients.Range(func(key, value any) bool {
		location := value.(ClientLocation)

		distance := utils.CalculateDistance(latitude, longitude, location.Latitude, location.Longitude)
		if distance <= radius {
			location.Socket.Emit("alert", alertData)
			notifications.SendPushNotification(alertData)
			log.Printf("Alert sent to client %s at distance %v km\n", location.Socket.Id(), distance)
		}
		return true
	})
}

func RegisterClient(id string, location ClientLocation) {
	clients.Store(id, location)
}

func RemoveClient(id string) {
	clients.Delete(id)
}
