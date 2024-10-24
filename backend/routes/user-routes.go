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

		protected := user.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
		}
	}
}
