package car

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
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
