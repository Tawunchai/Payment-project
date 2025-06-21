package employee

import (
	"net/http"
	"strconv"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
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
