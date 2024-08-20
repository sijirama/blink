package handlers

import (
	. "chookeye-core/database"
	"chookeye-core/lib"
	"chookeye-core/schemas"
	"chookeye-core/validators"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type SignupRequest struct {
	Email    string           `json:"email" validate:"required,email"`
	Username string           `json:"username" validate:"required,min=3"`
	Password string           `json:"password" validate:"required,min=6"`
	Location schemas.Location `json:"location" validate:"required"`
}

func SignUp(c *gin.Context) {

	var user schemas.User

	if !validators.ValidateRequestBody(c, &user) {
		return
	}

	//WARN: Validate user input, this is actually optional we have done that already
	if err := validators.ValidateUser(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}
	user.Password = string(hashedPassword)

	if err := Store.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}

//----------------------------------------------------------------------------------

type SigninRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

func Signin(c *gin.Context) {
	var request SigninRequest

	if !validators.ValidateRequestBody(c, &request) {
		return
	}

	var user schemas.User
	if err := Store.Where("email = ?", request.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	token, err := lib.GenerateJWT(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating token"})
		return
	}

	// Set the token in an HTTP-only cookie
	c.SetCookie(
		"auth_token",
		token,
		int(time.Hour*24/time.Second), // max age in seconds
		"/",                           // path
		"",                            // domain
		false,                         // secure
		true,                          // httpOnly
	)

	//c.JSON(http.StatusOK, gin.H{"token": token})
	c.JSON(http.StatusOK, gin.H{"message": "Successfully signed in"})
}

//----------------------------------------------------------------------------------

func SignOut(c *gin.Context) {
	// Clear the auth cookie
	c.SetCookie(
		"auth_token",
		"",
		-1,    // max age
		"/",   // path
		"",    // domain
		false, // secure
		true,  // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{"message": "Successfully signed out"})
}

//----------------------------------------------------------------------------------

func RefreshToken(c *gin.Context) {

	// Get the token from the cookie
	tokenString, err := c.Cookie("auth_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authentication token"})
		return
	}

	claims, err := lib.ParseJWT(tokenString)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authentication token"})
	}

	userID := uint(claims["user_id"].(float64))

	// Generate new token
	newTokenString, err := lib.GenerateJWT(userID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new token"})
		return
	}

	// Set the new token in an HTTP-only cookie
	c.SetCookie(
		"auth_token",
		newTokenString,
		int(time.Hour*24/time.Second), // max age in seconds
		"/",                           // path
		"",                            // domain
		false,                         // secure
		true,                          // httpOnly
	)

	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed successfully"})
}
