package websocket

import (
	"fmt"
	"github.com/zishang520/socket.io/v2/socket"
	"log"
)

func registerSystemEventHandlers(io *socket.Server) {
	io.On("connection", handleSystemConnection)
}

var client *socket.Socket

func handleSystemConnection(clients ...any) {
	client = clients[0].(*socket.Socket)
	fmt.Printf("New client connected: %s", client.Id())

	client.On("ping", handlePing)
	client.On("echo", handleEcho)
	client.On("disconnect", handleSystemDisconnect)
}

func handlePing(args ...any) {
	log.Printf("Received 'ping' event from client: %s\n", client.Id())
	client.Emit("pong", "pongyyyyyyyy")
}

func handleEcho(args ...any) {
	log.Printf("Received 'echo' event from client: %s\n", client.Id())
	client.Emit("echo_response", args...)
}

func handleSystemDisconnect(args ...any) {

	//TODO:disconnect

	fmt.Printf("Client disconnected: %s", client.Id())
}
