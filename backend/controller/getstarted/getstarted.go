package getstarted

import (
	"net/http"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
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

type GettingStartedInput struct {
    Title       string `json:"title" binding:"required"`
    Description string `json:"description" binding:"required"`
    EmployeeID  *uint  `json:"employeeID"`
}

func CreateGettingStarted(c *gin.Context) {
    var input GettingStartedInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    getting := entity.GettingStarted{
        Title:       input.Title,
        Description: input.Description,
        EmployeeID:  input.EmployeeID,
    }

    if err := config.DB().Create(&getting).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "message": "Getting Started created successfully",
        "data":    getting,
    })
}

func DeleteGettingByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var getting entity.GettingStarted

	if err := db.First(&getting, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "GettingStarted not found"})
		return
	}

	if err := db.Delete(&getting).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "GettingStarted deleted"})
}