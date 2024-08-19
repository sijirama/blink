package database

import (
	"chookeye-core/schemas"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

// Global variable to store the SQL DB instance
var Store *gorm.DB

func InitDatabase() {
	connectDB()
	err := schemas.CreateTables(Store)
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Database initialized Successfully")
}

// ConnectDB initializes the connection to the PostgreSQL database using Gorm
func connectDB() {
	// Retrieve the PostgreSQL connection parameters from environment variables
	host := os.Getenv("POSTGRES_HOST")
	port := os.Getenv("POSTGRES_PORT")
	user := os.Getenv("POSTGRES_USER")
	password := os.Getenv("POSTGRES_PASSWORD")
	dbname := os.Getenv("POSTGRES_DB")

	// Build the connection string
	dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)

	// Set Gorm configuration options, such as logger and naming strategy
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info), // Set the log level
		NamingStrategy: schema.NamingStrategy{
			SingularTable: true, // Disable plural table names
		},
	}

	// Open a connection to the PostgreSQL database using Gorm
	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		panic("failed to connect to the database: " + err.Error())
	}
	// Store the underlying *sql.DB instance for lower-level operations
	Store = db
	if err != nil {
		panic("failed to get the underlying SQL DB: " + err.Error())
	}
}
