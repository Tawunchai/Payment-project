package getstarted

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
)

func ListGetStarted(c *gin.Context) {
	var getstarteds []entity.GettingStarted

	db := config.DB()
	results := db.Preload("Employee").Find(&getstarteds) 
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, getstarteds)
}