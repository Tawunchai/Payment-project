package tokening

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ✅ เมื่อจ่ายเงินสำเร็จ (Coin หรือ QR)
func PaymentSuccess(c *gin.Context) {
	var req struct {
		UserID    uint `json:"user_id"`
		PaymentID uint `json:"payment_id"`
	}

	// 🟦 ตรวจสอบข้อมูลที่ส่งมา
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request data"})
		return
	}
	if req.UserID == 0 || req.PaymentID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing user_id or payment_id"})
		return
	}

	// 🟦 ตรวจสอบว่ามี Payment จริงในระบบ
	var payment entity.Payment
	if err := config.DB().First(&payment, req.PaymentID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	// 🟦 สร้าง token สำหรับ session การชาร์จ
	token := uuid.New().String()

	session := entity.ChargingSession{
		UserID:    req.UserID,
		Token:     token,
		ExpiresAt: time.Now().Add(300 * time.Minute),
		Status:    true,
		PaymentID: req.PaymentID,
	}

	// 🟦 บันทึกลงฐานข้อมูล
	if err := config.DB().Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create session"})
		return
	}

	// 🟦 ส่งกลับให้ frontend
	c.JSON(http.StatusOK, gin.H{
		"charging_token": token,
		"expires_at":     session.ExpiresAt,
		"user_id":        session.UserID,
		"payment_id":     session.PaymentID,
		"status":         session.Status,
	})
}

func VerifyChargingSession(c *gin.Context) {
	token := c.Query("token")
	var session entity.ChargingSession

	// 1) ตรวจว่า token มีจริงไหม
	if err := config.DB().Where("token = ?", token).First(&session).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "invalid token"})
		return
	}

	// 2) ตรวจเฉพาะสถานะ session ต้องเป็น true เท่านั้น
	if !session.Status {
		c.JSON(http.StatusForbidden, gin.H{"error": "session not active"})
		return
	}

	// ✔ ผ่าน — token ใช้ได้ และอยู่ในสถานะ active
	c.JSON(http.StatusOK, gin.H{
		"ok":     true,
		"status": session.Status,
	})
}



// GET /charging-session/:user_id
func GetDataByUserID(c *gin.Context) {

	// 1) รับ user_id
	userIDParam := c.Param("user_id")

	// แปลง userID string → uint
	userID, err := strconv.ParseUint(userIDParam, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user_id"})
		return
	}

	// 📌 หาเวลาเริ่มวันและสิ้นสุดวัน (Today)
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	// 2) Query DB (เฉพาะของวันนี้)
	var sessions []entity.ChargingSession
	db := config.DB()

	if err := db.Where("user_id = ? AND created_at >= ? AND created_at < ?", 
		uint(userID), startOfDay, endOfDay).
		Preload("Payment").
		Find(&sessions).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// 3) ส่งข้อมูลกลับ
	c.JSON(http.StatusOK, gin.H{
		"data": sessions,
	})
}