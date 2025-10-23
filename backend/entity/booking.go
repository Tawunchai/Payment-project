package entity

import (
	"time"
	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model

	Date time.Time 

	UserID *uint  
	User   User   `gorm:"foreignKey:UserID"`

	EVCabinetID *uint     
	EVCabinet   EVCabinet `gorm:"foreignKey:EVCabinetID"`
}
