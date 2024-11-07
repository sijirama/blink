package handlers

import (
	"chookeye-core/database"
	"chookeye-core/schemas"
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
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

type RegisterDeviceTokenRequest struct {
	Token    string `json:"token" binding:"required"`
	Platform string `json:"platform" binding:"required"` // web, android, ios
	Browser  string `json:"browser,omitempty"`           // for web platform
}

func RegisterDeviceToken(c *gin.Context) {

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	var req RegisterDeviceTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//check if token already exists
	var existingToken schemas.DeviceToken
	result := database.Store.Where("token = ?", req.Token).First(&existingToken)

	if result.Error == nil {
		// Token exists, update it
		existingToken.LastUsed = time.Now()
		existingToken.Platform = req.Platform
		existingToken.Browser = req.Browser
		existingToken.IsValid = true

		if err := database.Store.Save(&existingToken).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update device token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Device token updated successfully"})
		return
	}

	// Create new token
	newToken := schemas.DeviceToken{
		UserID:   userID.(uint),
		Token:    req.Token,
		Platform: req.Platform,
		Browser:  req.Browser,
		LastUsed: time.Now(),
		IsValid:  true,
	}

	if err := database.Store.Create(&newToken).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register device token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Device token registered successfully"})
}

// Optional: Handler to remove device token when user logs out
func RemoveDeviceToken(c *gin.Context) {
	token := c.Query("token")

	userID, exists := c.Get("user_id")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Token is required"})
		return
	}

	result := database.Store.Model(&schemas.DeviceToken{}).
		Where("user_id = ? AND token = ?", userID, token).
		Update("is_valid", false)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove device token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Device token removed successfully"})
}
