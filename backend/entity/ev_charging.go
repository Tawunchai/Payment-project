package entity

import (
	"gorm.io/gorm"
)

type EVcharging struct {
	gorm.Model
	Name    string
	Voltage float64
	Current float64
	Price   float64

	EmployeeID *uint
	Employee   Employee `gorm:"foreignKey:EmployeeID"`

	StatusID uint
	Status   *Status `gorm:"foreignKey:StatusID"`

	TypeID uint
	Type   *Type `gorm:"foreignKey:TypeID"`
}
