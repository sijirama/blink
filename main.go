package main

import (
	"chookeye-core/api"
	"chookeye-core/database"
	"log"

	"github.com/joho/godotenv"
)

func init() {
	// Load environment variables from .env file
	log.Println("Loading environment variables from .env file...")
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %s", err)
	}

	database.InitDatabase()
}

func main() {

	//setp server
	r := api.SetupRouter()
	r.Run()
}
