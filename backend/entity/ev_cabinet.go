package entity

import (
	"gorm.io/gorm"
)

type EVCabinet struct {
	gorm.Model

	Name        string 
	Description string  
	Location    string  
	Status      string  

	Latitude    float64 
	Longitude   float64
	Image       string  


	EVcharging  []EVcharging `gorm:"foreignKey:EVCabinetID"`  
	Booking     []Booking    `gorm:"foreignKey:EVCabinetID"`  

	EmployeeID  *uint       
	Employee    Employee     `gorm:"foreignKey:EmployeeID"`
}
