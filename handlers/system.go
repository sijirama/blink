package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func Pong(x *gin.Context) {
	x.JSON(200, gin.H{
		"message": "pong",
	})
}

func Health(x *gin.Context) {
	x.JSON(http.StatusOK, gin.H{
		"message": "OK",
	})
}
