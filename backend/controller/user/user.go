package user

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

func ServeImage(c *gin.Context) {

	filePath := c.Param("filename")


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

func CreateUser(c *gin.Context) {
	var user entity.User
	db := config.DB()

	profileImage, err := c.FormFile("profile")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error receiving profile image: %v", err)})
		return
	}

	uploadDir := "uploads"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create upload directory: %v", err)})
		return
	}

	fileName := fmt.Sprintf("%s-%s", uuid.New().String(), profileImage.Filename)
	filePath := filepath.Join(uploadDir, fileName)

	if err := c.SaveUploadedFile(profileImage, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to save profile image: %v", err)})
		return
	}

	user.Username = c.PostForm("username")
	user.Email = c.PostForm("email")
	user.FirstName = c.PostForm("first_name")
	user.LastName = c.PostForm("last_name")

	birthDayStr := c.PostForm("birthDay")
	if birthDayStr != "" {
		birthDay, err := time.Parse("2006-01-02", birthDayStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("รูปแบบวันเกิดไม่ถูกต้อง: %v", err)})
			return
		}
		user.Birthday = birthDay
	}

	user.Profile = filePath

	user.UserRoleID = 2

	genderIDStr := c.PostForm("genderID")
	genderID, err := strconv.ParseUint(genderIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid genderID format"})
		return
	}
	user.GenderID = uint(genderID)

	user.PhoneNumber = c.PostForm("phonenumber")

	user.Password = c.PostForm("password")

	var existingUser entity.User
	if err := db.Where("username = ?", user.Username).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
		return
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create user: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user":    user,
	})
}

func ListGenders(c *gin.Context) {
	var genders []entity.Genders

	db := config.DB()

	db.Find(&genders)

	c.JSON(http.StatusOK, &genders)
}


func GetEmployeeByUserID(c *gin.Context) {
	db := config.DB()
	idStr := c.Param("userID")

	if idStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุ UserID"})
		return
	}

	// แปลง id จาก string เป็น uint
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
