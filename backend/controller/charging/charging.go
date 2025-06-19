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
	results := db.Preload("Employee").Preload("Status").Preload("Type").Find(&evs)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, evs)
}