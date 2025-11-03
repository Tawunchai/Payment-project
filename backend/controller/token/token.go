package tokening

import (
	"net/http"
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

// ตรวจสอบ token ว่าใช้ได้ไหม
func VerifyChargingSession(c *gin.Context) {
	token := c.Query("token")
	var session entity.ChargingSession

	if err := config.DB().Where("token = ?", token).First(&session).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{"error": "invalid token"})
		return
	}

	if time.Now().After(session.ExpiresAt) {
		c.JSON(http.StatusForbidden, gin.H{"error": "token expired"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
