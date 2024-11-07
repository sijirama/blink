package routes

import (
	"chookeye-core/handlers"
	"chookeye-core/middleware"
	"github.com/gin-gonic/gin"
)

func AddUserRoutes(r *gin.RouterGroup) {
	user := r.Group("/user")
	{
		user.GET("/check-username", handlers.CheckUserName)

		user.Use(middleware.AuthMiddleware())
		{
			user.POST("/deviceId", handlers.RegisterDeviceToken) // get firebase device token
			user.DELETE("/deviceId", handlers.RemoveDeviceToken) // get firebase device token
		}
	}
}
