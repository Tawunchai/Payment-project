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

    // ดึง Employee พร้อม UserID
    var admin entity.Employee
    if err := db.Preload("User").First(&admin, "id = ?", id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Admin not found"})
        return
    }

    tx := db.Begin()
    if tx.Error != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "cannot start transaction"})
        return
    }

    // 1) ลบ Employee (soft delete ตาม gorm.Model)
    if err := tx.Delete(&admin).Error; err != nil {
        tx.Rollback()
        c.JSON(http.StatusInternalServerError, gin.H{"error": "delete employee failed"})
        return
    }

    // 2) ลบ User ที่เกี่ยวข้อง (ถ้ามี) — ไม่แตะตารางอื่น
    if admin.UserID != nil {
        if err := tx.Delete(&entity.User{}, *admin.UserID).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "delete user failed"})
            return
        }
    }

    if err := tx.Commit().Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "commit failed"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Admin and related user deleted successfully"})
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
	Username   string  `json:"username"`
	Password   string  `json:"password"`
	FirstName  string  `json:"firstName"`
	LastName   string  `json:"lastName"`
	Email      string  `json:"email"`
	Salary     float64 `json:"salary"`
	UserRoleID uint    `json:"userRoleId"` // <<— เพิ่มฟิลด์นี้
}

// POST /admin/employees
func CreateEmployeeByAdmin(c *gin.Context) {
	var input CreateEmployeeWithUserInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง"})
		return
	}

	db := config.DB()

	// เริ่ม transaction เพื่อให้การสร้าง User/Employee เป็น atomic
	tx := db.Begin()
	if tx.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเริ่มธุรกรรมได้"})
		return
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1) ตรวจว่า UserRoleID ที่รับมามีอยู่จริง
	var role entity.UserRoles
	if err := tx.First(&role, input.UserRoleID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบสิทธิ์ผู้ใช้ (UserRole) ตามที่ระบุ"})
		return
	}

	// 2) กัน username / email ซ้ำ
	var count int64
	if err := tx.Model(&entity.User{}).
		Where("username = ? OR email = ?", input.Username, input.Email).
		Count(&count).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "เกิดข้อผิดพลาดในการตรวจสอบผู้ใช้ซ้ำ"})
		return
	}
	if count > 0 {
		tx.Rollback()
		c.JSON(http.StatusConflict, gin.H{"error": "มี Username หรือ Email นี้อยู่ในระบบแล้ว"})
		return
	}

	// 3) เข้ารหัสรหัสผ่าน
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเข้ารหัสรหัสผ่านได้"})
		return
	}

	// 4) สร้าง User โดยใช้ UserRoleID ที่รับมา
	user := entity.User{
		Username:   input.Username,
		Password:   string(hashedPassword),
		FirstName:  input.FirstName,
		LastName:   input.LastName,
		Email:      input.Email,
		UserRoleID: input.UserRoleID, // <<— ใช้ค่าที่รับมาแทนการ fix เป็น 1
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง User ใหม่ได้"})
		return
	}

	// 5) สร้าง Employee ผูกกับ User.ID
	employee := entity.Employee{
		Salary: input.Salary,
		UserID: &user.ID,
	}

	if err := tx.Create(&employee).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง Employee ใหม่ได้"})
		return
	}

	// commit
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถยืนยันธุรกรรมได้"})
		return
	}

	// ไม่คืนรหัสผ่าน
	user.Password = ""

	c.JSON(http.StatusCreated, gin.H{
		"message":  "สร้าง User และ Employee สำเร็จ",
		"user":     user,
		"employee": employee,
	})
}
