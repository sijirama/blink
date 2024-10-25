package handlers

import (
	"chookeye-core/database"
	"chookeye-core/schemas"
	"chookeye-core/websocket"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type CommentWithUser struct {
	User            schemas.User `json:"user"`
	schemas.Comment `json:"comment"`
}

func GetComentsByIdHandler(c *gin.Context) {

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

	var comments []schemas.Comment
	if err := database.Store.Preload("User").Where("alert_id = ?", id).Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch comments"})
		return
	}

	c.JSON(http.StatusOK, comments)
}

type CreateCommentRequest struct {
	Content string `json:"content" binding:"required" validate:"required"`
}

func CreateCommentHandler(c *gin.Context) {
	idStr := c.Param("id")
	alertID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid alert ID"})
		return
	}

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: content is required"})
		return
	}

	// Check if alert exists
	var alert schemas.Alert
	if err := database.Store.First(&alert, alertID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Alert not found"})
		return
	}

	// if(alert.Status) //TODO: must be active to add comments

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
		return
	}

	comment := schemas.Comment{
		Content: req.Content,
	}

	// Create new comment
	comment.AlertID = uint(alertID)
	comment.UserID = userID.(uint)
	comment.CreatedAt = time.Now()
	comment.UpdatedAt = time.Now()

	// Save comment to database
	if err := database.Store.Preload("User").Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create comment"})
		return
	}

	//TODO: broadcast new comment to all connected members of that chat
	websocket.BroadcastNewComment(alert.ID, comment)
	c.JSON(http.StatusCreated, comment)
}
