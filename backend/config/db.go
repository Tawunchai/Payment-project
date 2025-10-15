package config

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/Tawunchai/work-project/entity"
	"github.com/glebarez/sqlite" // pure Go driver (ไม่ต้อง CGO)
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB

// --------------------- Custom Logger ---------------------
type CustomLogger struct{}

func (l *CustomLogger) LogMode(level logger.LogLevel) logger.Interface { return l }
func (l *CustomLogger) Info(ctx context.Context, msg string, args ...interface{})  {}
func (l *CustomLogger) Warn(ctx context.Context, msg string, args ...interface{})  {}
func (l *CustomLogger) Error(ctx context.Context, msg string, args ...interface{}) {
	if !strings.Contains(msg, "record not found") {
		log.Printf(msg, args...)
	}
}
func (l *CustomLogger) Trace(ctx context.Context, begin time.Time, fc func() (string, int64), err error) {}

// --------------------- Helpers ---------------------
func DB() *gorm.DB { return db }

// --------------------- Connect DB ---------------------
func ConnectionDB() {
	// Demo (ephemeral fs) → ข้อมูลหายเมื่อ redeploy
	dsn := "file:work.db?cache=shared&_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)"
	// ถ้าใช้ Persistent Disk ของ Render (Add Disk, Mount Path: /var/data) ให้ใช้:
	// dsn := "file:/var/data/work.db?cache=shared&_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)"

	database, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		Logger: &CustomLogger{},
	})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}
	fmt.Println("connected database:", dsn)
	db = database
}

// --------------------- Migrate & Seed ---------------------
func SetupDatabase() {
	if err := db.AutoMigrate(
		&entity.User{},
		&entity.Car{},
		&entity.PaymentCoin{},
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
	); err != nil {
		panic("auto-migrate error: " + err.Error())
	}
	seed()
}

