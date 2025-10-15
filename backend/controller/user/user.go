package user

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ServeImage(c *gin.Context) {
	filePath := c.Param("filename")
	filePath = strings.TrimPrefix(filePath, "/")

	fullFilePath := filepath.Join("uploads", filePath)

	if _, err := os.Stat(fullFilePath); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบไฟล์"})
		return
	}

	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")

	c.File(fullFilePath)
}

type UserRoleRequest struct {
	ID       uint   `json:"ID"`
	RoleName string `json:"RoleName"`
}

type GenderRequest struct {
	ID     uint   `json:"ID"`
	Gender string `json:"Gender"`
}

type CreateUserRequest struct {
	Username    string          `json:"username" binding:"required"`
	Email       string          `json:"email" binding:"required,email"`
	FirstName   string          `json:"FirstName"`
	LastName    string          `json:"LastName"`
	PhoneNumber string          `json:"phonenumber"`
	GenderID    GenderRequest   `json:"genderID" binding:"required"`
	UserRoleID  UserRoleRequest `json:"userRoleID"`
	Password    string          `json:"password" binding:"required"`
	Profile     string          `json:"profile"`
}

func CreateUser(c *gin.Context) {
	// อ่านไฟล์รูปภาพ
	file, err := c.FormFile("profile")
	var filePath string

	if err == nil && file != nil {
		// เช็คชนิดไฟล์ (optional)
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

		// สร้างโฟลเดอร์เก็บไฟล์
		uploadDir := "uploads/user"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		// สร้างชื่อไฟล์ใหม่ (ป้องกันชื่อซ้ำ)
		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath = filepath.Join(uploadDir, newFileName)

		// บันทึกไฟล์
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// รับข้อมูลอื่น ๆ จาก form
	username := c.PostForm("username")
	email := c.PostForm("email")
	password := c.PostForm("password")
	firstName := c.PostForm("firstname")
	lastName := c.PostForm("lastname")
	phone := c.PostForm("phone")
	genderIDStr := c.PostForm("gender")
	userRoleIDStr := c.PostForm("userRoleID")

	if username == "" || email == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรอกข้อมูลให้ครบถ้วน"})
		return
	}

	// เช็คซ้ำ
	var existingUser entity.User
	if err := config.DB().Where("username = ?", username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	// แปลงรหัสผ่านด้วย bcrypt
	hashedPassword, err := config.HashPassword(password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// แปลง ID
	genderID, _ := strconv.Atoi(genderIDStr)
	userRoleID, _ := strconv.Atoi(userRoleIDStr)
	if userRoleID == 0 {
		userRoleID = 2
	}

	user := entity.User{
		Username:    username,
		Email:       email,
		Password:    hashedPassword, // ใส่ hashed password แทน
		FirstName:   firstName,
		LastName:    lastName,
		PhoneNumber: phone,
		GenderID:    uint(genderID),
		UserRoleID:  uint(userRoleID),
		Profile:     filePath,
	}

	if err := config.DB().Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create user: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"first_name":  user.FirstName,
			"last_name":   user.LastName,
			"profile":     user.Profile,
			"phoneNumber": user.PhoneNumber,
			"userRoleID":  user.UserRoleID,
			"genderID":    user.GenderID,
		},
	})
}

// PATCH /update-user-profile/:id
func UpdateUserProfileByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var user entity.User

	// 🔍 ตรวจสอบว่ามี user หรือไม่
	if err := db.First(&user, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// 📸 ถ้ามีการอัปโหลดรูปใหม่
	file, _ := c.FormFile("profile")
	if file != nil {
		// ✅ ตรวจสอบชนิดไฟล์
		validTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValid := false
		for _, t := range validTypes {
			if file.Header.Get("Content-Type") == t {
				isValid = true
				break
			}
		}
		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็น .jpg, .png, .gif เท่านั้น"})
			return
		}

		// ✅ ลบรูปเก่าออก (ถ้ามี)
		if user.Profile != "" {
			_ = os.Remove(user.Profile)
		}

		// ✅ สร้างโฟลเดอร์อัปโหลด
		uploadDir := "uploads/user"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		// ✅ สร้างชื่อไฟล์ใหม่
		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath := filepath.Join(uploadDir, newFileName)

		// ✅ บันทึกไฟล์
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		user.Profile = filePath
	}

	username := c.Request.FormValue("username")
	email := c.Request.FormValue("email")
	password := c.Request.FormValue("password")
	firstName := c.Request.FormValue("firstname")
	lastName := c.Request.FormValue("lastname")
	phone := c.Request.FormValue("phone")
	genderIDStr := c.Request.FormValue("gender")
	userRoleIDStr := c.Request.FormValue("userRoleID")

	// 🎯 อัปเดตเฉพาะค่าที่ส่งมา
	if username != "" {
		user.Username = username
	}
	if email != "" {
		user.Email = email
	}
	if firstName != "" {
		user.FirstName = firstName
	}
	if lastName != "" {
		user.LastName = lastName
	}
	if phone != "" {
		user.PhoneNumber = phone
	}
	if genderIDStr != "" {
		gid, _ := strconv.Atoi(genderIDStr)
		user.GenderID = uint(gid)
	}
	if userRoleIDStr != "" {
		uid, _ := strconv.Atoi(userRoleIDStr)
		user.UserRoleID = uint(uid)
	}

	// 🔐 ถ้ามีรหัสผ่านใหม่ → hash ใหม่
	if password != "" {
		hashedPassword, err := config.HashPassword(password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
			return
		}
		user.Password = hashedPassword
	}

	// 💾 บันทึกข้อมูลลงฐานข้อมูล (ใช้ Updates แทน Save)
	if err := db.Model(&user).Updates(user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": fmt.Sprintf("Failed to update user: %v", err),
		})
		return
	}

	// ✅ ส่ง response กลับ
	c.JSON(http.StatusOK, gin.H{
		"message": "User updated successfully",
		"user": gin.H{
			"id":          user.ID,
			"username":    user.Username,
			"email":       user.Email,
			"firstname":   user.FirstName,
			"lastname":    user.LastName,
			"profile":     user.Profile,
			"phoneNumber": user.PhoneNumber,
			"userRoleID":  user.UserRoleID,
			"genderID":    user.GenderID,
		},
	})
}

