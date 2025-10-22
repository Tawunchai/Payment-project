package config

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"github.com/Tawunchai/work-project/entity"
	"github.com/glebarez/sqlite" // ✅ pure Go driver (no CGO)
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

// เลือก DSN อัตโนมัติ: ถ้ามีดิสก์ถาวรให้ใช้ /var/data, ไม่งั้นใช้ไฟล์โลคัล
func dsn() string {
	// คุณสามารถ set ENV DATA_DIR=/var/data ใน Render ก็ได้
	dataDir := os.Getenv("DATA_DIR")
	if dataDir == "" {
		if st, err := os.Stat("/var/data"); err == nil && st.IsDir() {
			dataDir = "/var/data"
		}
	}
	if dataDir != "" {
		return fmt.Sprintf("file:%s/work.db?cache=shared&_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)", dataDir)
	}
	// fallback: ephemeral fs → ข้อมูลหายเมื่อ redeploy
	return "file:work.db?cache=shared&_pragma=busy_timeout(5000)&_pragma=journal_mode(WAL)"
}

// --------------------- Connect DB ---------------------
func ConnectionDB() {
	database, err := gorm.Open(sqlite.Open(dsn()), &gorm.Config{
		Logger: &CustomLogger{},
	})
	if err != nil {
		panic("failed to connect database: " + err.Error())
	}
	db = database
	fmt.Println("connected database")

	// เปิด foreign keys และย้ำ WAL/busy_timeout (สำรองจาก DSN)
	sqlDB, _ := db.DB()
	_ = enableSQLitePragmas(sqlDB)
}

func enableSQLitePragmas(sqlDB *sql.DB) error {
	if sqlDB == nil {
		return nil
	}
	_, _ = sqlDB.Exec(`PRAGMA foreign_keys = ON;`)
	_, _ = sqlDB.Exec(`PRAGMA journal_mode = WAL;`)
	_, _ = sqlDB.Exec(`PRAGMA busy_timeout = 5000;`)
	return nil
}

// --------------------- Migrate & Seed ---------------------
func SetupDatabase() {
	// AutoMigrate
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
		log.Fatalf("automigrate failed: %v", err)
	}

	// Master data (idempotent)
	seedMasters(db)

	// Seed Users/Employees/Cars… only if users table is empty
	SeedIfUsersEmpty(db)

	// ต่อด้วย seed ข้อมูลที่เหลือ (ดึง Employee คนแรกมาอ้างอิง)
	seedContent(db)

	// ตัวอย่าง: seed payments หากยังไม่มี
	userID := uint(1)
	methodID := uint(1)
	if err := SeedPayments(db, userID, methodID); err != nil {
		log.Fatalf("Seed payments failed: %v", err)
	}
}

// ----------------------------- Master seeds -----------------------------

func seedMasters(db *gorm.DB) {
	// Genders
	genderMale := entity.Genders{Gender: "Male"}
	genderFemale := entity.Genders{Gender: "Female"}
	db.FirstOrCreate(&genderMale, &entity.Genders{Gender: "Male"})
	db.FirstOrCreate(&genderFemale, &entity.Genders{Gender: "Female"})

	// Methods (แก้คำสะกดให้ตรงกัน)
	method1 := entity.Method{Medthod: "QR Payment"}
	method2 := entity.Method{Medthod: "Coin Payment"}
	db.FirstOrCreate(&method1, &entity.Method{Medthod: "QR Payment"})
	db.FirstOrCreate(&method2, &entity.Method{Medthod: "Coin Payment"})

	// Roles
	adminRole := entity.UserRoles{RoleName: "Admin"}
	employeeRole := entity.UserRoles{RoleName: "Employee"}
	userRole := entity.UserRoles{RoleName: "User"}
	db.FirstOrCreate(&adminRole, &entity.UserRoles{RoleName: "Admin"})
	db.FirstOrCreate(&employeeRole, &entity.UserRoles{RoleName: "Employee"})
	db.FirstOrCreate(&userRole, &entity.UserRoles{RoleName: "User"})

	// Banking (ตัวอย่าง)
	banking := entity.Bank{
		PromptPay: "0935096372",
		Manager:   "MR. TAWANCHAI BURAKHON",
		Banking:   "006",
		Minimum:   100,
	}
	db.FirstOrCreate(&banking, &entity.Bank{PromptPay: "0935096372"})
}

// ----------------------------- Conditional seed (Users Empty) -----------------------------

