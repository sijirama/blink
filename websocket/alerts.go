package websocket

import (
	// "chookeye-core/database"
	// "chookeye-core/schemas"
	"fmt"
	"github.com/zishang520/socket.io/v2/socket"
)

func registerAlertEventHandlers(io *socket.Server) {
	io.On("connection", handleAlertConnection)
}

func handleAlertConnection(clients ...any) {
	client := clients[0].(*socket.Socket)
	fmt.Printf("New client connected: %s", client.Id())

	client.On("join_alert_room", handleJoinAlertRoom)
	client.On("disconnect", handleAlertDisconnect)
}

func handleJoinAlertRoom(args ...any) {
	client := args[0].(*socket.Socket)
	roomName := args[1].(socket.Room)
	fmt.Printf("Client %s joined alert room: %s\n", client.Id(), roomName)
	client.Join(roomName)

	// Emit all alerts to the client
	emitAllAlerts(client, roomName)
}

func handleAlertDisconnect(args ...any) {
	client := args[0].(*socket.Socket)
	fmt.Printf("Client disconnected: %s", client.Id())
}

func emitAllAlerts(client *socket.Socket, roomName socket.Room) {
	// Retrieve all alerts from your data source and emit them to the client
	alerts := getAllAlertsFromDataSource()
	for _, alert := range alerts {
		client.To(roomName).Emit("alert", alert)
	}
}

func getAllAlertsFromDataSource() []interface{} {
	// Implement your logic to fetch all alerts from the data source
	return []interface{}{
		map[string]interface{}{"id": "1", "message": "This is alert 1"},
		map[string]interface{}{"id": "2", "message": "This is alert 2"},
	}
}

// func InitializeAlertsEvents() {
// 	Server.OnEvent("/", "get_alerts", func(s socketio.Conn, location schemas.Location) {
// 		alerts := fetchAlertsInGeoZone(location)
// 		s.Emit("alerts", alerts)
// 	})
// }
//
// func fetchAlertsInGeoZone(location schemas.Location) []schemas.Alert {
// 	var alerts []schemas.Alert
// 	database.Store.Find(&alerts)
// 	return alerts
// }
