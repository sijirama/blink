package schemas

import (
	"gorm.io/gorm"
	"time"
)

type Location struct {
	Latitude  float64 `gorm:"not null"`
	Longitude float64 `gorm:"not null"`
}

type User struct {
	ID            uint           `gorm:"primaryKey"`
	Email         string         `gorm:"uniqueIndex;not null"`
	Username      string         `gorm:"uniqueIndex;not null"`
	Password      string         `gorm:"not null"`
	Location      Location       `gorm:"embedded"`
	Alerts        []Alert        `gorm:"foreignKey:UserID"`
	Notifications []Notification `gorm:"foreignKey:UserID"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

type Alert struct {
	ID            uint           `gorm:"primaryKey"`
	UserID        uint           `gorm:"not null"`
	Location      Location       `gorm:"embedded"`
	Title         string         `gorm:"not null"`
	Description   string         `gorm:"not null"`
	Status        string         `gorm:"not null"` // e.g., "active", "resolved", etc.
	Urgency       int            `gorm:"not null"` // e.g., 1-5 scale
	Verifications []Verification `gorm:"foreignKey:AlertID"`
	Flags         []Flag         `gorm:"foreignKey:AlertID"`
	Comments      []Comment      `gorm:"foreignKey:AlertID"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
	ExpiresAt     time.Time // Add this field
}

type Flag struct {
	ID        uint   `gorm:"primaryKey"`
	AlertID   uint   `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	Type      string `gorm:"type:varchar(20);not null"` // Store as string
	CreatedAt time.Time
}

type Verification struct {
	ID        uint `gorm:"primaryKey"`
	AlertID   uint `gorm:"not null"`
	UserID    uint `gorm:"not null"`
	CreatedAt time.Time
}

type Comment struct {
	ID        uint   `gorm:"primaryKey"`
	AlertID   uint   `gorm:"not null"`
	UserID    uint   `gorm:"not null"`
	Content   string `gorm:"not null"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Notification struct {
	ID        uint   `gorm:"primaryKey"`
	UserID    uint   `gorm:"not null"`
	AlertID   uint   `gorm:"not null"`
	Message   string `gorm:"not null"`
	Seen      bool   `gorm:"default:false"`
	CreatedAt time.Time
}

func CreateTables(db *gorm.DB) error {
	err := db.AutoMigrate(&User{}, &Alert{}, &Verification{}, &Comment{}, &Notification{}, &Flag{})
	if err != nil {
		return err
	}

	return nil
}
