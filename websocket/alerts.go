package websocket

import (
	"chookeye-core/handlers"
	"fmt"
	"log"
	"strconv"

	"github.com/zishang520/socket.io/v2/socket"
)

func registerAlertEventHandlers(io *socket.Server) {
	io.On("connection", handleAlertConnection)
}

var alertClient *socket.Socket
var alertRoomName socket.Room

func handleAlertConnection(clients ...any) {
	alertClient = clients[0].(*socket.Socket)
	fmt.Printf("\nNew client in the alert connected: %s\n", alertClient.Id())

	log.Println("Preeeeeee Join alert room handler called")
	alertClient.On("join_alert_room", func(args ...any) {
		handleJoinAlertRoom(args...)
	})

	//alertClient.On("join_alert_room", handleJoinAlertRoom)
	alertClient.On("disconnect", handleAlertDisconnect)
}

func handleJoinAlertRoom(args ...any) {
	fmt.Println(len(args))
	latitudeStr := args[0].(string)
	longitudeStr := args[1].(string)
	radiusStr := args[2].(string)
	fmt.Println(latitudeStr, longitudeStr, radiusStr)

	latitude, err := strconv.ParseFloat(latitudeStr, 64)
	if err != nil {
		log.Printf("Error converting latitude to float64: %v", err)
		return
	}

	longitude, err := strconv.ParseFloat(longitudeStr, 64)
	if err != nil {
		log.Printf("Error converting longitude to float64: %v", err)
		return
	}

	radius, err := strconv.ParseFloat(radiusStr, 64)
	if err != nil {
		log.Printf("Error converting longitude to float64: %v", err)
		return
	}

	// Proceed with the rest of the logic
	roomName := getLocationRoomName(latitude, longitude)
	alertRoomName = roomName

	alertClient.Join(roomName)
	log.Printf("Client %s joined alert room: %s\n", alertClient.Id(), roomName)

	// Emit all alerts to the client
	emitNearbyAlerts(alertClient, roomName, latitude, longitude, radius)
}
func handleAlertDisconnect(args ...any) {
	alertClient.Leave(alertRoomName)
	fmt.Printf("Client disconnected: %s", alertClient.Id())
}

func emitNearbyAlerts(client *socket.Socket, roomName socket.Room, latitude, longitude, radius float64) {
	alerts, err := handlers.GetAlertsNearLocation(latitude, longitude, radius) // 1000 meters radius
	if err != nil {
		log.Printf("Error getting alerts: %s", err.Error())
		return
	}

	//client.To(roomName).Emit("alerts", alerts)
	for _, alert := range alerts {
		//fmt.Printf("alert: %v", alert.ID)
		client.To(roomName).Emit("alert", alert)
	}
}

func getLocationRoomName(latitude, longitude float64) socket.Room {
	// Convert latitude and longitude to strings with precision
	latStr := strconv.FormatFloat(latitude, 'f', 6, 64)
	longStr := strconv.FormatFloat(longitude, 'f', 6, 64)

	// Combine them into a room name
	roomName := fmt.Sprintf("alert-room-%s-%s", latStr, longStr)

	// Return the room name as a socket.Room
	return socket.Room(roomName)
}

// func getLocationRoomName(latitude, longitude float64) socket.Room {
// 	// Generate a unique room name based on the location
// 	// e.g., using a geohash or combining latitude and longitude
// 	return socket.Room(fmt.Sprintf("alert-room-%s-%s", latitude, longitude))
// }
