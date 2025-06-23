package user

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

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
	var req CreateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// เช็ค username ซ้ำ
	var existingUser entity.User
	if err := db.Where("username = ?", req.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	userRoleID := req.UserRoleID.ID
	if userRoleID == 0 {
		userRoleID = 2 // default
	}

	user := entity.User{
		Username:    req.Username,
		Email:       req.Email,
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		PhoneNumber: req.PhoneNumber,
		GenderID:    req.GenderID.ID,
		UserRoleID:  userRoleID,
		Profile:     req.Profile,
		Password:    req.Password, // ควร hash ก่อนบันทึกจริง
	}

	if err := db.Create(&user).Error; err != nil {
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