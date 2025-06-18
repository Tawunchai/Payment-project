package entity

import (
	"time"
	"gorm.io/gorm"
)

type Calendar struct {
	gorm.Model
	Title     		string    
	CalendarDate 	time.Time    

	EmployeeID 		*uint    
	Employee   		Employee `gorm:"foreignKey:EmployeeID"` 
}
