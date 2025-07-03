package method

import (
	"net/http"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListMethods(c *gin.Context) {
	var Methods []entity.Method

	db := config.DB()
	results := db.Find(&Methods) 
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, Methods)
}