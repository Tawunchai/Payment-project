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

	Report []Report `gorm:"foreignKey:EmployeeID"`

	New []Naw `gorm:"foreignKey:EmployeeID"`

	GettingStarted []GettingStarted `gorm:"foreignKey:EmployeeID"`

	Calendar []Calendar `gorm:"foreignKey:EmployeeID"`
}