func SeedIfUsersEmpty(db *gorm.DB) {
	// 1) เช็คว่ามี user อยู่แล้วหรือยัง
	var userCount int64
	if err := db.Model(&entity.User{}).Count(&userCount).Error; err != nil {
		log.Fatalf("count users failed: %v", err)
	}
	if userCount > 0 {
		log.Println("[seed] users already exist -> skip seeding users/cars/employees")
		return
	}

	// 2) ยังไม่มีข้อมูล -> seed block นี้
	hashedPassword, err := HashPassword("123")
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	// Users
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
		Email:       "employee1@example.com",
		Password:    hashedPassword,
		Profile:     "uploads/user/avatar1.jpg",
		PhoneNumber: "0981183502",
		Coin:        0,
		GenderID:    2,
		UserRoleID:  2,
	}

	// ใช้ Create รวดเดียว (ตาราง users ยังว่าง)
	if err := db.Create(&user1).Error; err != nil { log.Fatal(err) }
	if err := db.Create(&user2).Error; err != nil { log.Fatal(err) }
	if err := db.Create(&user3).Error; err != nil { log.Fatal(err) }
	if err := db.Create(&admin1).Error; err != nil { log.Fatal(err) }
	if err := db.Create(&admin2).Error; err != nil { log.Fatal(err) }
	if err := db.Create(&employeeUser).Error; err != nil { log.Fatal(err) }

	// Cars (ตัวอย่าง many-to-many: ตรวจโครงสร้าง struct ของคุณให้สอดคล้อง)
	car1 := entity.Car{Brand: "Tesla", ModelCar: "Model 3", LicensePlate: "EV-001",SpecialNumber: true, City: "Bangkok", User: []entity.User{user1}}
	car2 := entity.Car{Brand: "BYD", ModelCar: "Atto 3", LicensePlate: "EV-002",SpecialNumber: false, City: "Chiang Mai", User: []entity.User{user2}}
	car3 := entity.Car{Brand: "MG", ModelCar: "ZS EV", LicensePlate: "EV-003",SpecialNumber: false, City: "Khon Kaen", User: []entity.User{user2}}
	db.FirstOrCreate(&car1, entity.Car{LicensePlate: car1.LicensePlate})
	db.FirstOrCreate(&car2, entity.Car{LicensePlate: car2.LicensePlate})
	db.FirstOrCreate(&car3, entity.Car{LicensePlate: car3.LicensePlate})

	// Employees (อ้าง UserID จริง ไม่ hard-code)
	emp1 := entity.Employee{
		Bio:        "Admin Thailand",
		Experience: "5 years of experience as an admin with Tesla company",
		Education:  "Master degree of marketing at Harvard university",
		Salary:     25000,
		UserID:     &admin1.ID,
	}
	emp2 := entity.Employee{
		Bio:        "Admin Korean",
		Experience: "100 years of experience as an admin with Tesla company",
		Education:  "Master degree of marketing at Harvard university",
		Salary:     50000,
		UserID:     &admin2.ID,
	}
	emp3 := entity.Employee{
		Bio:        "Staff Thailand",
		Experience: "5 years of experience with Tesla company",
		Education:  "Master degree of marketing at Harvard university",
		Salary:     25000,
		UserID:     &employeeUser.ID,
	}
	db.FirstOrCreate(&emp1, entity.Employee{UserID: &admin1.ID})
	db.FirstOrCreate(&emp2, entity.Employee{UserID: &admin2.ID})
	db.FirstOrCreate(&emp3, entity.Employee{UserID: &employeeUser.ID})
}

// ----------------------------- Seed other content -----------------------------

