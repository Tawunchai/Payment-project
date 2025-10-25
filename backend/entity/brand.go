package entity

import (
	"gorm.io/gorm"
)

type Brand struct {
	gorm.Model
	BrandName string

	Modal []Modal `gorm:"foreignKey:BrandID"`
}