package service

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
)

func ListService(c *gin.Context) {
	var services []entity.Service
	db := config.DB()

	results := db.
		Preload("Employee").
		Find(&services)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, services)
}


func UpdateServiceByID(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid service ID"})
		return
	}

	db := config.DB()
	var service entity.Service

	// ตรวจสอบว่ามี service นี้ไหม
	if err := db.First(&service, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}

	// รับข้อมูลจาก body
	var input struct {
		Email      string `json:"email"`
		Phone      string `json:"phone"`
		Location   string `json:"location"`
		MapURL     string `json:"map_url"`
		EmployeeID *uint  `json:"employee_id"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	// อัปเดตข้อมูล
	service.Email = input.Email
	service.Phone = input.Phone
	service.Location = input.Location
	service.MapURL = input.MapURL
	service.EmployeeID = input.EmployeeID

	if err := db.Save(&service).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Service updated successfully",
		"data":    service,
	})
}
