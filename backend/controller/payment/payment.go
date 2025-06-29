package payment

import (
	"net/http"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListPayment(c *gin.Context) {
	var payments []entity.Payment

	db := config.DB()
	result := db.Preload("User").Preload("Method").Find(&payments)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}

