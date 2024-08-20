package websocket

import (
	// "chookeye-core/database"
	// "chookeye-core/schemas"
	"chookeye-core/handlers"
	"fmt"
	"github.com/zishang520/socket.io/v2/socket"
)

func registerAlertEventHandlers(io *socket.Server) {
	io.On("connection", handleAlertConnection)
}

var alertClient *socket.Socket
var alertRoomName socket.Room

func handleAlertConnection(clients ...any) {
	alertClient = clients[0].(*socket.Socket)
	fmt.Printf("New client connected: %s", client.Id())

	alertClient.On("join_alert_room", handleJoinAlertRoom)
	alertClient.On("disconnect", handleAlertDisconnect)
}

func handleJoinAlertRoom(args ...any) {

	latitude := args[1].(float64)
	longitude := args[2].(float64)

	roomName := getLocationRoomName(latitude, longitude)
	alertRoomName = roomName

	fmt.Printf("Client %s joined alert room: %s\n", alertClient.Id(), roomName)
	alertClient.Join(roomName)

	// Emit all alerts to the client
	emitNearbyAlerts(client, roomName, latitude, longitude)
}

func handleAlertDisconnect(args ...any) {
	alertClient.Leave(alertRoomName)
	fmt.Printf("Client disconnected: %s", alertClient.Id())
}

func emitNearbyAlerts(client *socket.Socket, roomName socket.Room, latitude, longitude float64) {
	alerts, err := handlers.GetAlertsNearLocation(latitude, longitude, 1000) // 1000 meters radius
	if err != nil {
		// Handle error
		return
	}
	for _, alert := range alerts {
		client.To(roomName).Emit("alert", alert)
	}
}

func getLocationRoomName(latitude, longitude float64) socket.Room {
	// Generate a unique room name based on the location
	// e.g., using a geohash or combining latitude and longitude
	return socket.Room(fmt.Sprintf("alert-room-%f-%f", latitude, longitude))
}
