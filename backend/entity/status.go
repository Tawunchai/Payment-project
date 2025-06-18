package entity

import "gorm.io/gorm"

type Status struct {
	gorm.Model
	Status string

	EVcharging []EVcharging `gorm:"foreignKey:StatusID"`
}
