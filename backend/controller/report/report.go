package report

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListReport(c *gin.Context) {
	var reports []entity.Report

	db := config.DB()
	result := db.Preload("Employee").Preload("User").Find(&reports)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, reports)
}

func CreateReport(c *gin.Context) {
	// อ่านไฟล์รูปภาพ
	file, err := c.FormFile("picture")
	var filePath string

	if err == nil && file != nil {
		// ตรวจสอบชนิดไฟล์
		validTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValid := false
		for _, t := range validTypes {
			if file.Header.Get("Content-Type") == t {
				isValid = true
				break
			}
		}
		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็น .jpg, .png หรือ .gif เท่านั้น"})
			return
		}

		// สร้างโฟลเดอร์ถ้ายังไม่มี
		uploadDir := "uploads/reports"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		// ตั้งชื่อไฟล์ใหม่เพื่อป้องกันซ้ำ
		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath = filepath.Join(uploadDir, newFileName)

		// บันทึกไฟล์ลงเครื่อง
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาอัปโหลดรูปภาพ"})
		return
	}

	// รับค่าจากฟอร์ม
	description := c.PostForm("description")
	userIDStr := c.PostForm("userID")

	// แปลง userID จาก string เป็น *uint
	var userID *uint = nil
	if userIDStr != "" {
		if parsedID, err := strconv.ParseUint(userIDStr, 10, 32); err == nil {
			temp := uint(parsedID)
			userID = &temp
		}
	}

	// EmployeeID ตั้งเป็น null เสมอ
	var employeeID *uint = nil

	report := entity.Report{
		Picture:     filePath,
		Description: description,
		Status:      "pending",
		UserID:      userID,
		EmployeeID:  employeeID,
	}

	if err := config.DB().Create(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Report created successfully",
		"data":    report,
	})
}

func UpdateReport(c *gin.Context) {
	var report entity.Report
	id := c.Param("id")

	db := config.DB()
	if err := db.First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	var input struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	report.Status = input.Status

	if err := db.Save(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

func DeleteReportByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var report entity.Report

	// ค้นหา Report ตาม id
	if err := db.First(&report, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Report not found"})
		return
	}

	// ลบ Report ที่เจอ
	if err := db.Delete(&report).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Report deleted successfully"})
}
