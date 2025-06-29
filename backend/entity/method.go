package entity

import (

	"gorm.io/gorm"
)

type Method struct {
	gorm.Model
	Medthod		 string 
	
	Payment []Payment `gorm:"foreignKey:MethodID"`
}