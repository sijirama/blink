package routes

import (
	"chookeye-core/handlers"
	"chookeye-core/middleware"
	"github.com/gin-gonic/gin"
)

/*
   get comments for a particlar alert
   add comment to an alert
*/

func AddCommentRoutes(r *gin.RouterGroup) {
	alert := r.Group("/comment")
	alert.GET("/:id", handlers.GetComentsByIdHandler)
	{

		alert.Use(middleware.AuthMiddleware())
		{
			alert.POST("/:id", handlers.CreateCommentHandler)
		}
	}

}
