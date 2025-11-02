package middlewares

import (
	"fmt"
	"net/http"
	"strings"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
)

// ✅ ต้องใช้ secret เดียวกับตอนสร้าง Token ตอน Login
const jwtSecret = "RhE9Q6zyV8Ai5jnPq2ZDsXMmLuy5eNkw"

// ✅ Middleware สำหรับตรวจสอบ JWT และดึง User ออกมา
func JwtAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 🟦 รับ Header Authorization
		clientToken := c.GetHeader("Authorization")
		if clientToken == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing authorization header"})
			return
		}

		// 🟦 แยกคำว่า "Bearer " ออกจาก Token
		extractedToken := strings.Split(clientToken, "Bearer ")
		if len(extractedToken) == 2 {
			clientToken = strings.TrimSpace(extractedToken[1])
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token format"})
			return
		}

		// 🟦 ตรวจสอบความถูกต้องของ JWT
		token, err := jwt.Parse(clientToken, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// 🟦 อ่าน Claims จาก JWT
		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
			// ✅ ใช้ Username แทน Email
			username, ok := claims["Email"].(string) // field เดิมชื่อ "Email" แต่ใน token เก็บ Username ไว้
			if !ok {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
				return
			}

			// ✅ ดึงข้อมูล User จาก Database โดยใช้ Username
			var user entity.User
			if err := config.DB().Where("username = ?", username).First(&user).Error; err != nil {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
				return
			}

			// ✅ เก็บค่าไว้ใน Context เพื่อใช้ใน Controller ต่อ
			c.Set("Username", username)
			c.Set("UserID", int(user.ID))

			// (optional) Log เพื่อตรวจสอบว่า token ผ่านแล้ว
			fmt.Println("✅ JWT Auth Passed:", username, "| UserID:", user.ID)

			c.Next()
		} else {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
	}
}
