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
	userID := c.GetInt("UserID") // ต้องได้จาก JWT middleware

	// ดึง PaymentID จาก body หรือ query (แล้วแต่ฝั่ง frontend ส่งมา)
	var req struct {
		PaymentID uint `json:"payment_id"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request data"})
		return
	}
	if req.PaymentID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing payment_id"})
		return
	}

	// ✅ สร้าง token ชั่วคราว
	token := uuid.New().String()

	session := entity.ChargingSession{
		UserID:    uint(userID),
		Token:     token,
		ExpiresAt: time.Now().Add(300 * time.Minute),
		Status:    true,            // ✅ เปิดสถานะทันที
		PaymentID: req.PaymentID,   // ✅ บันทึก PaymentID ที่ผูกกับการชำระเงิน
	}

	if err := config.DB().Create(&session).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot create session"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"charging_token": token,
		"expires_at":     session.ExpiresAt,
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