func seedContent(db *gorm.DB) {
	// หา Employee คนแรก (เอาไว้เป็นเจ้าของข้อมูลอื่น ๆ)
	var emp entity.Employee
	if err := db.First(&emp).Error; err != nil {
		// ถ้าไม่มี ก็ไม่ต้องผูก
		emp = entity.Employee{}
	}
	var empIDPtr *uint
	if emp.ID != 0 {
		empIDPtr = &emp.ID
	}

	// GettingStarted
	getting1 := entity.GettingStarted{
		Picture: "uploads/getting_started/gettingone.png",
		Title:       "Best interest rates on the market",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  empIDPtr,
	}
	getting2 := entity.GettingStarted{
		Picture: "uploads/getting_started/gettingtwo.png",
		Title:       "Prevent unstable prices",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  empIDPtr,
	}
	getting3 := entity.GettingStarted{
		Picture: "uploads/getting_started/gettingthree.png",
		Title:       "Best price on the market",
		Description: "Exercitation in fugiat est ut ad ea cupidatat ut in cupidatat occaecat ut occaecat consequat est minim minim esse tempor laborum consequat esse adipisicing eu reprehenderit enim.",
		EmployeeID:  empIDPtr,
	}
	db.FirstOrCreate(&getting1, entity.GettingStarted{Title: "Best interest rates on the market"})
	db.FirstOrCreate(&getting2, entity.GettingStarted{Title: "Prevent unstable prices"})
	db.FirstOrCreate(&getting3, entity.GettingStarted{Title: "Best price on the market"})

	// News
	news1 := entity.New{
		Picture:     "uploads/new/news1.png",
		Title:       "Personalized Profession Online Tutor on Your Schedule 1",
		Description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus atque voluptas labore nemo ipsam voluptatum maxime facere hic...",
		EmployeeID:  empIDPtr,
	}
	news2 := entity.New{
		Picture:     "uploads/new/news2.png",
		Title:       "Personalized Profession Online Tutor on Your Schedule 2",
		Description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus atque voluptas labore nemo ipsam voluptatum maxime facere hic...",
		EmployeeID:  empIDPtr,
	}
	db.FirstOrCreate(&news1, entity.New{Title: "Personalized Profession Online Tutor on Your Schedule 1"})
	db.FirstOrCreate(&news2, entity.New{Title: "Personalized Profession Online Tutor on Your Schedule 2"})

	// Reviews (ตัวอย่างใช้ UserID = 1,2,3 ถ้ามี)
	uid1, uid2, uid3 := uint(1), uint(2), uint(3)
	review1 := &entity.Review{
		Rating:     5,
		Comment:    "The zoo was incredibly well-maintained and the animals looked happy and healthy...",
		ReviewDate: time.Now(),
		Status:     true,
		UserID:     &uid1,
	}
	review2 := &entity.Review{
		Rating:     4,
		Comment:    "Wide variety of animals, some areas overcrowded...",
		ReviewDate: time.Now(),
		Status:     true,
		UserID:     &uid2,
	}
	review3 := &entity.Review{
		Rating:     3,
		Comment:    "Interesting animals, facilities could be cleaner...",
		ReviewDate: time.Now(),
		Status:     true,
		UserID:     &uid3,
	}
	db.FirstOrCreate(review1, &entity.Review{UserID: &uid1})
	db.FirstOrCreate(review2, &entity.Review{UserID: &uid2})
	db.FirstOrCreate(review3, &entity.Review{UserID: &uid3})

	// Status & Type
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

	// EVcharging (อ้าง Employee คนแรกถ้ามี)
	ev1 := entity.EVcharging{
		Name:        "Charger A1",
		Description: "Charger A1 is Good",
		Price:       10,
		Picture:     "uploads/evcharging/product1.jpg",
		EmployeeID:  empIDPtr,
		StatusID:    status1.ID,
		TypeID:      type1.ID,
	}
	ev2 := entity.EVcharging{
		Name:        "Charger B2",
		Description: "Charger B2 is Bad",
		Price:       20,
		Picture:     "uploads/evcharging/product2.jpg",
		EmployeeID:  empIDPtr,
		StatusID:    status2.ID,
		TypeID:      type2.ID,
	}
	db.FirstOrCreate(&ev1, entity.EVcharging{Name: "Charger A1"})
	db.FirstOrCreate(&ev2, entity.EVcharging{Name: "Charger B2"})

	// Calendar (อ้าง Employee คนแรกถ้ามี)
	calendar1 := entity.Calendar{
		Title:       "Staff Meeting",
		Location:    "Room A101",
		Description: "Monthly all-staff meeting",
		StartDate:   time.Date(2025, 7, 1, 9, 0, 0, 0, time.Local),
		EndDate:     time.Date(2025, 7, 1, 10, 30, 0, 0, time.Local),
		EmployeeID:  empIDPtr,
	}
	calendar2 := entity.Calendar{
		Title:       "EV Maintenance",
		Location:    "EV Station Zone B",
		Description: "Routine maintenance for EV chargers",
		StartDate:   time.Date(2025, 7, 3, 13, 0, 0, 0, time.Local),
		EndDate:     time.Date(2025, 7, 3, 15, 0, 0, 0, time.Local),
		EmployeeID:  empIDPtr,
	}
	db.FirstOrCreate(&calendar1, entity.Calendar{Title: "Staff Meeting"})
	db.FirstOrCreate(&calendar2, entity.Calendar{Title: "EV Maintenance"})

	// PaymentCoin (ตัวอย่าง)
	payment1 := entity.PaymentCoin{
		Date:            time.Now(),
		Amount:          100.00,
		ReferenceNumber: "REF2024071401",
		Picture:         "uploads/payment/1751999510090771300.jpg",
		UserID:          uint(1),
	}
	payment2 := entity.PaymentCoin{
		Date:            time.Now().Add(-24 * time.Hour),
		Amount:          250.50,
		ReferenceNumber: "REF2024071402",
		Picture:         "uploads/payment/1751999510090771300.jpg",
		UserID:          uint(1),
	}
	db.FirstOrCreate(&payment1, entity.PaymentCoin{ReferenceNumber: "REF2024071401"})
	db.FirstOrCreate(&payment2, entity.PaymentCoin{ReferenceNumber: "REF2024071402"})

	// Reports (ตัวอย่าง)
	userID1, userID2, userID3 := uint(1), uint(2), uint(3)
	report1 := &entity.Report{
		Picture:     "uploads/reports/avatar1.jpg",
		Description: "พบว่าสัตว์ในสวนสัตว์มีสุขภาพดีและได้รับการดูแลอย่างดี...",
		Status:      "Pending",
		UserID:      &userID1,
		EmployeeID:  nil,
	}
	report2 := &entity.Report{
		Picture:     "uploads/reports/avatar2.jpg",
		Description: "สวนสัตว์สะอาดและปลอดภัย แต่ควรเพิ่มพื้นที่...",
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
}

// ----------------------------- Seed Payments -----------------------------

func SeedPayments(db *gorm.DB, userID uint, methodID uint) error {
	var count int64
	if err := db.Model(&entity.Payment{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to count payments: %w", err)
	}
	if count > 0 {
		fmt.Println("Payments already seeded, skipping creation.")
		return nil
	}

	fmt.Println("Seeding Payments for 12 months (20 days each)...")

	for month := 1; month <= 12; month++ {
		for day := 1; day <= 20; day++ { // ✅ แก้จาก 10 → 20 วัน
			createdAt := time.Date(2025, time.Month(month), day, 0, 0, 0, 0, time.UTC)

			price1 := 50 + day*2
			price2 := 100 + month*3
			amount := price1 + price2

			payment := entity.Payment{
				Date:            createdAt,
				Amount:          float64(amount),
				ReferenceNumber: fmt.Sprintf("REF-%02d%02d", month, day),
				Picture:         "uploads/payment/1751999510090771300.jpg",
				UserID:          &userID,
				MethodID:        &methodID,
			}

			if err := db.Create(&payment).Error; err != nil {
				return fmt.Errorf("failed to create payment: %w", err)
			}

			// 🔍 ดึงข้อมูล EVcharging 1, 2
			var ev1, ev2 entity.EVcharging
			if err := db.First(&ev1, 1).Error; err != nil {
				return fmt.Errorf("failed to find EVcharging 1: %w", err)
			}
			if err := db.First(&ev2, 2).Error; err != nil {
				return fmt.Errorf("failed to find EVcharging 2: %w", err)
			}

			quantity1 := float64(price1) / ev1.Price
			quantity2 := float64(price2) / ev2.Price

			evcp1 := entity.EVChargingPayment{
				EVchargingID: 1,
				PaymentID:    payment.ID,
				Price:        float64(price1),
				Quantity:     quantity1,
			}
			if err := db.FirstOrCreate(
				&evcp1,
				entity.EVChargingPayment{EVchargingID: 1, PaymentID: payment.ID},
			).Error; err != nil {
				return fmt.Errorf("failed to create evchargingpayment 1: %w", err)
			}

			evcp2 := entity.EVChargingPayment{
				EVchargingID: 2,
				PaymentID:    payment.ID,
				Price:        float64(price2),
				Quantity:     quantity2,
			}
			if err := db.FirstOrCreate(
				&evcp2,
				entity.EVChargingPayment{EVchargingID: 2, PaymentID: payment.ID},
			).Error; err != nil {
				return fmt.Errorf("failed to create evchargingpayment 2: %w", err)
			}
		}
	}

	fmt.Println("✅ Successfully seeded payments for all 12 months (20 days each).")
	return nil
}