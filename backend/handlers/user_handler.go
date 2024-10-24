package handlers

import (
	"chookeye-core/database"
	"chookeye-core/schemas"
	"github.com/gin-gonic/gin"
	"net/http"
)

func CheckUserName(c *gin.Context) {
	username := c.Query("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username is required"})
		return
	}

	var user schemas.User
	result := database.Store.Where("username = ?", username).First(&user)

	if result.Error == nil {
		// Username exists
		c.JSON(http.StatusOK, gin.H{"available": false, "message": "Username is already taken"})
	} else {
		// Username doesn't exist
		c.JSON(http.StatusOK, gin.H{"available": true, "message": "Username is available"})
	}
}
