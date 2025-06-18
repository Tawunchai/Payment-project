package entity

import (
	"time"

	"gorm.io/gorm"
)

type Review struct {
	gorm.Model
	Rating       uint  
	Comment      string 
	ReviewDate   time.Time 

	UserID       *uint 
	User         User    `gorm:"foreignKey:UserID"` 

	Like         []Like  `gorm:"foreignKey:ReviewID"` 
}