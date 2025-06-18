package new

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
)

func ListNew(c *gin.Context) {
	var news []entity.New

	db := config.DB()
	results := db.Preload("Employee").Find(&news) 
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, news)
}