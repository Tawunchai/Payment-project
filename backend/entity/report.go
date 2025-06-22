package entity

import (
	"gorm.io/gorm"
)

type Report struct {
	gorm.Model
	Picture     string
	Description string
	Status      string

	UserID *uint
	User   *User `gorm:"foreignKey:UserID"`

	EmployeeID *uint
	Employee   *Employee `gorm:"foreignKey:EmployeeID"`
}
