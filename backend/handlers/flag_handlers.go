package handlers

import (
	"chookeye-core/database"
	"chookeye-core/schemas"
	"chookeye-core/websocket"
	"fmt"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/zishang520/socket.io/v2/socket"
)

type createFlagRequest struct {
	Type string `json:"type" binding:"required,oneof=Verify Dismiss"`
}

func CreateFlagHandler(c *gin.Context) {

	var requestBody createFlagRequest

	fmt.Println(c)

	//Bind the request body and ensure it contains the required fields
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body", "err": err})
		return
	}

	// Retrieve the user ID from the context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// Retrieve the alert ID from the URL parameter
	alertID := c.Param("alertId")
	var alert schemas.Alert
	if err := database.Store.First(&alert, alertID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	// Check if the user has already flagged this alert, regardless of flag type
	var existingFlag schemas.Flag
	if err := database.Store.Where("alert_id = ? AND user_id = ?", alert.ID, userID).First(&existingFlag).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User has already flagged this alert"})
		return
	}

	// Create the flag
	flag := schemas.Flag{
		AlertID: alert.ID,
		UserID:  userID.(uint),
		Type:    requestBody.Type,
	}

	// Save the flag to the database
	if err := database.Store.Create(&flag).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create flag"})
		return
	}

	var updatedAlert schemas.Alert
	if err := database.Store.Preload("Flags").First(&updatedAlert, flag.AlertID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	log.Printf("\nEmitting to room alert-%s \n", alertID)
	err := websocket.SocketServer.To(socket.Room(fmt.Sprintf(`alert-%v`, alertID))).Emit("alert_updated", updatedAlert)
	if err != nil {
		log.Printf("alert-updated: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{"flag": flag})
}
