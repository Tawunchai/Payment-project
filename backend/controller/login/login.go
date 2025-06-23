package login

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
	"github.com/Tawunchai/work-project/services"
)

func AddLogin(c *gin.Context) {
	var loginData entity.User
	if err := c.ShouldBindJSON(&loginData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request data"})
		return
	}
	db := config.DB()

	var user entity.User
	if err := db.Preload("UserRole").Where("username = ? AND password = ?", loginData.Username, loginData.Password).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	jwtWrapper := services.JwtWrapper{
		SecretKey:       "RhE9Q6zyV8Ai5jnPq2ZDsXMmLuy5eNkw",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(user.Username)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
	"token_type":    "Bearer",
	"token":         signedToken,
	"UserRole":      user.UserRole,
	"UserID":        user.ID,
	"FirstNameUser": user.FirstName,
	"LastNameUser":  user.LastName,
	"Email":         user.Email,
	"PhoneNumber":   user.PhoneNumber,
	"GenderID":      user.GenderID,
	"Profile":       user.Profile,
})
}