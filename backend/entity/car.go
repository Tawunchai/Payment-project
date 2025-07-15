package entity

import (
	"gorm.io/gorm"
)

type Car struct {
	gorm.Model
	Brand        string
	ModelCar     string
	LicensePlate string
	City string

	User    []User `gorm:"many2many:user_cars;"`
}
