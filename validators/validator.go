package validators

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

// var validate *validator.Validate
//
// func InitValidator() {
// 	validate = validator.New()
// }

func ValidateRequestBody(c *gin.Context, requestBody interface{}) bool {
	validate := validator.New()
	if err := c.ShouldBindJSON(requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return false
	}

	if validate == nil {
		log.Fatal("Validator is not initialized")
	}

	if requestBody == nil {
		log.Fatal("Request body is nil")
	}

	if err := validate.Struct(requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return false
	}

	return true
}
