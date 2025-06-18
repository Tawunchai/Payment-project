package config

import (
	"fmt"
	"github.com/Tawunchai/work-project/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("work.db?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}
	fmt.Println("connected database")
	db = database
}

func SetupDatabase() {
	db.AutoMigrate(
		&entity.User{},
		&entity.UserRoles{},
		&entity.Genders{},
		&entity.Employee{},
		&entity.Report{},
		&entity.Review{},
		&entity.Like{},
		&entity.Calendar{},
		&entity.EVcharging{},
		&entity.GettingStarted{},
		&entity.Naw{},
		&entity.Status{},
		&entity.Type{},
	)

	GenderMale := entity.Genders{Gender: "Male"}
	GenderFemale := entity.Genders{Gender: "Female"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

	AdminRole := entity.UserRoles{RoleName: "Admin"}
	UserRole := entity.UserRoles{RoleName: "User"}

	db.FirstOrCreate(&AdminRole, &entity.UserRoles{RoleName: "Admin"})
	db.FirstOrCreate(&UserRole, &entity.UserRoles{RoleName: "User"})


	User1 := entity.User{
		Username:   "user1",
		FirstName:  "Janis",
		LastName:   "Green",
		Email:      "janis.green@example.com",
		Password:   "123",
		Profile:    "uploads/profile/profile6.jpg",
		GenderID:   1,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User1, entity.User{Username: "user1"})

	User2 := entity.User{
		Username:   "user2",
		FirstName:  "Chris",
		LastName:   "Taylor",
		Email:      "chris.taylor@example.com",
		Password:   "123",
		Profile:    "uploads/profile/profile5.jpeg",
		GenderID:   2,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User2, entity.User{Username: "user2"})

	User3 := entity.User{
		Username:   "user3",
		FirstName:  "Alex",
		LastName:   "Smith",
		Email:      "alex.smith@example.com",
		Password:   "123",
		Profile:    "uploads/profile/profile4.jpeg",
		GenderID:   1,
		UserRoleID: 2,
	}
	db.FirstOrCreate(&User3, entity.User{Username: "user3"})

	Admin := entity.User{
		Username:   "admin",
		FirstName:  "Kanyapron",
		LastName:   "KD",
		Email:      "Kanyapron@gmail.com",
		Password:   "123",
		Profile:    "uploads/profile/profile1.jpg",
		GenderID:   1,
		UserRoleID: 1,
	}
	db.FirstOrCreate(&Admin, entity.User{Username: "admin"})

	eid1 := uint(4)
	Employee1 := entity.Employee{
		Bio:        "Admid ",
		Experience: "5 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     25000,
		UserID:     &eid1,
	}
	db.FirstOrCreate(&Employee1, entity.Employee{UserID: &eid1})

}
