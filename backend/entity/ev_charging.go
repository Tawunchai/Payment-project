package entity

import (
	"gorm.io/gorm"
)

type EVcharging struct {
	gorm.Model
	Name    string
	Description string
	Price   float64
	Picture string

	EmployeeID *uint
	Employee   Employee `gorm:"foreignKey:EmployeeID"`

	StatusID uint
	Status   *Status `gorm:"foreignKey:StatusID"`

	TypeID uint
	Type   *Type `gorm:"foreignKey:TypeID"`

	EVCabinetID uint     
	EVCabinet   *EVCabinet `gorm:"foreignKey:EVCabinetID"`

	EVChargingPayments []EVChargingPayment `gorm:"foreignKey:EVchargingID"`
}
