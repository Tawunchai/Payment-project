package role

import (
	"net/http"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListUserRoles(c *gin.Context) {
	var roles []entity.UserRoles
	db := config.DB()
	db.Find(&roles)
	c.JSON(http.StatusOK, &roles)
}