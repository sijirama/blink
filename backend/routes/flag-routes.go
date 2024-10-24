package routes

import (
	"chookeye-core/handlers"
	"chookeye-core/middleware"

	"github.com/gin-gonic/gin"
)

func AddFlagRoutes(r *gin.RouterGroup) {
	flag := r.Group("/flag")
	flag.Use(middleware.AuthMiddleware())
	{
		flag.POST("/:alertId", handlers.CreateFlagHandler)
	}
}
