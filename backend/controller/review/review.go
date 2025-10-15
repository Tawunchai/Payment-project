package review

import (
	"net/http"
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