package routes

import (
	"chookeye-core/handlers"
	"github.com/gin-gonic/gin"
)

func AddSystemRoutes(ping *gin.RouterGroup) {
	ping.GET("/ping", handlers.Pong)
	ping.GET("/", handlers.Health)
	ping.GET("/health", handlers.Health)
	ping.GET("/healthcheck", handlers.Health)
	ping.GET("/heartbeat", handlers.Health)
}
