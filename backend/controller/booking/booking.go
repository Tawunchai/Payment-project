package booking

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

// ✅ CreateBooking User (1 คนจองได้ 1 ครั้งต่อวัน)
func CreateBooking(c *gin.Context) {
	var input struct {
		StartDate   time.Time `json:"start_date" binding:"required"`
		EndDate     time.Time `json:"end_date" binding:"required"`
		UserID      uint      `json:"user_id" binding:"required"`
		EVCabinetID uint      `json:"ev_cabinet_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ บังคับเวลาที่รับเข้ามาให้เป็นเวลาประเทศไทย
	loc, _ := time.LoadLocation("Asia/Bangkok")
	input.StartDate = input.StartDate.In(loc)
	input.EndDate = input.EndDate.In(loc)

	db := config.DB()

	// ✅ ตรวจสอบว่า User นี้เคยจองในวันเดียวกันไปแล้วหรือยัง
	startOfDay := time.Date(input.StartDate.Year(), input.StartDate.Month(), input.StartDate.Day(), 0, 0, 0, 0, loc)
	endOfDay := startOfDay.Add(24 * time.Hour)

	var existing entity.Booking
	check := db.Where("user_id = ? AND start_date >= ? AND start_date < ?", input.UserID, startOfDay, endOfDay).First(&existing)
	if check.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "คุณได้ทำการจองในวันนี้แล้ว ไม่สามารถจองซ้ำได้"})
		return
	}

	// ✅ ตรวจสอบว่าช่วงเวลานี้มีคนจองแล้วหรือยัง
	var overlap entity.Booking
	checkOverlap := db.Where(`
		ev_cabinet_id = ? 
		AND ((start_date < ? AND end_date > ?) OR (start_date >= ? AND start_date < ?))`,
		input.EVCabinetID, input.EndDate, input.StartDate, input.StartDate, input.EndDate,
	).First(&overlap)

	if checkOverlap.Error == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ช่วงเวลานี้มีการจองแล้ว กรุณาเลือกเวลาอื่น"})
		return
	}

	// ✅ สร้าง booking
	booking := entity.Booking{
		StartDate:   input.StartDate,
		EndDate:     input.EndDate,
		UserID:      &input.UserID,
		EVCabinetID: &input.EVCabinetID,
		IsEmailSent: false,
	}

	if err := db.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Booking created successfully",
		"data":    booking,
	})
}



// ✅ GET /bookings/evcabinet/:id/date?date=YYYY-MM-DD
func ListBookingByEVCabinetIDandStartDate(c *gin.Context) {
	db := config.DB()
	var bookings []entity.Booking

	// รับค่า EVCabinetID จาก param
	idParam := c.Param("id")
	evCabinetID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid EVCabinetID"})
		return
	}

	// รับค่าวันที่จาก query parameter เช่น ?date=2025-10-25
	dateStr := c.Query("date")
	if dateStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing date parameter (expected format: YYYY-MM-DD)"})
		return
	}

	// แปลง string → time.Time
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format (expected YYYY-MM-DD)"})
		return
	}

	// ✅ ใช้เวลาไทยเสมอ
	loc, _ := time.LoadLocation("Asia/Bangkok")
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, loc)
	endOfDay := startOfDay.Add(24 * time.Hour)

	// ✅ ดึงข้อมูล Booking ตาม EVCabinetID และ StartDate ของวันนั้น
	results := db.
		Preload("User").
		Preload("EVCabinet").
		Where("ev_cabinet_id = ? AND start_date BETWEEN ? AND ?", evCabinetID, startOfDay, endOfDay).
		Find(&bookings)

	if results.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": results.Error.Error()})
		return
	}

	// ✅ ถ้าไม่มีข้อมูล ให้คืน array ว่าง ([])
	if len(bookings) == 0 {
		c.JSON(http.StatusOK, []entity.Booking{}) // <<< เปลี่ยนจาก message เป็น array
		return
	}

	// ✅ ส่งผลลัพธ์กลับ
	c.JSON(http.StatusOK, bookings)
}


// ✅ ListBooking (ทั้งหมด) User and Admin
func ListBooking(c *gin.Context) {
	var bookings []entity.Booking
	db := config.DB()

	results := db.
		Preload("User").
		Preload("EVCabinet").
		Find(&bookings)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

// ✅ ListBookingByUserID User
func ListBookingByUserID(c *gin.Context) {
	userID := c.Param("user_id")
	var bookings []entity.Booking
	db := config.DB()

	results := db.
		Preload("User").
		Preload("EVCabinet").
		Where("user_id = ?", userID).
		Find(&bookings)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, bookings)
}

// ✅ DeleteBookingByID User and Admin
func DeleteBookingByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	if err := db.Delete(&entity.Booking{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted successfully"})
}

// ✅ UpdateBookingByID Admin
func UpdateBookingByID(c *gin.Context) {
	id := c.Param("id")
	var input struct {
		StartDate   time.Time `json:"start_date"`
		EndDate     time.Time `json:"end_date"`
		EVCabinetID uint      `json:"ev_cabinet_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()
	var booking entity.Booking
	if err := db.First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	booking.StartDate = input.StartDate
	booking.EndDate = input.EndDate
	booking.EVCabinetID = &input.EVCabinetID

	if err := db.Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking updated successfully", "data": booking})
}


