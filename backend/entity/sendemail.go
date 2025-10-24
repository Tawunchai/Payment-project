package entity

import "gorm.io/gorm"

type SendEmail struct {
	gorm.Model
	Email   string
	PassApp string
}
