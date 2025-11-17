package entity

import (
	"time"

	"gorm.io/gorm"
)

type Payment struct {
	gorm.Model
	Date time.Time
	Amount float64
	ReferenceNumber string
	Picture string
	
	UserID 		*uint
	User   		*User `gorm:"foreignKey:UserID"`

	MethodID 		*uint
	Method   		*Method `gorm:"foreignKey:MethodID"`

	EVCabinetID 		*uint
	EVCabinet   		*EVCabinet `gorm:"foreignKey:EVCabinetID"`

	EVChargingPayments []EVChargingPayment `gorm:"foreignKey:PaymentID"`

	ChargingSessions []ChargingSession `gorm:"foreignKey:PaymentID"`
}