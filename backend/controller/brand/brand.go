package brand

import (
	"net/http"
	"strings"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

// ✅ POST /create-brand
func CreateBrand(c *gin.Context) {
	var brand entity.Brand
	db := config.DB()

	// ✅ Bind JSON
	if err := c.ShouldBindJSON(&brand); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ ตรวจสอบชื่อซ้ำ (ไม่สนตัวพิมพ์)
	var existing entity.Brand
	if err := db.Where("LOWER(brand_name) = ?", strings.ToLower(brand.BrandName)).First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชื่อยี่ห้อนี้มีอยู่แล้ว"})
		return
	}

	// ✅ สร้าง Brand ใหม่
	if err := db.Create(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้าง Brand ได้: " + err.Error()})
		return
	}

	// ✅ เมื่อสร้าง Brand สำเร็จ → สร้าง Modal เริ่มต้นอัตโนมัติ
	defaultModal := entity.Modal{
		ModalName: "New Model",
		BrandID:   &brand.ID,
	}

	if err := db.Create(&defaultModal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":  "สร้าง Brand สำเร็จ แต่ไม่สามารถสร้าง Modal เริ่มต้นได้",
			"detail": err.Error(),
		})
		return
	}

	// ✅ รวมผลลัพธ์
	response := struct {
		entity.Brand
		DefaultModal entity.Modal `json:"default_modal"`
	}{
		Brand:        brand,
		DefaultModal: defaultModal,
	}

	c.JSON(http.StatusCreated, response)
}

// ✅ PATCH /update-brand/:id
func UpdateBrandByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var brand entity.Brand
	if err := db.First(&brand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูล Brand ที่ต้องการแก้ไข"})
		return
	}

	var input entity.Brand
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// ✅ ตรวจสอบชื่อซ้ำ (ยกเว้นตัวเอง)
	var existing entity.Brand
	if err := db.Where("LOWER(brand_name) = ? AND id != ?", strings.ToLower(input.BrandName), id).
		First(&existing).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ชื่อยี่ห้อนี้มีอยู่แล้ว"})
		return
	}

	// ✅ อัปเดตชื่อใหม่
	brand.BrandName = input.BrandName
	if err := db.Save(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตข้อมูลได้: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดต Brand สำเร็จ",
		"data":    brand,
	})
}

// DELETE /brand/:id
func DeleteBrandByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var brand entity.Brand
	if err := db.Preload("Modal").First(&brand, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Brand not found"})
		return
	}

	// ✅ ลบ Modal ทั้งหมดที่อยู่ภายใต้ Brand ก่อน
	if len(brand.Modal) > 0 {
		if err := db.Where("brand_id = ?", brand.ID).Delete(&entity.Modal{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete related modals"})
			return
		}
	}

	// ✅ ลบ Brand หลังจากลบ Modal เสร็จแล้ว
	if err := db.Delete(&brand).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted brand and related modals successfully"})
}

