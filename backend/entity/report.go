package entity

import (

	"gorm.io/gorm"
)

type Report struct {
	gorm.Model
	Picture			string 
	Description  string 
	
	EmployeeID 		*uint
	Employee   		*Employee `gorm:"foreignKey:EmployeeID"`
}