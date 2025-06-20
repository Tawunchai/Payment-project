package charging

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
)

func ListEVData(c *gin.Context) {
	var evs []entity.EVcharging

	db := config.DB()
	results := db.
		Preload("Employee.User"). 
		Preload("Employee").      
		Preload("Status").
		Preload("Type").
		Find(&evs)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, evs)
}

func DeleteEVByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var ev entity.EVcharging
	if err := db.First(&ev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EVcharging not found"})
		return
	}

	if err := db.Delete(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "EVcharging deleted successfully"})
}
