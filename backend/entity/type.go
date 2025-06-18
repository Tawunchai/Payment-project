package entity

import "gorm.io/gorm"

type Type struct {
	gorm.Model
	Type string

	EVcharging []EVcharging `gorm:"foreignKey:TypeID"`
}
