package websocket

import (
	"chookeye-core/broadcast"
	"chookeye-core/database"
	"fmt"
	"log"
	"strconv"

	"github.com/zishang520/socket.io/v2/socket"
)

func registerAlertEventHandlers(io *socket.Server) {
	io.On("connection", handleAlertConnection)
}

func handleAlertConnection(clients ...any) {
	alertClient := clients[0].(*socket.Socket)

	alertClient.On("join_chookeye", func(args ...any) {
		handleChookeye(alertClient, args...)
	})

	alertClient.On("join_alert_room", func(args ...any) {
		handleJoinAlertRoom(alertClient, args...)
	})

	alertClient.On("leave_alert_room", func(args ...any) {
		handleJoinAlertRoom(alertClient, args...)
	})

	alertClient.On("disconnect", func(args ...any) {
		handleAlertDisconnect(alertClient)
	})
}

func handleJoinAlertRoom(alertClient *socket.Socket, args ...any) {
	fmt.Printf("Number of args is %s", len(args))
	alertId := args[0]
	log.Printf(`WTFFFFFFFFFF: client %s is joining alert-%v`, alertClient.Id(), alertId)
	alertClient.Join(socket.Room(fmt.Sprintf(`alert-%v`, alertId)))
}

func handleLeaveAlertRoom(alertClient *socket.Socket, args ...any) {
	alertId := args[0]
	log.Printf(`client %s is leaving alert room %s`, alertClient.Id(), alertId)
	alertClient.Leave(socket.Room(fmt.Sprintf(`alert-%s`, alertId)))
}

func handleChookeye(client *socket.Socket, args ...any) {

	latitudeStr := args[0].(string)
	longitudeStr := args[1].(string)
	radiusStr := args[2].(string)
	fmt.Println(latitudeStr, longitudeStr)

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

	clientLocation := broadcast.ClientLocation{
		Latitude:  latitude,
		Longitude: longitude,
		Radius:    radius,
		Socket:    client,
	}

	log.Printf("Client %s joined alert room at location: %v\n", client.Id(), clientLocation)

	broadcast.RegisterClient(string(client.Id()), clientLocation)

	emitNearbyAlerts(client, latitude, longitude, radius)
}

func handleAlertDisconnect(client *socket.Socket) {
	broadcast.RemoveClient(string(client.Id()))
	fmt.Printf("Client disconnected: %s", client.Id())
}

func emitNearbyAlerts(client *socket.Socket, latitude, longitude, radius float64) {
	alerts, err := database.GetAlertsNearLocation(latitude, longitude, radius) // 1000 meters radius
	if err != nil {
		log.Printf("Error getting alerts: %s", err.Error())
		return
	}

	for _, alert := range alerts {
		err := client.Emit("alert", alert)
		if err != nil {
			log.Println("Error emitting alerts:", err.Error())
			continue
		}
		fmt.Printf("Emitting alert: %v %v\n", alert.ID, alert.Title)
	}
}
