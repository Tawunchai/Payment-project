package config

import (
	"fmt"
	"time"

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
		&entity.New{},
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
		Username:    "user1",
		FirstName:   "Janis",
		LastName:    "Green",
		Email:       "janis.green@example.com",
		Password:    "123",
		Profile:     "uploads/user/avatar1.jpg",
		PhoneNumber: "0935096372",
		GenderID:    1,
		UserRoleID:  2,
	}
	db.FirstOrCreate(&User1, entity.User{Username: "user1"})

	User2 := entity.User{
		Username:    "user2",
		FirstName:   "Chris",
		LastName:    "Taylor",
		Email:       "chris.taylor@example.com",
		Password:    "123",
		Profile:     "uploads/user/avatar2.jpg",
		PhoneNumber: "0895845671",
		GenderID:    2,
		UserRoleID:  2,
	}
	db.FirstOrCreate(&User2, entity.User{Username: "user2"})

	User3 := entity.User{
		Username:    "user3",
		FirstName:   "Alex",
		LastName:    "Smith",
		Email:       "alex.smith@example.com",
		Password:    "123",
		Profile:     "uploads/user/avatar3.png",
		PhoneNumber: "0938473272",
		GenderID:    1,
		UserRoleID:  2,
	}
	db.FirstOrCreate(&User3, entity.User{Username: "user3"})

	Admin1 := entity.User{
		Username:    "admin1",
		FirstName:   "Kanyapron",
		LastName:    "KD",
		Email:       "Kanyapron@gmail.com",
		Password:    "123",
		Profile:     "uploads/user/avatar4.jpg",
		PhoneNumber: "0981183502",
		GenderID:    1,
		UserRoleID:  1,
	}

	Admin2 := entity.User{
		Username:    "admin2",
		FirstName:   "JoJo",
		LastName:    "Smoke",
		Email:       "Smoke@gmail.com",
		Password:    "123",
		Profile:     "uploads/user/avatar1.jpg",
		PhoneNumber: "0981183502",
		GenderID:    2,
		UserRoleID:  1,
	}

	db.FirstOrCreate(&Admin1, entity.User{Username: "admin1"})
	db.FirstOrCreate(&Admin2, entity.User{Username: "admin2"})

	eid1 := uint(4)
	Employee1 := entity.Employee{
		Bio:        "Admid ",
		Experience: "5 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     25000,
		UserID:     &eid1,
	}

	eid2 := uint(5)
	Employee2 := entity.Employee{
		Bio:        "Admid Korean",
		Experience: "100 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     50000,
		UserID:     &eid2,
	}

	db.FirstOrCreate(&Employee1, entity.Employee{UserID: &eid1})
	db.FirstOrCreate(&Employee2, entity.Employee{UserID: &eid2})

	getting1 := entity.GettingStarted{
		Title:       "Best interest rates on the market",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  &eid1,
	}

	getting2 := entity.GettingStarted{
		Title:       "Prevent unstable prices",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  &eid1,
	}

	getting3 := entity.GettingStarted{
		Title:       "Best price on the market",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  &eid1,
	}

	db.FirstOrCreate(&getting1, entity.GettingStarted{Title: "1.Best interest rates on the market"})
	db.FirstOrCreate(&getting2, entity.GettingStarted{Title: "2.Prevent unstable prices"})
	db.FirstOrCreate(&getting3, entity.GettingStarted{Title: "3.Best price on the market"})

	news1 := entity.New{
		Picture:     "uploads/new/news1.png",
		Title:       "Personalized Profession Online Tutor on Your Schedule 1",
		Description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus atque voluptas labore nemo ipsam voluptatum maxime facere hic, eum illo, nobis inventore asperiores eaque exercitationem maiores laboriosam accusantium nihil quaerat.",
		EmployeeID:  &eid1,
	}

	news2 := entity.New{
		Picture:     "uploads/new/news2.png",
		Title:       "Personalized Profession Online Tutor on Your Schedule 2",
		Description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus atque voluptas labore nemo ipsam voluptatum maxime facere hic, eum illo, nobis inventore asperiores eaque exercitationem maiores laboriosam accusantium nihil quaerat.",
		EmployeeID:  &eid1,
	}

	// ใช้ FirstOrCreate เพื่อไม่ให้ซ้ำ
	db.FirstOrCreate(&news1, entity.New{Title: "Personalized Profession Online Tutor on Your Schedule 1"})
	db.FirstOrCreate(&news2, entity.New{Title: "Personalized Profession Online Tutor on Your Schedule 2"})

	uid1 := uint(1)
	uid2 := uint(2)
	uid3 := uint(3)

	Review1 := &entity.Review{
		Rating:     5,
		Comment:    "The zoo was incredibly well-maintained, and the animals looked happy and healthy. The staff were friendly and knowledgeable, always ready to share interesting facts about the animals. I loved the interactive exhibits, especially the feeding sessions with the giraffes! Its a great place for families, and theres something for everyone to enjoy. I can't wait to visit again!",
		ReviewDate: time.Now(),
		UserID:     &uid1,
	}

	Review2 := &entity.Review{
		Rating:     4,
		Comment:    "The zoo had a wide variety of animals, and the staff were helpful. However, some areas felt overcrowded, and a few enclosures looked outdated. The food options were decent, but a bit overpriced. Its a nice place to visit, but it could be even better with a few updates",
		ReviewDate: time.Now(),
		UserID:     &uid2,
	}

	Review3 := &entity.Review{
		Rating:     3,
		Comment:    "The animals were interesting, and the staff seemed to care about them. However, some enclosures felt too small, and the facilities could have been cleaner. The ticket price was a bit high for the experience provided. It was okay, but I wouldnt rush back.",
		ReviewDate: time.Now(),
		UserID:     &uid3,
	}

	db.FirstOrCreate(Review1, &entity.Review{UserID: &uid1})
	db.FirstOrCreate(Review2, &entity.Review{UserID: &uid2})
	db.FirstOrCreate(Review3, &entity.Review{UserID: &uid3})

	// สร้าง Status
	status1 := entity.Status{Status: "Available"}
	status2 := entity.Status{Status: "Unavailable"}

	db.FirstOrCreate(&status1, entity.Status{Status: "Available"})
	db.FirstOrCreate(&status2, entity.Status{Status: "Unavailable"})

	type1 := entity.Type{Type: "DC Fast Charger"}
	type2 := entity.Type{Type: "Level 2 Charger"}
	type3 := entity.Type{Type: "Level 1 Charger"}

	db.FirstOrCreate(&type1, entity.Type{Type: "DC Fast Charger"})
	db.FirstOrCreate(&type2, entity.Type{Type: "Level 2 Charger"})
	db.FirstOrCreate(&type3, entity.Type{Type: "Level 1 Charger"})

	ev_eid := uint(1)

	ev1 := entity.EVcharging{
		Name:       "Charger A1",
		Voltage:    400,
		Current:    200,
		Price:      15.50,
		EmployeeID: &ev_eid,
		StatusID:   status1.ID,
		TypeID:     type1.ID,
	}

	ev2 := entity.EVcharging{
		Name:       "Charger B2",
		Voltage:    240,
		Current:    100,
		Price:      10.75,
		EmployeeID: &ev_eid,
		StatusID:   status2.ID,
		TypeID:     type2.ID,
	}

	db.FirstOrCreate(&ev1, entity.EVcharging{Name: "Charger A1"})
	db.FirstOrCreate(&ev2, entity.EVcharging{Name: "Charger B2"})

	calendar_eid := uint(1) 

	calendar1 := entity.Calendar{
		Title:       "Staff Meeting",
		Location:    "Room A101",
		Description: "Monthly all-staff meeting",
		StartDate:   time.Date(2025, 7, 1, 9, 0, 0, 0, time.Local),
		EndDate:     time.Date(2025, 7, 1, 10, 30, 0, 0, time.Local),
		EmployeeID:  &calendar_eid,
	}

	calendar2 := entity.Calendar{
		Title:       "EV Maintenance",
		Location:    "EV Station Zone B",
		Description: "Routine maintenance for EV chargers",
		StartDate:   time.Date(2025, 7, 3, 13, 0, 0, 0, time.Local),
		EndDate:     time.Date(2025, 7, 3, 15, 0, 0, 0, time.Local),
		EmployeeID:  &calendar_eid,
	}

	db.FirstOrCreate(&calendar1, entity.Calendar{Title: "Staff Meeting"})
	db.FirstOrCreate(&calendar2, entity.Calendar{Title: "EV Maintenance"})

}
