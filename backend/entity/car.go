package entity

import (
	"gorm.io/gorm"
)

type Car struct {
	gorm.Model
	Brand         string
	ModelCar      string
	SpecialNumber bool   // ✅ เพิ่มฟิลด์ใหม่
	LicensePlate  string
	City          string

	User []User `gorm:"many2many:user_cars;"`
}
