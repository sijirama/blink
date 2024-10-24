package main

import (
	"chookeye-core/api"
	"chookeye-core/database"
	"github.com/joho/godotenv"
	"log"
)

func init() {
	log.Println("Loading environment variables from .env file...")
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %s", err)
	}
	database.InitDatabase()
}

func main() {
	r := api.SetupRouter()
	r.Run()
}
