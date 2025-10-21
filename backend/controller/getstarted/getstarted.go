package getstarted

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
	// --- รับไฟล์รูป ---
	file, err := c.FormFile("picture")
	var filePath string

	if err == nil && file != nil {
		// ตรวจชนิดไฟล์ที่อนุญาต
		allow := map[string]bool{
			"image/jpeg": true,
			"image/png":  true,
			"image/gif":  true,
		}
		if !allow[file.Header.Get("Content-Type")] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็น .jpg, .png, .gif เท่านั้น"})
			return
		}

		// สร้างโฟลเดอร์
		uploadDir := "uploads/getting_started"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		// ตั้งชื่อไฟล์ใหม่กันซ้ำ
		ext := filepath.Ext(file.Filename)
		newName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath = filepath.Join(uploadDir, newName)

		// บันทึกไฟล์
		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาอัปโหลดรูปภาพ (field: picture)"})
		return
	}

	// --- รับฟิลด์อื่น ๆ จาก form ---
	title := c.PostForm("title")
	description := c.PostForm("description")
	employeeIDStr := c.PostForm("employeeID")

	if title == "" || description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "title และ description ห้ามว่าง"})
		return
	}

	var employeeID *uint
	if employeeIDStr != "" {
		if v, err := strconv.ParseUint(employeeIDStr, 10, 32); err == nil {
			tmp := uint(v)
			employeeID = &tmp
		}
	}

	// --- บันทึก DB ---
	item := entity.GettingStarted{
		Picture:     filePath, // เก็บ path ไฟล์ในเซิร์ฟเวอร์
		Title:       title,
		Description: description,
		EmployeeID:  employeeID,
	}

	if err := config.DB().Create(&item).Error; err != nil {
		// ลบไฟล์ทิ้งหาก insert fail
		_ = os.Remove(filePath)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Getting Started created successfully",
		"data":    item,
	})
}


func PatchGettingStartedByID(c *gin.Context) {
	id := c.Param("id")

	var gs entity.GettingStarted
	if err := config.DB().First(&gs, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูล Getting Started"})
		return
	}

	// ------- อัปเดตรูป (ถ้ามีส่งมา) -------
	if file, err := c.FormFile("picture"); err == nil && file != nil {
		// ตรวจชนิดไฟล์ให้ตรงกับ backend ที่อนุญาต
		allow := map[string]bool{
			"image/jpeg": true,
			"image/png":  true,
			"image/gif":  true,
		}
		if !allow[file.Header.Get("Content-Type")] {
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็น .jpg, .png, .gif เท่านั้น"})
			return
		}

		// สร้างโฟลเดอร์ปลายทาง
		uploadDir := "uploads/getting_started"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		// ตั้งชื่อไฟล์ใหม่กันซ้ำ
		ext := filepath.Ext(file.Filename)
		newName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		newPath := filepath.Join(uploadDir, newName)

		// บันทึกไฟล์ใหม่
		if err := c.SaveUploadedFile(file, newPath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// ลบไฟล์เก่า (ถ้ามี)
		if gs.Picture != "" {
			_ = os.Remove(gs.Picture)
		}

		// เซ็ต path ใหม่
		gs.Picture = newPath
	}

	// ------- อัปเดตฟิลด์ข้อความแบบ partial -------
	if title := c.PostForm("title"); title != "" {
		gs.Title = title
	}
	if description := c.PostForm("description"); description != "" {
		gs.Description = description
	}
	if employeeIDStr := c.PostForm("employeeID"); employeeIDStr != "" {
		if parsedID, err := strconv.ParseUint(employeeIDStr, 10, 32); err == nil {
			tmp := uint(parsedID)
			gs.EmployeeID = &tmp
		}
	}

	// ------- บันทึก -------
	if err := config.DB().Save(&gs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลได้"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตข้อมูลสำเร็จ",
		"data":    gs,
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