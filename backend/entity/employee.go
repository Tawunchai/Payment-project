package entity

import (

	"gorm.io/gorm"
)

type Employee struct {
	gorm.Model
	Bio			string 
	Experience  string 
	Education   string 
	Salary 		float64

	UserID 		*uint
	User   		*User `gorm:"foreignKey:UserID"`

}