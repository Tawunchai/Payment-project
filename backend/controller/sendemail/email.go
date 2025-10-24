package sendemail

import (
	"net/http"
	"strings"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/gin-gonic/gin"
)

// ============================================
// ✅ GET /send-emails
// ดึงรายการ SendEmail ทั้งหมด
// ============================================
func ListSendEmail(c *gin.Context) {
	var sendEmails []entity.SendEmail
	db := config.DB()

	results := db.Find(&sendEmails)
	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, sendEmails)
}

func UpdateSendEmailByID(c *gin.Context) {
	id := c.Param("id")

	var raw map[string]interface{}
	if err := c.ShouldBindJSON(&raw); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	// normalize keys: support Email/PassApp and email/pass_app
	getStr := func(keys ...string) (string, bool) {
		for _, k := range keys {
			if v, ok := raw[k]; ok && v != nil {
				if s, ok2 := v.(string); ok2 {
					s = strings.TrimSpace(s)
					if s != "" {
						return s, true
					}
				}
			}
		}
		return "", false
	}

	updates := map[string]interface{}{}
	if email, ok := getStr("Email", "email"); ok {
		updates["email"] = email
	}
	if pass, ok := getStr("PassApp", "pass_app"); ok {
		updates["pass_app"] = pass
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No fields to update"})
		return
	}

	db := config.DB()

	if err := db.Model(&entity.SendEmail{}).
		Where("id = ?", id).
		Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updated entity.SendEmail
	if err := db.First(&updated, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "SendEmail updated successfully", "data": updated})
}
