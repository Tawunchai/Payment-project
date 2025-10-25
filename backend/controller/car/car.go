package car

import (
	"net/http"
	"strconv"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

// ✅ Struct สำหรับรับข้อมูลจาก Frontend
type CreateCarInput struct {
	Brand         string `json:"brand"           binding:"required"`
	ModelCar      string `json:"model_car"       binding:"required"`
	LicensePlate  string `json:"license_plate"   binding:"required"`
	City          string `json:"city"            binding:"required"`
	SpecialNumber bool   `json:"special_number"`
	UserID        uint   `json:"user_id"         binding:"required"` // ✅ เพิ่ม field นี้ (แทน UserIDs array)
}

// GET /cars
func ListCar(c *gin.Context) {
	var cars []entity.Car
	db := config.DB()

	results := db.
		Preload("User").
		Find(&cars)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, cars)
}


func CreateCar(c *gin.Context) {
	var input CreateCarInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// ตรวจเลขทะเบียนซ้ำ
	var count int64
	if err := db.Model(&entity.Car{}).
		Where("license_plate = ?", input.LicensePlate).
		Count(&count).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error: " + err.Error()})
		return
	}
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "license plate already exists"})
		return
	}

	// ✅ สร้างข้อมูลรถ
	car := entity.Car{
		Brand:         input.Brand,
		ModelCar:      input.ModelCar,
		LicensePlate:  input.LicensePlate,
		City:          input.City,
		SpecialNumber: input.SpecialNumber,
	}

	tx := db.Begin()
	if err := tx.Create(&car).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ✅ ดึง user ตาม ID ที่ส่งมา
	var user entity.User
	if err := tx.First(&user, input.UserID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "user not found"})
		return
	}

	// ✅ ผูกความสัมพันธ์ (many2many → user_cars)
	if err := tx.Model(&car).Association("User").Append(&user); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to attach user: " + err.Error()})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed: " + err.Error()})
		return
	}

	// โหลดข้อมูล user กลับมาด้วย
	if err := db.Preload("User").First(&car, car.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reload car: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "car created successfully",
		"data":    car,
	})
}

// GET /cars/user/:id
func GetCarByUserID(c *gin.Context) {
	// ดึงพารามิเตอร์จาก URL เช่น /cars/user/1
	userIDParam := c.Param("id")
	userID, err := strconv.Atoi(userIDParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	db := config.DB()
	var cars []entity.Car

	// ✅ Query รถทั้งหมดที่เชื่อมกับ user นี้ (many2many: user_cars)
	result := db.Preload("User").
		Joins("JOIN user_cars ON user_cars.car_id = cars.id").
		Where("user_cars.user_id = ?", userID).
		Find(&cars)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	// ไม่มีรถของ user นี้
	if len(cars) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No cars found for this user"})
		return
	}

	c.JSON(http.StatusOK, cars)
}

// PUT /cars/:id
func UpdateCarByID(c *gin.Context) {
	idParam := c.Param("id")
	carID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid car ID"})
		return
	}

	var input struct {
		Brand         string `json:"Brand"`
		ModelCar      string `json:"ModelCar"`
		LicensePlate  string `json:"LicensePlate"`
		City          string `json:"City"`
		SpecialNumber bool   `json:"SpecialNumber"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON format"})
		return
	}

	db := config.DB()
	var car entity.Car

	// ตรวจสอบว่ารถนี้มีอยู่หรือไม่
	if err := db.First(&car, carID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	// อัปเดตข้อมูล
	car.Brand = input.Brand
	car.ModelCar = input.ModelCar
	car.LicensePlate = input.LicensePlate
	car.City = input.City
	car.SpecialNumber = input.SpecialNumber

	if err := db.Save(&car).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Car updated successfully",
		"data":    car,
	})
}

// DELETE /cars/:id
func DeleteCarByID(c *gin.Context) {
	idParam := c.Param("id")
	carID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid car ID"})
		return
	}

	db := config.DB()

	// ตรวจสอบว่ารถมีอยู่จริงหรือไม่
	var car entity.Car
	if err := db.Preload("User").First(&car, carID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	// ลบความสัมพันธ์ในตารางกลาง user_cars ก่อน (ป้องกัน orphan records)
	if err := db.Model(&car).Association("User").Clear(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear user-car relationship"})
		return
	}

	// ลบข้อมูลรถ
	if err := db.Delete(&car).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete car"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Car deleted successfully"})
}