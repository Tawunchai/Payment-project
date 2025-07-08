package config

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/Tawunchai/work-project/entity"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB

type CustomLogger struct{}

func (l *CustomLogger) LogMode(level logger.LogLevel) logger.Interface {
	return l
}

func (l *CustomLogger) Info(ctx context.Context, msg string, args ...interface{}) {}

func (l *CustomLogger) Warn(ctx context.Context, msg string, args ...interface{}) {}

func (l *CustomLogger) Error(ctx context.Context, msg string, args ...interface{}) {
	if !strings.Contains(msg, "record not found") {
		log.Printf(msg, args...)
	}
}

func (l *CustomLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {
}

func DB() *gorm.DB {
	return db
}

func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open("work.db?cache=shared"), &gorm.Config{
		Logger: &CustomLogger{},
	})
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
		&entity.Payment{},
		&entity.Method{},
		&entity.EVChargingPayment{},
		&entity.Bank{},
	)

	GenderMale := entity.Genders{Gender: "Male"}
	GenderFemale := entity.Genders{Gender: "Female"}

	db.FirstOrCreate(&GenderMale, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&GenderFemale, &entity.Genders{Gender: "Female"})

	Method1 := entity.Method{Medthod: "QR Payment"}
	Method2 := entity.Method{Medthod: "Coin  Payment"}

	db.FirstOrCreate(&Method1, &entity.Method{Medthod: "QR Payment"})
	db.FirstOrCreate(&Method2, &entity.Method{Medthod: "Coin Payment"})

	AdminRole := entity.UserRoles{RoleName: "Admin"}
	Employee := entity.UserRoles{RoleName: "Employee"}
	UserRole := entity.UserRoles{RoleName: "User"}

	db.FirstOrCreate(&AdminRole, &entity.UserRoles{RoleName: "Admin"})
	db.FirstOrCreate(&Employee, &entity.UserRoles{RoleName: "Employee"})
	db.FirstOrCreate(&UserRole, &entity.UserRoles{RoleName: "User"})

	hashedPassword, err := HashPassword("123")
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	User1 := entity.User{
		Username:    "user1",
		FirstName:   "Janis",
		LastName:    "Green",
		Email:       "janis.green@example.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar1.jpg",
		PhoneNumber: "0935096372",
		Coin:        0,
		GenderID:    1,
		UserRoleID:  3,
	}
	db.FirstOrCreate(&User1, entity.User{Username: "user1"})

	User2 := entity.User{
		Username:    "user2",
		FirstName:   "Chris",
		LastName:    "Taylor",
		Email:       "chris.taylor@example.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar2.jpg",
		PhoneNumber: "0895845671",
		Coin:        0,
		GenderID:    2,
		UserRoleID:  3,
	}
	db.FirstOrCreate(&User2, entity.User{Username: "user2"})

	User3 := entity.User{
		Username:    "user3",
		FirstName:   "Alex",
		LastName:    "Smith",
		Email:       "alex.smith@example.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar3.png",
		PhoneNumber: "0938473272",
		Coin:        0,
		GenderID:    1,
		UserRoleID:  3,
	}
	db.FirstOrCreate(&User3, entity.User{Username: "user3"})

	Admin1 := entity.User{
		Username:    "admin1",
		FirstName:   "Kanyapron",
		LastName:    "KD",
		Email:       "Kanyapron@gmail.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar4.jpg",
		PhoneNumber: "0981183502",
		Coin:        0,
		GenderID:    1,
		UserRoleID:  1,
	}
	db.FirstOrCreate(&Admin1, entity.User{Username: "admin1"})

	Admin2 := entity.User{
		Username:    "admin2",
		FirstName:   "JoJo",
		LastName:    "Smoke",
		Email:       "Smoke@gmail.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar1.jpg",
		PhoneNumber: "0981183502",
		Coin:        0,
		GenderID:    2,
		UserRoleID:  1,
	}
	db.FirstOrCreate(&Admin2, entity.User{Username: "admin2"})

	EmployeeUser := entity.User{
		Username:    "employee1",
		FirstName:   "JoJo",
		LastName:    "Smoke",
		Email:       "Smoke@gmail.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar1.jpg",
		PhoneNumber: "0981183502",
		Coin:        0,
		GenderID:    2,
		UserRoleID:  2,
	}
	db.FirstOrCreate(&EmployeeUser, entity.User{Username: "employee1"})

	db.FirstOrCreate(&Admin1, entity.User{Username: "admin1"})
	db.FirstOrCreate(&Admin2, entity.User{Username: "admin2"})
	db.FirstOrCreate(&EmployeeUser, entity.User{Username: "employee1"})

	eid1 := uint(4)
	Employee1 := entity.Employee{
		Bio:        "Admid Thailand",
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

	eid3 := uint(6)
	Employee3 := entity.Employee{
		Bio:        "Admid Thailand",
		Experience: "5 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     25000,
		UserID:     &eid3,
	}

	db.FirstOrCreate(&Employee1, entity.Employee{UserID: &eid1})
	db.FirstOrCreate(&Employee2, entity.Employee{UserID: &eid2})
	db.FirstOrCreate(&Employee3, entity.Employee{UserID: &eid3})

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
		Price:      10,
		Picture:    "uploads/evcharging/product1.jpg",
		EmployeeID: &ev_eid,
		StatusID:   status1.ID,
		TypeID:     type1.ID,
	}

	ev2 := entity.EVcharging{
		Name:       "Charger B2",
		Voltage:    240,
		Current:    100,
		Price:      20,
		Picture:    "uploads/evcharging/product2.jpg",
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

	userID1 := uint(1)
	userID2 := uint(2)
	userID3 := uint(3)

	report1 := &entity.Report{
		Picture:     "uploads/reports/avatar1.jpg",
		Description: "พบว่าสัตว์ในสวนสัตว์มีสุขภาพดีและได้รับการดูแลอย่างดี มีการจัดแสดงที่น่าสนใจมากมาย",
		Status:      "Pending",
		UserID:      &userID1,
		EmployeeID:  nil, // ตั้งเป็น nil
	}

	report2 := &entity.Report{
		Picture:     "uploads/reports/avatar2.jpg",
		Description: "สวนสัตว์สะอาดและปลอดภัย แต่ควรเพิ่มพื้นที่สำหรับสัตว์บางชนิดให้มากขึ้น",
		Status:      "Pending",
		UserID:      &userID2,
		EmployeeID:  nil,
	}

	report3 := &entity.Report{
		Picture:     "uploads/reports/avatar3.png",
		Description: "สถานที่และอุปกรณ์บางส่วนเริ่มทรุดโทรม ควรได้รับการปรับปรุงเพื่อความปลอดภัย",
		Status:      "Pending",
		UserID:      &userID3,
		EmployeeID:  nil,
	}

	// สร้างหรือดึงข้อมูลที่มีอยู่แล้ว โดยใช้ UserID ตรวจสอบข้อมูลซ้ำ
	db.FirstOrCreate(report1, entity.Report{UserID: &userID1})
	db.FirstOrCreate(report2, entity.Report{UserID: &userID2})
	db.FirstOrCreate(report3, entity.Report{UserID: &userID3})

	userID := uint(1)
	methodID := uint(1)
	if err := SeedPayments(db, userID, methodID); err != nil {
		log.Fatalf("Seed payments failed: %v", err)
	}

	BankingManager := entity.Bank{
		PromptPay: "0935096372",
		Manager: "MR. TAWANCHAI BURAKHON",
		Banking: "006",
	}
	db.FirstOrCreate(&BankingManager, &entity.Bank{PromptPay: "0935096372"})

}

