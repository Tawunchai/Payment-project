package charging

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

func ListEVData(c *gin.Context) {
	var evs []entity.EVcharging

	db := config.DB()
	results := db.
		Preload("Employee.User"). 
		Preload("Employee").      
		Preload("Status").
		Preload("Type").
		Find(&evs)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, evs)
}

func UpdateEVByID(c *gin.Context) {
	id := c.Param("id")

	var ev entity.EVcharging
	if err := config.DB().First(&ev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูล EV Charging ที่ต้องการอัปเดต"})
		return
	}

	// อ่านไฟล์ใหม่ ถ้ามีการส่งเข้ามา
	file, err := c.FormFile("picture")
	if err == nil && file != nil {
		// ตรวจสอบชนิด
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

		uploadDir := "uploads/evcharging"
		os.MkdirAll(uploadDir, os.ModePerm)
		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath := filepath.Join(uploadDir, newFileName)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "บันทึกรูปไม่สำเร็จ"})
			return
		}
		ev.Picture = filePath
	}

	// อ่านข้อมูลอื่นจาก form
	if name := c.PostForm("name"); name != "" {
		ev.Name = name
	}
	if voltage := c.PostForm("voltage"); voltage != "" {
		if v, err := strconv.ParseFloat(voltage, 64); err == nil {
			ev.Voltage = v
		}
	}
	if current := c.PostForm("current"); current != "" {
		if v, err := strconv.ParseFloat(current, 64); err == nil {
			ev.Current = v
		}
	}
	if price := c.PostForm("price"); price != "" {
		if v, err := strconv.ParseFloat(price, 64); err == nil {
			ev.Price = v
		}
	}
	if statusID := c.PostForm("statusID"); statusID != "" {
		if v, err := strconv.ParseUint(statusID, 10, 64); err == nil {
			ev.StatusID = uint(v)
		}
	}
	if typeID := c.PostForm("typeID"); typeID != "" {
		if v, err := strconv.ParseUint(typeID, 10, 64); err == nil {
			ev.TypeID = uint(v)
		}
	}
	if employeeID := c.PostForm("employeeID"); employeeID != "" {
		if v, err := strconv.ParseUint(employeeID, 10, 64); err == nil {
			temp := uint(v)
			ev.EmployeeID = &temp
		}
	}

	if err := config.DB().Save(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตไม่สำเร็จ"})
		return
	}

	config.DB().Preload("Employee").Preload("Status").Preload("Type").First(&ev, id)

	c.JSON(http.StatusOK, gin.H{"message": "อัปเดตข้อมูล EV Charging สำเร็จ", "data": ev})
}

func CreateEV(c *gin.Context) {
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
			c.JSON(http.StatusBadRequest, gin.H{"error": "รูปภาพต้องเป็นไฟล์ .jpg, .png, .gif เท่านั้น"})
			return
		}

		uploadDir := "uploads/evcharging"
		if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
			return
		}

		ext := filepath.Ext(file.Filename)
		newFileName := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filePath = filepath.Join(uploadDir, newFileName)

		if err := c.SaveUploadedFile(file, filePath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกรูปภาพได้"})
			return
		}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาอัปโหลดรูปภาพ"})
		return
	}

	// รับข้อมูลจาก form
	name := c.PostForm("name")
	voltage, _ := strconv.ParseFloat(c.PostForm("voltage"), 64)
	current, _ := strconv.ParseFloat(c.PostForm("current"), 64)
	price, _ := strconv.ParseFloat(c.PostForm("price"), 64)
	statusID, _ := strconv.ParseUint(c.PostForm("statusID"), 10, 64)
	typeID, _ := strconv.ParseUint(c.PostForm("typeID"), 10, 64)

	var employeeID *uint
	if empStr := c.PostForm("employeeID"); empStr != "" {
		empParsed, _ := strconv.ParseUint(empStr, 10, 64)
		temp := uint(empParsed)
		employeeID = &temp
	}

	ev := entity.EVcharging{
		Name:       name,
		Voltage:    voltage,
		Current:    current,
		Price:      price,
		Picture:    filePath,
		EmployeeID: employeeID,
		StatusID:   uint(statusID),
		TypeID:     uint(typeID),
	}

	if err := config.DB().Create(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างข้อมูล EV Charging ได้"})
		return
	}

	config.DB().Preload("Employee.User").Preload("Status").Preload("Type").First(&ev, ev.ID)

	c.JSON(http.StatusCreated, gin.H{"message": "สร้างข้อมูล EV Charging สำเร็จ", "data": ev})
}



func DeleteEVByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var ev entity.EVcharging
	if err := db.First(&ev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EVcharging not found"})
		return
	}

	if err := db.Delete(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "EVcharging deleted successfully"})
}
