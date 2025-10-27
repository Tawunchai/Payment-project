package entity

import (
	"time"
	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model
	StartDate   time.Time
	EndDate     time.Time

	UserID      *uint
	User        User       `gorm:"foreignKey:UserID"`

	EVCabinetID *uint
	EVCabinet   EVCabinet  `gorm:"foreignKey:EVCabinetID"`

	IsEmailSent bool `gorm:"default:false"` // ✅ ป้องกันส่งซ้ำ
}