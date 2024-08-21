package handlers

import (
	"chookeye-core/database"
	"chookeye-core/lib"
	"chookeye-core/schemas"
	"chookeye-core/validators"
	"fmt"
	"net/http"

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

	c.JSON(http.StatusCreated, gin.H{"alert": alert})
}

func GetAlertsNearLocation2(latitude, longitude float64, radius float64) ([]schemas.Alert, error) {
	var alerts []schemas.Alert
	err := database.Store.Where("ST_Distance(location, ST_MakePoint(?, ?)) <= ?", latitude, longitude, radius).Find(&alerts).Error
	return alerts, err
}

func GetAlertsNearLocation4(latitude, longitude float64, radius float64) ([]schemas.Alert, error) {
	fmt.Println(latitude, longitude)
	var alerts []schemas.Alert

	// err := database.Store.Where(`
	//        6371000 * acos(
	//            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
	//            sin(radians(?)) * sin(radians(latitude))
	//        ) <= ?
	//    `, latitude, longitude, latitude, radius).Find(&alerts).Error
	//

	err := database.Store.Find(&alerts).Error

	fmt.Printf("Retrieved %v alerts from database", len(alerts))

	return alerts, err
}

func GetAlertsNearLocation(latitude, longitude float64, radius float64) ([]schemas.Alert, error) {
	fmt.Println("Latitude:", latitude, "Longitude:", longitude)
	var alerts []schemas.Alert

	// Using the Haversine formula to calculate distance
	err := database.Store.Where(`
        6371000 * acos(
            cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) +
            sin(radians(?)) * sin(radians(latitude))
        ) <= ?
    `, latitude, longitude, latitude, radius).Find(&alerts).Error

	if err != nil {
		fmt.Println("Error retrieving alerts:", err)
	}

	fmt.Printf("Retrieved %v alerts from database", len(alerts))

	return alerts, err
}

func GetAlertsNearLocation3(latitude, longitude float64, radius float64) ([]schemas.Alert, error) {
	fmt.Println(latitude, longitude)
	var alerts []schemas.Alert

	//https://en.wikipedia.org/wiki/Haversine_formula

	err := database.Store.Where(`
		6371000 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))
		<= ?
	`, latitude, longitude, latitude, radius).Find(&alerts).Error

	return alerts, err
}
