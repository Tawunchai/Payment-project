package entity

import (
	"time"

	"gorm.io/gorm"
)

type PaymentCoin struct {
	gorm.Model
	Date time.Time
	Amount float64
	ReferenceNumber string
	Picture string
	
	UserID 		uint
	User   		*User `gorm:"foreignKey:UserID"`
}