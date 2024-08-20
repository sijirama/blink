package routes

import (
	"chookeye-core/handlers"
	"chookeye-core/middleware"
	"github.com/gin-gonic/gin"
)

func AddAlertRoutes(r *gin.RouterGroup) {
	alert := r.Group("/alert")
	{

		alert.Use(middleware.AuthMiddleware())
		{
			alert.POST("/", handlers.CreateAlertHandler)
		}
	}

}
