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