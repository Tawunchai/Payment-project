package entity

import (

	"gorm.io/gorm"
)

type Naw struct {
	gorm.Model
	Picture		 string 
	Title		 string
	Description  string 
	
	EmployeeID 		*uint
	Employee   		*Employee `gorm:"foreignKey:EmployeeID"`
}