package websocket

import (
	"chookeye-core/handlers"
	"fmt"
	"log"
	"strconv"
	"sync"

	"github.com/zishang520/socket.io/v2/socket"
)

// var alertClient *socket.Socket
var alertRoomName socket.Room

func registerAlertEventHandlers(io *socket.Server) {
	io.On("connection", handleAlertConnection)
}

func handleAlertConnection(clients ...any) {
	alertClient := clients[0].(*socket.Socket)

	alertClient.On("join_alert_room", func(args ...any) {
		handleJoinAlertRoom(alertClient, args...)
	})

	alertClient.On("disconnect", func(args ...any) {
		handleAlertDisconnect(alertClient)
	})
}

func handleJoinAlertRoom(client *socket.Socket, args ...any) {

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

	roomName := getLocationRoomName(latitude, longitude)
	alertRoomName = roomName

	client.Join(roomName)
	log.Printf("Client %s joined alert room: %s\n", client.Id(), roomName)

	emitNearbyAlerts(client, roomName, latitude, longitude, radius)
}

func handleAlertDisconnect(client *socket.Socket) {
	client.Leave(alertRoomName)
	fmt.Printf("Client disconnected: %s", client.Id())
}

func emitNearbyAlerts(client *socket.Socket, roomName socket.Room, latitude, longitude, radius float64) {
	alerts, err := handlers.GetAlertsNearLocation(latitude, longitude, radius) // 1000 meters radius
	if err != nil {
		log.Printf("Error getting alerts: %s", err.Error())
		return
	}

	for _, alert := range alerts {
		//err := client.Emit("alert", alert)
		err := client.To(alertRoomName).Emit("alert", alert)
		if err != nil {
			log.Println("Error emitting alerts:", err.Error())
			continue
		}
		fmt.Printf("Emitting alert: %v %v\n", alert.ID, alert.Title)
	}
}

func getLocationRoomName(latitude, longitude float64) socket.Room {

	latStr := strconv.FormatFloat(latitude, 'f', 6, 64)
	longStr := strconv.FormatFloat(longitude, 'f', 6, 64)

	roomName := fmt.Sprintf("alert-room-%s-%s", latStr, longStr)

	return socket.Room(roomName)
}

func isMapEmpty(m *sync.Map) bool {
	var empty bool
	m.Range(func(_, _ interface{}) bool {
		empty = false
		return false
	})
	return empty
}
