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