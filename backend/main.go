package main

import (
	"net/http"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/controller/login"
	"github.com/Tawunchai/work-project/controller/user"
	"github.com/Tawunchai/work-project/middlewares"
	"github.com/gin-gonic/gin"
)

const PORT = "8000"

func main() {

	config.ConnectionDB()

	config.SetupDatabase()

	r := gin.Default()

	r.Use(CORSMiddleware())

	r.POST("/login", login.AddLogin)

	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{
		
	}

	public := r.Group("")
	{
		public.GET("/employee/:userID", user.GetEmployeeByUserID) 
		public.GET("/uploads/*filename", user.ServeImage)
		public.GET("/genders", user.ListGenders)
		public.POST("/signup", user.CreateUser)
	}

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	r.Run("localhost:" + PORT)

}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
