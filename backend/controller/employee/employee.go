package employee

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

func GetEmployeeByUserID(c *gin.Context) {
	idParam := c.Param("id")
	userID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	var employee entity.Employee
	result := config.DB().Preload("User").Where("user_id = ?", userID).First(&employee)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found for this user ID"})
		return
	}

	c.JSON(http.StatusOK, employee)
}

// PATCH /api/employees/:id/profile
func UpdateEmployeeProfile(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var employee entity.Employee

	// 🔍 ตรวจสอบว่ามีพนักงานนี้ในระบบหรือไม่
	if err := db.Preload("User").First(&employee, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// 📋 รับข้อมูลจาก form-data (partial update)
	bio := c.PostForm("bio")
	experience := c.PostForm("experience")
	education := c.PostForm("education")
	salaryStr := c.PostForm("salary")

	// 🎯 อัปเดตเฉพาะฟิลด์ที่ส่งมา
	if bio != "" {
		employee.Bio = bio
	}
	if experience != "" {
		employee.Experience = experience
	}
	if education != "" {
		employee.Education = education
	}
	if salaryStr != "" {
		salary, err := strconv.ParseFloat(salaryStr, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid salary format"})
			return
		}
		employee.Salary = salary
	}

	// 💾 บันทึกข้อมูลลงฐานข้อมูล
	if err := db.Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update employee profile: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Employee profile updated successfully",
		"employee": gin.H{
			"id":          employee.ID,
			"bio":         employee.Bio,
			"experience":  employee.Experience,
			"education":   employee.Education,
			"salary":      employee.Salary,
			"userID":      employee.UserID,
			"user": gin.H{
				"id":        employee.User.ID,
				"username":  employee.User.Username,
				"firstname": employee.User.FirstName,
				"lastname":  employee.User.LastName,
				"email":     employee.User.Email,
				"profile":   employee.User.Profile,
			},
		},
	})
}

func DeleteAdminByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var admin entity.Employee
	if err := db.First(&admin, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
		return
	}

	if err := db.Delete(&admin).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Admin deleted successfully"})
}

func UpdateAdminByID(c *gin.Context) {
	id := c.Param("id")

	var employee entity.Employee
	if err := config.DB().Preload("User").First(&employee, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบผู้ดูแลระบบที่ต้องการอัปเดต"})
		return
	}

	// สร้าง struct สำหรับรับ JSON
	type UpdateAdminInput struct {
		Salary     *float64 `json:"salary"`
		UserRoleID *uint    `json:"userRoleID"`
	}

	var input UpdateAdminInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูล JSON ไม่ถูกต้อง"})
		return
	}

	// อัปเดต Salary ถ้ามี
	if input.Salary != nil {
		employee.Salary = *input.Salary
	}

	// อัปเดต UserRoleID ถ้ามีและ User ไม่เป็น nil
	if input.UserRoleID != nil && employee.User != nil {
		employee.User.UserRoleID = *input.UserRoleID
		if err := config.DB().Save(employee.User).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดต UserRoleID ได้"})
			return
		}
	}

	// บันทึก Employee
	if err := config.DB().Save(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดต Salary ได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตข้อมูลสำเร็จ",
		"data":    employee,
	})
}

func ListEmployeeByID(c *gin.Context) {
	idParam := c.Param("id")
	employeeID, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid employee ID"})
		return
	}

	var employee entity.Employee

	result := config.DB().
		Preload("User").
		Preload("User.UserRole").
		Preload("User.Gender").
		First(&employee, employeeID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Employee not found"})
		return
	}

	c.JSON(http.StatusOK, employee)
}

type CreateEmployeeWithUserInput struct {
	Username  string  `json:"username" binding:"required"`
	Password  string  `json:"password" binding:"required"`
	FirstName string  `json:"firstName" binding:"required"`
	LastName  string  `json:"lastName" binding:"required"`
	Email     string  `json:"email" binding:"required,email"`
	Salary    float64 `json:"salary" binding:"required"`
}

func CreateEmployeeByAdmin(c *gin.Context) {
	var input CreateEmployeeWithUserInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเข้ารหัสรหัสผ่านได้"})
		return
	}

	user := entity.User{
		Username:  input.Username,
		Password:  string(hashedPassword),
		FirstName: input.FirstName,
		LastName:  input.LastName,
		Email:     input.Email,
		UserRoleID: 1, 
	}

	db := config.DB()

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง User ใหม่ได้"})
		return
	}

	// สร้าง Employee ที่เชื่อมกับ User.ID
	employee := entity.Employee{
		Salary: input.Salary,
		UserID: &user.ID,
		// Bio, Experience, Education ไม่ใส่ (เป็นค่า default หรือ null ได้)
	}

	if err := db.Create(&employee).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง Employee ใหม่ได้"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "สร้าง User และ Employee สำเร็จ",
		"user":     user,
		"employee": employee,
	})
}