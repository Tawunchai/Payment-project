package review

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

func ListReview(c *gin.Context) {
	var reviews []entity.Review

	db := config.DB()
	results := db.Preload("User").Find(&reviews) 
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func CreateReview(c *gin.Context) {
	var input struct {
		Rating     uint   `json:"rating"`
		Comment    string `json:"comment"`
		UserID     uint   `json:"user_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง: " + err.Error()})
		return
	}

	db := config.DB()

	var user entity.User
	if err := db.First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ไม่พบผู้ใช้ที่ระบุ"})
		return
	}

	review := entity.Review{
		Rating:     input.Rating,
		Comment:    input.Comment,
		ReviewDate: time.Now(),
		UserID:     &input.UserID,
	}

	if err := db.Create(&review).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกรีวิวได้: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, review)
}

func ListReviewsStatusTrue(c *gin.Context) {
	var reviews []entity.Review

	db := config.DB()
	if err := db.Preload("User").
		Where("status = ?", true).
		Order("created_at DESC").
		Find(&reviews).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

func UpdateStatusReviewsByID(c *gin.Context) {
	// parse id
	idStr := c.Param("id")
	idUint, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid review id"})
		return
	}

	// payload ใช้ pointer เพื่อให้ส่ง false ได้
	var payload struct {
		Status *bool `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil || payload.Status == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: status is required"})
		return
	}

	db := config.DB()

	// find review
	var review entity.Review
	if err := db.First(&review, uint(idUint)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	// update เพียง field เดียว (ปลอดภัยกว่า Save ทั้ง struct)
	if err := db.Model(&review).Update("status", *payload.Status).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to update status: " + err.Error()})
		return
	}

	// preload user กลับไปให้ด้วย
	if err := db.Preload("User").First(&review, uint(idUint)).Error; err != nil {
		// ถ้า preload พลาด ก็ส่งเฉพาะ review ที่มีอยู่
		c.JSON(http.StatusOK, review)
		return
	}

	c.JSON(http.StatusOK, review)
}

func DeleteReviewsByID(c *gin.Context) {
	idStr := c.Param("id")
	idUint, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid review id"})
		return
	}

	db := config.DB()

	var review entity.Review
	if err := db.First(&review, uint(idUint)).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "review not found"})
		return
	}

	if err := db.Delete(&review).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to delete review: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "deleted",
		"reviewID": review.ID,
	})
}