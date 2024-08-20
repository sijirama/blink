package handlers

import (
	//. "chookeye-core/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Pong(x *gin.Context) {
	x.JSON(200, gin.H{
		"message": "pong pong pong pong",
	})
}

func Health(x *gin.Context) {
	x.JSON(http.StatusOK, gin.H{
		"message": "OK",
	})
}
