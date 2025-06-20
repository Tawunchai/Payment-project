package new

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

func CreateNews(c *gin.Context) {
	// อ่านไฟล์รูปภาพ
	file, err := c.FormFile("picture")
	var filePath string

	if err == nil && file != nil {
		// เช็คชนิดไฟล์ (ถ้าต้องการ)
		validTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValid := false
		for _, t := range validTypes {
			if file.Header.Get("Content-Type") == t {
				isValid = true
				break
			}
		}
		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็นไฟล์ .jpg, .png, .gif เท่านั้น"})
			return
		}

		// สร้างโฟลเดอร์เก็บไฟล์ถ้ายังไม่มี
		uploadDir := "uploads/news"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		// สร้างชื่อไฟล์ใหม่ (เพื่อป้องกันชื่อซ้ำ)
		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath = filepath.Join(uploadDir, newFileName)

		// บันทึกไฟล์
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		// กรณีไม่มีไฟล์
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาอัปโหลดรูปภาพ"})
		return
	}

	// รับข้อมูลอื่นจาก form
	title := c.PostForm("title")
	description := c.PostForm("description")
	employeeIDStr := c.PostForm("employeeID")

	var employeeID *uint = nil
	if employeeIDStr != "" {
		parsedID, err := strconv.ParseUint(employeeIDStr, 10, 32)
		if err == nil {
			temp := uint(parsedID)
			employeeID = &temp
		}
	}

	// สร้าง struct entity.New
	news := entity.New{
		Picture:     filePath, // เก็บเป็น path ที่เซิร์ฟเวอร์
		Title:       title,
		Description: description,
		EmployeeID:  employeeID,
	}

	// บันทึกลง DB
	if err := config.DB().Create(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "News created successfully", "data": news})
}

func UpdateNewsByID(c *gin.Context) {
	id := c.Param("id")

	// ตรวจสอบว่า record มีอยู่จริงหรือไม่
	var news entity.New
	if err := config.DB().First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข่าวที่ต้องการอัปเดต"})
		return
	}

	// รับข้อมูลจาก form
	title := c.PostForm("title")
	description := c.PostForm("description")
	employeeIDStr := c.PostForm("employeeID")

	// แปลง employeeID เป็น uint pointer
	var employeeID *uint = nil
	if employeeIDStr != "" {
		parsedID, err := strconv.ParseUint(employeeIDStr, 10, 32)
		if err == nil {
			temp := uint(parsedID)
			employeeID = &temp
		}
	}

	// อัปโหลดรูปใหม่ (ถ้ามี)
	file, err := c.FormFile("picture")
	if err == nil && file != nil {
		validTypes := []string{"image/jpeg", "image/png", "image/gif"}
		isValid := false
		for _, t := range validTypes {
			if file.Header.Get("Content-Type") == t {
				isValid = true
				break
			}
		}
		if !isValid {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็น .jpg, .png, .gif เท่านั้น"})
			return
		}

		uploadDir := "uploads/news"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath := filepath.Join(uploadDir, newFileName)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		news.Picture = filePath // อัปเดตรูปภาพใหม่
	}

	// อัปเดตค่าที่รับเข้ามา (ถ้ามี)
	if title != "" {
		news.Title = title
	}
	if description != "" {
		news.Description = description
	}
	if employeeID != nil {
		news.EmployeeID = employeeID
	}

	// บันทึกการอัปเดตลง DB
	if err := config.DB().Save(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตข่าวสำเร็จ",
		"data":    news,
	})
}

func DeleteNewByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var news entity.New

	if err := db.First(&news, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "News not found"})
		return
	}

	if err := db.Delete(&news).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "News deleted"})
}