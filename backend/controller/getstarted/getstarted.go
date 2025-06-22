package getstarted

import (
	"net/http"
	"strconv"

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

func PatchGettingStartedByID(c *gin.Context) {
	id := c.Param("id")

	var gettingStarted entity.GettingStarted
	if err := config.DB().First(&gettingStarted, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูล Getting Started"})
		return
	}

	// ตรวจสอบค่าที่ส่งมา แล้วอัปเดตเฉพาะฟิลด์ที่ส่งมาเท่านั้น
	if title := c.PostForm("title"); title != "" {
		gettingStarted.Title = title
	}
	if description := c.PostForm("description"); description != "" {
		gettingStarted.Description = description
	}
	if employeeIDStr := c.PostForm("employeeID"); employeeIDStr != "" {
		if parsedID, err := strconv.ParseUint(employeeIDStr, 10, 32); err == nil {
			temp := uint(parsedID)
			gettingStarted.EmployeeID = &temp
		}
	}

	// บันทึก
	if err := config.DB().Save(&gettingStarted).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตข้อมูลสำเร็จ",
		"data":    gettingStarted,
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