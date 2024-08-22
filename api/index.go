package api

import (
	"chookeye-core/routes"
	"chookeye-core/websocket"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var router = gin.Default()

func SetupRouter() *gin.Engine {

	route := router.Group("/")

	//system: routes for logs and pings and heartbeat
	routes.AddSystemRoutes(route)

	//middleware: attach the middleare here
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:5173", "*"}
	corsConfig.AllowCredentials = true
	route.Use(cors.New(corsConfig))

	//pre processes
	websocket.StartServer(route) //socket server

	//attach "/api"
	route = route.Group("/api")

	//routes: routes created here
	routes.AddAuthenticationRoutes(route)
	routes.AddAlertRoutes(route)

	return router
}
