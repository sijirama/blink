package handlers

import (
	"chookeye-core/broadcast"
	"chookeye-core/database"
	"chookeye-core/lib"
	"chookeye-core/schemas"
	"chookeye-core/validators"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type createAlertRequest struct {
	Content  string           `json:"content" validate:"required"`
	Location schemas.Location `json:"location"`
}

func CreateAlertHandler(c *gin.Context) {

	var requestBody createAlertRequest

	if !validators.ValidateRequestBody(c, &requestBody) {
		return
	}

	// Retrieve the user ID from the context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	// If location is not provided, use the user's saved location from the database
	var location schemas.Location
	if requestBody.Location == (schemas.Location{}) {
		// Fetch user from the database to get the location
		var user schemas.User
		if err := database.Store.First(&user, userID).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user data"})
			return
		}
		location = user.Location
	} else {
		location = requestBody.Location
	}

	// Use AI to generate the urgency, status, and description
	formattedTitle := lib.FormatTitle(requestBody.Content)                 // Placeholder function
	description := lib.GenerateDescriptionFromContent(requestBody.Content) // Placeholder function
	urgency := lib.GenerateUrgencyFromContent(requestBody.Content)         // This is a placeholder function
	radius := 1.0                                                          // 1 km radius

	// Create the alert
	alert := schemas.Alert{
		UserID:      userID.(uint),
		Location:    location,
		Title:       formattedTitle,
		Description: description,
		Status:      "active", // Default status
		Urgency:     urgency,
	}

	if err := database.Store.Create(&alert).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create alert"})
		return
	}

	log.Println("broadcasting .....")
	broadcast.TriggerNewAlertFromBackend(alert.Location.Latitude, alert.Location.Longitude, radius, alert)

	c.JSON(http.StatusCreated, gin.H{"alert": alert})
}

func GetAlertByIDHandler(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID"})
		return
	}

	var alert schemas.Alert
	if err := database.Store.First(&alert, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"alert": alert})
}
