package websocket

import (
	"chookeye-core/database"
	"chookeye-core/schemas"
	"fmt"
	"log"
	//"time"

	"github.com/zishang520/socket.io/v2/socket"
)

var commentServer *socket.Socket

func registerCommentEventHandlers(io *socket.Server) {
	io.On("connection", handleCommentConnection)
}

func handleCommentConnection(clients ...any) {
	commentClient := clients[0].(*socket.Socket)

	commentServer = commentClient

	commentClient.On("join_comment_room", func(args ...any) {
		handleJoinCommentRoom(commentClient, args...)
	})

}

func handleJoinCommentRoom(CommentClient *socket.Socket, args ...any) {

	if len(args) == 0 {
		log.Printf("Error: No alert ID provided")
		return
	}

	alertId := args[0]
	roomName := fmt.Sprintf("comments-%v", alertId)
	log.Printf("Client %s is joining comment room %s", CommentClient.Id(), roomName)

	CommentClient.Join(socket.Room(roomName))

	CommentClient.Emit("joined_comment_room", map[string]interface{}{
		"room":   roomName,
		"status": "success",
	})
}

func BroadcastNewComment(alertID uint, comment schemas.Comment) {

	// Fetch user information for the comment
	var user schemas.User
	if err := database.Store.First(&user, comment.UserID).Error; err != nil {
		log.Printf("Error fetching user for comment broadcast: %v", err)
		return
	}

	// Create a response object with necessary information
	// commentResponse := schemas.Comment{
	// 	ID:        comment.ID,
	// 	Content:   comment.Content,
	// 	CreatedAt: comment.CreatedAt,
	// 	UserID:    comment.UserID,
	// }

	// log.Printf("Broadcasting new comment straight from abi to room: %s, socket: %v", roomName, commentServer)
	//
	// if commentServer != nil {
	// 	//return
	// }

	roomName := fmt.Sprintf("comments-%v", alertID)
	room := socket.Room(roomName)

	fmt.Printf("%v %v %v \n", commentServer.Id(), room, roomName)

	//err := commentServer.To(socket.Room(roomName)).Emit(roomName, comment)
	err := commentServer.Emit(roomName, comment)

	if err != nil {
		log.Printf("Error broadcasting comment: %v", err)
	}

	fmt.Println("Sent to the shit place")
}
