package entity

import (
	"gorm.io/gorm"
)

type Bank struct {
	gorm.Model
	PromptPay string
	Manager string
	Banking string
	Minimum uint
}
