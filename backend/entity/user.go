package entity

import (

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username    string
	Password    string
	Email       string
	FirstName   string
	LastName    string
	Profile     string
	PhoneNumber string
	Coin float64

	UserRoleID uint
	UserRole   *UserRoles `gorm:"foreignKey: UserRoleID"`

	GenderID uint
	Gender   *Genders `gorm:"foreignKey: GenderID"`

	Employees []Employee `gorm:"foreignKey:UserID"`

	Report []Report `gorm:"foreignKey:UserID"`

	Review []Review `gorm:"foreignKey:UserID"`

	Payment []Payment `gorm:"foreignKey:UserID"`

	Booking []Booking `gorm:"foreignKey:UserID"`

	Car    []Car `gorm:"many2many:user_cars;"`
}