func seed() {
	// === Genders ===
	genderMale := entity.Genders{Gender: "Male"}
	genderFemale := entity.Genders{Gender: "Female"}
	db.FirstOrCreate(&genderMale, entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&genderFemale, entity.Genders{Gender: "Female"})

	// === Methods ===
	method1 := entity.Method{Medthod: "QR Payment"}
	method2 := entity.Method{Medthod: "Coin Payment"}
	db.FirstOrCreate(&method1, entity.Method{Medthod: "QR Payment"})
	db.FirstOrCreate(&method2, entity.Method{Medthod: "Coin Payment"})

	// === Roles ===
	roleAdmin := entity.UserRoles{RoleName: "Admin"}
	roleEmployee := entity.UserRoles{RoleName: "Employee"}
	roleUser := entity.UserRoles{RoleName: "User"}
	db.FirstOrCreate(&roleAdmin, entity.UserRoles{RoleName: "Admin"})
	db.FirstOrCreate(&roleEmployee, entity.UserRoles{RoleName: "Employee"})
	db.FirstOrCreate(&roleUser, entity.UserRoles{RoleName: "User"})

	// === Users (ใช้ HashPassword จาก config/hash.go) ===
	hashedPassword, err := HashPassword("123")
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	user1 := entity.User{
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
	user2 := entity.User{
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
	user3 := entity.User{
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
	admin1 := entity.User{
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
	admin2 := entity.User{
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
	employeeUser := entity.User{
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
	db.FirstOrCreate(&user1, entity.User{Username: "user1"})
	db.FirstOrCreate(&user2, entity.User{Username: "user2"})
	db.FirstOrCreate(&user3, entity.User{Username: "user3"})
	db.FirstOrCreate(&admin1, entity.User{Username: "admin1"})
	db.FirstOrCreate(&admin2, entity.User{Username: "admin2"})
	db.FirstOrCreate(&employeeUser, entity.User{Username: "employee1"})

	// === Employees ===
	eid1 := uint(4)
	eid2 := uint(5)
	eid3 := uint(6)

	emp1 := entity.Employee{
		Bio:        "Admid Thailand",
		Experience: "5 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     25000,
		UserID:     &eid1,
	}
	emp2 := entity.Employee{
		Bio:        "Admid Korean",
		Experience: "100 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     50000,
		UserID:     &eid2,
	}
	emp3 := entity.Employee{
		Bio:        "Admid Thailand",
		Experience: "5 years of experience as a admin with Tesla company",
		Education:  "Master degree of marketting at Harvard university",
		Salary:     25000,
		UserID:     &eid3,
	}
	db.FirstOrCreate(&emp1, entity.Employee{UserID: &eid1})
	db.FirstOrCreate(&emp2, entity.Employee{UserID: &eid2})
	db.FirstOrCreate(&emp3, entity.Employee{UserID: &eid3})

	// === GettingStarted ===
	get1 := entity.GettingStarted{
		Title:       "Best interest rates on the market",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  &eid1,
	}
	get2 := entity.GettingStarted{
		Title:       "Prevent unstable prices",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  &eid1,
	}
	get3 := entity.GettingStarted{
		Title:       "Best price on the market",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  &eid1,
	}
	db.FirstOrCreate(&get1, entity.GettingStarted{Title: "1.Best interest rates on the market"})
	db.FirstOrCreate(&get2, entity.GettingStarted{Title: "2.Prevent unstable prices"})
	db.FirstOrCreate(&get3, entity.GettingStarted{Title: "3.Best price on the market"})

	// === News ===
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
	db.FirstOrCreate(&news1, entity.New{Title: "Personalized Profession Online Tutor on Your Schedule 1"})
	db.FirstOrCreate(&news2, entity.New{Title: "Personalized Profession Online Tutor on Your Schedule 2"})

	// === Reviews ===
	uid1 := uint(1)
	uid2 := uint(2)
	uid3 := uint(3)
	review1 := &entity.Review{
		Rating:     5,
		Comment:    "The zoo was incredibly well-maintained...",
		ReviewDate: time.Now(),
		UserID:     &uid1,
	}
	review2 := &entity.Review{
		Rating:     4,
		Comment:    "The zoo had a wide variety of animals...",
		ReviewDate: time.Now(),
		UserID:     &uid2,
	}
	review3 := &entity.Review{
		Rating:     3,
		Comment:    "The animals were interesting...",
		ReviewDate: time.Now(),
		UserID:     &uid3,
	}
	db.FirstOrCreate(review1, &entity.Review{UserID: &uid1})
	db.FirstOrCreate(review2, &entity.Review{UserID: &uid2})
	db.FirstOrCreate(review3, &entity.Review{UserID: &uid3})

	// === Status & Types ===
	statusAvailable := entity.Status{Status: "Available"}
	statusUnavailable := entity.Status{Status: "Unavailable"}
	db.FirstOrCreate(&statusAvailable, entity.Status{Status: "Available"})
	db.FirstOrCreate(&statusUnavailable, entity.Status{Status: "Unavailable"})

	type1 := entity.Type{Type: "DC Fast Charger"}
	type2 := entity.Type{Type: "Level 2 Charger"}
	type3 := entity.Type{Type: "Level 1 Charger"}
	db.FirstOrCreate(&type1, entity.Type{Type: "DC Fast Charger"})
	db.FirstOrCreate(&type2, entity.Type{Type: "Level 2 Charger"})
	db.FirstOrCreate(&type3, entity.Type{Type: "Level 1 Charger"})

	// === EVcharging ===
	ev_eid := uint(1)
	ev1 := entity.EVcharging{
		Name:        "Charger A1",
		Description: "Charger A1 is Good",
		Price:       10,
		Picture:     "uploads/evcharging/product1.jpg",
		EmployeeID:  &ev_eid,
		StatusID:    statusAvailable.ID,
		TypeID:      type1.ID,
	}
	ev2 := entity.EVcharging{
		Name:        "Charger B2",
		Description: "Charger B2 is Bad",
		Price:       20,
		Picture:     "uploads/evcharging/product2.jpg",
		EmployeeID:  &ev_eid,
		StatusID:    statusUnavailable.ID,
		TypeID:      type2.ID,
	}
	db.FirstOrCreate(&ev1, entity.EVcharging{Name: "Charger A1"})
	db.FirstOrCreate(&ev2, entity.EVcharging{Name: "Charger B2"})

	// === Calendars ===
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

	// === Reports ===
	userID1 := uint(1)
	userID2 := uint(2)
	userID3 := uint(3)
	report1 := &entity.Report{
		Picture:     "uploads/reports/avatar1.jpg",
		Description: "พบว่าสัตว์ในสวนสัตว์มีสุขภาพดี...",
		Status:      "Pending",
		UserID:      &userID1,
		EmployeeID:  nil,
	}
	report2 := &entity.Report{
		Picture:     "uploads/reports/avatar2.jpg",
		Description: "สวนสัตว์สะอาดและปลอดภัย...",
		Status:      "Pending",
		UserID:      &userID2,
		EmployeeID:  nil,
	}
	report3 := &entity.Report{
		Picture:     "uploads/reports/avatar3.png",
		Description: "สถานที่และอุปกรณ์บางส่วนเริ่มทรุดโทรม...",
		Status:      "Pending",
		UserID:      &userID3,
		EmployeeID:  nil,
	}
	db.FirstOrCreate(report1, entity.Report{UserID: &userID1})
	db.FirstOrCreate(report2, entity.Report{UserID: &userID2})
	db.FirstOrCreate(report3, entity.Report{UserID: &userID3})

	// === Payments & Bank ===
	userID := uint(1)
	methodID := uint(1)
	if err := SeedPayments(db, userID, methodID); err != nil {
		log.Fatalf("Seed payments failed: %v", err)
	}

	banking := entity.Bank{
		PromptPay: "0935096372",
		Manager:   "MR. TAWANCHAI BURAKHON",
		Banking:   "006",
		Minimum:   100,
	}
	db.FirstOrCreate(&banking, &entity.Bank{PromptPay: "0935096372"})

	payment1 := entity.PaymentCoin{
		Date:            time.Now(),
		Amount:          100.00,
		ReferenceNumber: "REF2024071401",
		Picture:         "uploads/payment/1751999510090771300.jpg",
		UserID:          uint(1),
	}
	db.FirstOrCreate(&payment1, entity.PaymentCoin{ReferenceNumber: "REF2024071401"})

	payment2 := entity.PaymentCoin{
		Date:            time.Now().Add(-24 * time.Hour),
		Amount:          250.50,
		ReferenceNumber: "REF2024071402",
		Picture:         "uploads/payment/1751999510090771300.jpg",
		UserID:          uint(1),
	}
	db.FirstOrCreate(&payment2, entity.PaymentCoin{ReferenceNumber: "REF2024071402"})
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
			price1 := 50 + day*2
			price2 := 100 + month*3
			amount := price1 + price2

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

			var ev1, ev2 entity.EVcharging
			if err := db.First(&ev1, 1).Error; err != nil {
				return fmt.Errorf("failed to find EVcharging 1: %w", err)
			}
			if err := db.First(&ev2, 2).Error; err != nil {
				return fmt.Errorf("failed to find EVcharging 2: %w", err)
			}

			q1 := float64(price1) / ev1.Price
			q2 := float64(price2) / ev2.Price

			evcp1 := entity.EVChargingPayment{
				EVchargingID: 1, PaymentID: payment.ID,
				Price: float64(price1), Quantity: q1,
			}
			if err := db.FirstOrCreate(&evcp1, entity.EVChargingPayment{
				EVchargingID: 1, PaymentID: payment.ID,
			}).Error; err != nil {
				return fmt.Errorf("failed to create evchargingpayment 1: %w", err)
			}

			evcp2 := entity.EVChargingPayment{
				EVchargingID: 2, PaymentID: payment.ID,
				Price: float64(price2), Quantity: q2,
			}
			if err := db.FirstOrCreate(&evcp2, entity.EVChargingPayment{
				EVchargingID: 2, PaymentID: payment.ID,
			}).Error; err != nil {
				return fmt.Errorf("failed to create evchargingpayment 2: %w", err)
			}
		}
	}
	return nil
}
