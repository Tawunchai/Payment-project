package entity

import (
	"gorm.io/gorm"
)

type Modal struct {
	gorm.Model

	ModalName string

	BrandID 	*uint
	Brand   	*Brand `gorm:"foreignKey:BrandID"`
}