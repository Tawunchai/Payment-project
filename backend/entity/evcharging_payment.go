package entity

import "gorm.io/gorm"

type EVChargingPayment struct {
	gorm.Model

	EVchargingID uint
	EVcharging   EVcharging `gorm:"foreignKey:EVchargingID"`

	PaymentID uint
	Payment   Payment `gorm:"foreignKey:PaymentID"`

	Price float64
}
