package api

import (
	"chookeye-core/cron"
	"chookeye-core/routes"
	"chookeye-core/utils"
	"chookeye-core/websocket"
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

var router = gin.New()

func SetupRouter() *gin.Engine {

	route := router.Group("/")

	//system: routes for logs and pings and heartbeat
	routes.AddSystemRoutes(route)

	//middleware: attach the middleare here
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowOrigins = []string{"http://localhost:5173", "*"}
	corsConfig.AllowCredentials = true
	route.Use(cors.New(corsConfig))

	//INFO: pre processes
	websocket.StartServer(route) //socket server
	cron.InitializeCronServer()  //cron server
	err := utils.FirebaseInit()  //initialise firebase
	if err != nil {
		fmt.Printf("error connecting to firebase: %v", err)
		log.Fatal(err)
	}

	//attach "/api"
	route = route.Group("/api")

	//routes: routes created here
	routes.AddAuthenticationRoutes(route)
	routes.AddAlertRoutes(route)
	routes.AddFlagRoutes(route)
	routes.AddUserRoutes(route)
	routes.AddCommentRoutes(route)

	return router
}
