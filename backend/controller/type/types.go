package types

import (
	"net/http"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListTypeEV(c *gin.Context) {
	var types []entity.Type
	db := config.DB()
	db.Find(&types)
	c.JSON(http.StatusOK, &types)
}