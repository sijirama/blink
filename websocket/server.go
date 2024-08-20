package websocket

/*
   for the sake of neatnes, i have arranged the socket events into separate files,
   to create a new set of events:
       1. create the file, with the event function
       2. create the event registerer in the file
       3. add it to the registerEventHandlers function
*/

import (
	"github.com/gin-gonic/gin"
	"github.com/zishang520/engine.io/v2/types"
	"github.com/zishang520/socket.io/v2/socket"
	"log"
)

func StartServer(route *gin.RouterGroup) {
	httpServer := types.NewWebServer(nil)
	io := socket.NewServer(httpServer, nil)
	io.Opts().SetCors(&types.Cors{
		Origin:      "*",
		Credentials: true,
	})

	io.Use(func(s *socket.Socket, next func(*socket.ExtendedError)) {
		log.Printf("Received from client: %s\n", s.Id())
		next(nil)
	})

	registerEventHandlers(io)

	route.Any("/socket.io/*path", gin.WrapH(io.ServeHandler(nil)))
}

func registerEventHandlers(io *socket.Server) {
	registerSystemEventHandlers(io)
	registerAlertEventHandlers(io)
	// Register other event handlers here
}
