package entity

import "gorm.io/gorm"

type Service struct {
	gorm.Model

	Email     string 
	Phone     string 
	Location  string 
	MapURL    string 
	
	EmployeeID *uint 
	Employee   Employee  `gorm:"foreignKey:EmployeeID"`
}
