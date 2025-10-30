package modal

import (
	"net/http"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

// POST /create-modal
func CreateModal(c *gin.Context) {
	var modal entity.Modal
	if err := c.ShouldBindJSON(&modal); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// ตรวจสอบว่า BrandID มีอยู่จริงไหม (ป้องกัน foreign key error)
	if modal.BrandID != nil {
		var brand entity.Brand
		if err := db.First(&brand, *modal.BrandID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid BrandID"})
			return
		}
	}

	if err := db.Create(&modal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, modal)
}

// PATCH /update-modal/:id
func UpdateModalByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var modal entity.Modal

	if err := db.First(&modal, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modal not found"})
		return
	}

	var input entity.Modal
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// อัปเดตค่า
	modal.ModalName = input.ModalName
	modal.BrandID = input.BrandID

	if err := db.Save(&modal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, modal)
}

// DELETE /delete-modal/:id
func DeleteModalByID(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	var modal entity.Modal
	if err := db.First(&modal, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Modal not found"})
		return
	}

	if err := db.Delete(&modal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
