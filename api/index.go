package api

import (
	"chookeye-core/handlers"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {

	r := gin.Default()

	//system
	r.GET("/ping", handlers.Pong)
	r.GET("/healthcheck", handlers.Health)
	r.GET("/health", handlers.Health)
	r.GET("/heart", handlers.Health)
	r.GET("/heartbeat", handlers.Health)

	//middleware

	//routes

	return r

}
