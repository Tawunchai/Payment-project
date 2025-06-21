package status

import (
	"net/http"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListStatus(c *gin.Context) {
	var status []entity.Status
	db := config.DB()
	db.Find(&status)
	c.JSON(http.StatusOK, &status)
}