func SeedPayments(db *gorm.DB, userID uint, methodID uint) error {
	var count int64
	if err := db.Model(&entity.Payment{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to count payments: %w", err)
	}

	if count > 0 {
		fmt.Println("Payments already seeded, skipping creation.")
		return nil
	}

	for month := 1; month <= 12; month++ {
		for day := 1; day <= 10; day++ {
			createdAt := time.Date(2025, time.Month(month), day, 0, 0, 0, 0, time.UTC)

			price1 := 50 + day*2      // เช่น 52, 54, 56, ...
			price2 := 100 + month*3   // เช่น 103, 106, 109, ...
			amount := price1 + price2 // รวมราคา

			payment := entity.Payment{
				Date:            createdAt,
				Amount:          float64(amount),
				ReferenceNumber: "12345",
				Picture:         "uploads/payment/1751999510090771300.jpg",
				UserID:          &userID,
				MethodID:        &methodID,
			}

			if err := db.Create(&payment).Error; err != nil {
				return fmt.Errorf("failed to create payment: %w", err)
			}

			// ดึงข้อมูลราคาต่อหน่วยจาก EVcharging
			var ev1, ev2 entity.EVcharging
			if err := db.First(&ev1, 1).Error; err != nil {
				return fmt.Errorf("failed to find EVcharging 1: %w", err)
			}
			if err := db.First(&ev2, 2).Error; err != nil {
				return fmt.Errorf("failed to find EVcharging 2: %w", err)
			}

			// คำนวณ quantity = price / rate
			quantity1 := float64(price1) / ev1.Price
			quantity2 := float64(price2) / ev2.Price

			evcp1 := entity.EVChargingPayment{
				EVchargingID: 1,
				PaymentID:    payment.ID,
				Price:        float64(price1),
				Quantity:     quantity1,
			}
			if err := db.FirstOrCreate(&evcp1, entity.EVChargingPayment{
				EVchargingID: 1,
				PaymentID:    payment.ID,
			}).Error; err != nil {
				return fmt.Errorf("failed to create evchargingpayment 1: %w", err)
			}

			evcp2 := entity.EVChargingPayment{
				EVchargingID: 2,
				PaymentID:    payment.ID,
				Price:        float64(price2),
				Quantity:     quantity2,
			}
			if err := db.FirstOrCreate(&evcp2, entity.EVChargingPayment{
				EVchargingID: 2,
				PaymentID:    payment.ID,
			}).Error; err != nil {
				return fmt.Errorf("failed to create evchargingpayment 2: %w", err)
			}
		}
	}
	return nil
}
