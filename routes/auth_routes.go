package routes

import (
	"chookeye-core/handlers"
	"chookeye-core/middleware"
	"github.com/gin-gonic/gin"
)

func AddAuthenticationRoutes(r *gin.RouterGroup) {
	auth := r.Group("/auth")
	{
		auth.POST("/signup", handlers.SignUp)
		auth.POST("/signin", handlers.Signin)
		auth.POST("/signout", handlers.SignOut)
		// auth.POST("/forgot-password", handlers.ForgotPassword)
		// auth.POST("/reset-password", handlers.ResetPassword)

		// Protected routes
		protected := auth.Group("/")
		protected.Use(middleware.AuthMiddleware())
		{
			protected.POST("/refresh-token", handlers.RefreshToken)
			// Add other protected routes here
		}
	}
}
