package entity

import (

	"gorm.io/gorm"
)

type GettingStarted struct {
	gorm.Model
	Title  		 string
	Description  string 
	
	EmployeeID 		*uint
	Employee   		*Employee `gorm:"foreignKey:EmployeeID"`
}