package handlers

import (
	"github.com/gin-gonic/gin"
	"net/http"
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