// DeleteUserByID ลบ User ตาม ID
func DeleteUserByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var user entity.User

	// ค้นหาว่ามี User นี้หรือไม่
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	// ลบ User
	if err := db.Delete(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
}

func GetEmployeeByUserID(c *gin.Context) {
	db := config.DB()
	idStr := c.Param("userID")

	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ UserID"})
		return
	}

	userID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "UserID ต้องเป็นตัวเลข"})
		return
	}

	var employee entity.Employee
	err = db.Where("user_id = ?", uint(userID)).First(&employee).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "ไม่พบ Employee ที่เกี่ยวข้องกับ UserID",
				"details": "record not found",
				"id":      idStr,
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "เกิดข้อผิดพลาดในการ Query",
				"details": err.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "พบข้อมูล Employee",
		"employeeID": employee.ID,
	})
}

func ListUser(c *gin.Context) {
	var users []entity.User

	db := config.DB()
	results := db.Preload("UserRole").Preload("Gender").Find(&users)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func GetDataUserByRoleUser(c *gin.Context) {
	var users []entity.User

	db := config.DB()
	// ดึงเฉพาะผู้ใช้ที่ UserRole.RoleName = "User"
	err := db.Preload("UserRole").Preload("Gender").
		Joins("JOIN user_roles ON user_roles.id = users.user_role_id").
		Where("user_roles.role_name = ?", "User").
		Find(&users).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func GetDataUserByRoleAdmin(c *gin.Context) {
	var users []entity.User

	db := config.DB()
	err := db.Preload("UserRole").Preload("Gender").
		Joins("JOIN user_roles ON user_roles.id = users.user_role_id").
		Where("user_roles.role_name = ?", "Admin").
		Find(&users).Error

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, users)
}

func UpdateUserByID(c *gin.Context) {
	idParam := c.Param("id")
	userID, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	db := config.DB()

	var user entity.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var input map[string]interface{}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	// Allowed fields
	allowedFields := map[string]bool{
		"Username":    true,
		"Password":    true,
		"Email":       true,
		"FirstName":   true,
		"LastName":    true,
		"Profile":     true,
		"PhoneNumber": true,
		"Coin":        true,
		"UserRoleID":  true,
		"GenderID":    true,
	}

	// Clean input
	for key := range input {
		if !allowedFields[key] {
			delete(input, key)
		}
	}

	// Remove nested structs if exist
	delete(input, "UserRole")
	delete(input, "Gender")

	if err := db.Model(&user).Updates(input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "User updated successfully", "user": user})
}

func ListUserByID(c *gin.Context) {
	idParam := c.Param("id")
	userID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var user entity.User

	result := config.DB().
		Preload("UserRole").
		Preload("Gender").
		First(&user, userID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

type EmailCheckRequest struct {
	Email string `json:"email" binding:"required,email"`
}

func CheckEmailExists(c *gin.Context) {
	var req EmailCheckRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูล email ไม่ถูกต้อง"})
		return
	}

	db := config.DB()
	var user entity.User

	err := db.Where("email = ?", req.Email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusOK, gin.H{"exists": false, "message": "ไม่พบ email นี้ในระบบ"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในระบบ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"exists": true, "message": "พบ email นี้ในระบบ"})
}

type ResetPasswordRequest struct {
	Email       string `json:"email" binding:"required,email"`
	NewPassword string `json:"new_password" binding:"required,min=6"`
}

func ResetPassword(c *gin.Context) {
	var req ResetPasswordRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง หรือขาดข้อมูล"})
		return
	}

	db := config.DB()

	var user entity.User
	err := db.Where("email = ?", req.Email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบ email ในระบบ"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในระบบ"})
		}
		return
	}

	// ทำการ hash รหัสผ่านใหม่ก่อนบันทึก
	hashedPassword, err := config.HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการเข้ารหัสรหัสผ่าน"})
		return
	}

	user.Password = hashedPassword

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตรหัสผ่านได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "เปลี่ยนรหัสผ่านสำเร็จ"})
}

func UpdateCoins(c *gin.Context) {
	var input struct {
		UserID uint    `json:"user_id"`
		Coin   float64 `json:"coin"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	db := config.DB()
	var user entity.User

	if err := db.First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.Coin = input.Coin

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update coin"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Coin updated successfully", "user": user})
}
