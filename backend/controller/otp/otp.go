// controller/otp.go
package otp

import (
	"fmt"
	"math/rand"
	"net/http"
	"net/smtp"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

// POST /send-otp
func SendOTP(c *gin.Context) {
	email := c.PostForm("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}

	otp := fmt.Sprintf("%06d", rand.Intn(1000000))
	expires := time.Now().Add(5 * time.Minute).Unix()

	db := config.DB()

	// ลบ OTP เดิมก่อน
	db.Where("email = ?", email).Delete(&entity.OTP{})
	db.Create(&entity.OTP{Email: email, Code: otp, ExpiresAt: expires, Verified: false})

	// === ดึงข้อมูล SendEmail จากฐานข้อมูล ===
	var sendMail entity.SendEmail
	if err := db.First(&sendMail).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่พบข้อมูลอีเมลสำหรับส่ง OTP"})
		return
	}

	// === ส่งอีเมล ===
	from := sendMail.Email
	pass := sendMail.PassApp
	to := []string{email}

	subject := "Subject: ยืนยันตัวตนของคุณ (OTP Verification)\n"
	body := fmt.Sprintf(`
ถึงคุณ %s,

เพื่อยืนยันตัวตนของท่าน กรุณาใช้รหัส OTP ด้านล่างนี้ในการดำเนินการ

OTP: %s

รหัสนี้มีอายุการใช้งาน 5 นาที นับจากเวลาที่ได้รับอีเมล

ขอแสดงความนับถือ,
ทีมงาน EV Station
`, email, otp)

	msg := []byte(subject + "\n" + body)

	err := smtp.SendMail("smtp.gmail.com:587",
		smtp.PlainAuth("", from, pass, "smtp.gmail.com"),
		from, to, msg)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "OTP sent to email"})
}


// POST /verify-otp
func VerifyOTP(c *gin.Context) {
	email := c.PostForm("email")
	code := c.PostForm("otp")

	var otp entity.OTP
	db := config.DB()
	if err := db.Where("email = ? AND code = ?", email, code).First(&otp).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid OTP"})
		return
	}

	if otp.Verified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP already verified"})
		return
	}

	if time.Now().Unix() > otp.ExpiresAt {
		c.JSON(http.StatusBadRequest, gin.H{"error": "OTP expired"})
		return
	}

	otp.Verified = true
	db.Save(&otp)
	c.JSON(http.StatusOK, gin.H{"message": "OTP verified successfully"})
}
