package payment

import (
	"net/http"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListPayment(c *gin.Context) {
	var payments []entity.Payment

	db := config.DB()
	result := db.Preload("User").Preload("Method").Find(&payments)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}

func CreatePayment(c *gin.Context) {
	var input struct {
		Date     time.Time `json:"date" binding:"required"`
		Amount   float64   `json:"amount" binding:"required"`
		UserID   uint      `json:"user_id" binding:"required"`
		MethodID uint      `json:"method_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบหรือไม่ถูกต้อง: " + err.Error()})
		return
	}

	db := config.DB()

	payment := entity.Payment{
		Date:     input.Date,
		Amount:   input.Amount,
		UserID:   &input.UserID,
		MethodID: &input.MethodID,
	}

	if err := db.Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้: " + err.Error()})
		return
	}

	// ส่งข้อมูล payment ที่ถูกบันทึกกลับไป
	c.JSON(http.StatusOK, payment)
}

type CreateEVChargingPaymentInput struct {
	EVchargingID uint    `json:"evcharging_id" binding:"required"`
	PaymentID    uint    `json:"payment_id" binding:"required"`
	Price        float64 `json:"price" binding:"required"`
	Quantity     float64 `json:"quantity" binding:"required"`
}

func CreateEVChargingPayment(c *gin.Context) {
	var input CreateEVChargingPaymentInput

	// Bind JSON input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ครบหรือไม่ถูกต้อง: " + err.Error()})
		return
	}

	db := config.DB()

	evPayment := entity.EVChargingPayment{
		EVchargingID: input.EVchargingID,
		PaymentID:    input.PaymentID,
		Price:        input.Price,
		Quantity:     input.Quantity,
	}

	if err := db.Create(&evPayment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, evPayment)
}
