package payment

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListEVChargingPayment(c *gin.Context) {
	var payments []entity.EVChargingPayment

	db := config.DB()
	result := db.Preload("EVcharging").Preload("Payment").Find(&payments)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}

func ListBank(c *gin.Context) {
	var banks []entity.Bank

	db := config.DB()
	result := db.Find(&banks)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, banks)
}

func UpdateBank(c *gin.Context) {
	var bank entity.Bank

	id := c.Param("id")

	db := config.DB()
	if err := db.First(&bank, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลธนาคาร"})
		return
	}

	var input struct {
		PromptPay string `json:"promptpay"`
		Manager   string `json:"manager"`
		Banking   string `json:"banking"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bank.PromptPay = input.PromptPay
	bank.Manager = input.Manager
	bank.Banking = input.Banking

	if err := db.Save(&bank).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตข้อมูลไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": bank})
}

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
	var filePath string

	// ตรวจสอบและจัดการรูปภาพ ถ้ามี
	file, err := c.FormFile("picture")
	if err == nil && file != nil {
		// มีการอัปโหลดรูป
		validTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValid := false
		for _, t := range validTypes {
			if file.Header.Get("Content-Type") == t {
				isValid = true
				break
			}
		}
		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็นไฟล์ .jpg, .png, .gif เท่านั้น"})
			return
		}

		uploadDir := "uploads/payment"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath = filepath.Join(uploadDir, newFileName)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// ❗ ไม่แนบรูป — ไม่เป็นไร
		filePath = ""
	}

	// รับข้อมูลอื่นจาก form
	dateStr := c.PostForm("date")
	amountStr := c.PostForm("amount")
	userIDStr := c.PostForm("user_id")
	methodIDStr := c.PostForm("method_id")
	referenceNumber := c.PostForm("reference_number")

	// แปลงค่าที่จำเป็น
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบวันที่ไม่ถูกต้อง ต้องเป็น YYYY-MM-DD"})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "จำนวนเงินไม่ถูกต้อง"})
		return
	}

	userID64, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID ไม่ถูกต้อง"})
		return
	}
	userID := uint(userID64)

	methodID64, err := strconv.ParseUint(methodIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Method ID ไม่ถูกต้อง"})
		return
	}
	methodID := uint(methodID64)

	// สร้างและบันทึกข้อมูล
	payment := entity.Payment{
		Date:            date,
		Amount:          amount,
		UserID:          &userID,
		MethodID:        &methodID,
		ReferenceNumber: referenceNumber,
		Picture:         filePath, // อาจเป็นค่าว่างได้ ถ้าไม่มีรูป
	}

	if err := config.DB().Create(&payment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างข้อมูล Payment สำเร็จ",
		"data":    payment,
	})
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
