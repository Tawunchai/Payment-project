package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Username    string
	Password    string
	Email       string
	FirstName   string
	LastName    string
	Birthday    time.Time
	Profile     string
	PhoneNumber string

	UserRoleID uint
	UserRole   *UserRoles `gorm:"foreignKey: UserRoleID"`

	GenderID uint
	Gender   *Genders `gorm:"foreignKey: GenderID"`

	Employee *Employee `gorm:"foreignKey:UserID"`
}
