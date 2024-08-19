package api

import (
	"chookeye-core/routes"
	"github.com/gin-gonic/gin"
)

var router = gin.Default()

func SetupRouter() *gin.Engine {

	route := router.Group("/")

	//system: routes for logs and pings and heartbeat
	routes.AddSystemRoutes(route)

	//middleware: attach the middleare here

	//routes: routes created here

	return router
}
