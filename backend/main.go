package main

import (
	"net/http"

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/controller/calendar"
	"github.com/Tawunchai/work-project/controller/charging"
	"github.com/Tawunchai/work-project/controller/employee"
	"github.com/Tawunchai/work-project/controller/gender"
	"github.com/Tawunchai/work-project/controller/getstarted"
	"github.com/Tawunchai/work-project/controller/like"
	"github.com/Tawunchai/work-project/controller/login"
	"github.com/Tawunchai/work-project/controller/new"
	"github.com/Tawunchai/work-project/controller/report"
	"github.com/Tawunchai/work-project/controller/review"
	"github.com/Tawunchai/work-project/controller/role"
	"github.com/Tawunchai/work-project/controller/status"
	types "github.com/Tawunchai/work-project/controller/type"
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
		//user and admin
		public.GET("/employee/:userID", user.GetEmployeeByUserID)
		public.GET("/uploads/*filename", user.ServeImage)
		public.GET("/users/:id", user.ListUserByID)
		public.POST("/create-user", user.CreateUser)
		public.PATCH("/update-user/:id", user.UpdateUserByID)
		public.DELETE("/delete-users/:id", user.DeleteUserByID)
		public.GET("/users", user.ListUser)
		public.GET("/users/by-role/user", user.GetDataUserByRoleUser)
		public.GET("/users/by-role/admin", user.GetDataUserByRoleAdmin)
		public.GET("/employees/user/:id", employee.GetEmployeeByUserID)
		public.DELETE("/delete-admins/:id", employee.DeleteAdminByID)
		public.PATCH("/update-boss-admins/:id", employee.UpdateAdminByID)
		public.GET("employeebyid/:id", employee.ListEmployeeByID)

		//role
		public.GET("/userroles", role.ListUserRoles)

		//type
		public.GET("/types", types.ListTypeEV)

		//status
		public.GET("/statuss", status.ListStatus)

		//EV Charging
		public.GET("/evs", charging.ListEVData)
		public.DELETE("/delete-evchargings/:id", charging.DeleteEVByID)
		public.PATCH("/update-evs/:id", charging.UpdateEVByID)


		//gender
		public.GET("/genders", gender.ListGenders)

		//review
		public.GET("/reviews", review.ListReview)

		//new
		public.GET("/news", new.ListNew)
		public.POST("/create-news", new.CreateNews)
		public.PATCH("/update-news/:id", new.UpdateNewsByID)
		public.DELETE("/delete-news/:id", new.DeleteNewByID)

		//getstarted
		public.GET("/getstarteds", getstarted.ListGetStarted)
		public.POST("/create-getting", getstarted.CreateGettingStarted)
		public.PATCH("/update-gettings/:id", getstarted.PatchGettingStartedByID)
		public.DELETE("/delete-gettings/:id", getstarted.DeleteGettingByID)

		//report
		public.GET("/reports", report.ListReport)
		public.POST("/create-report", report.CreateReport)
		public.PUT("/update-reports/:id", report.UpdateReport)
		public.DELETE("/delete-report/:id", report.DeleteReportByID)

		//calendar
		public.GET("/calendars", calendar.ListCalendar)
		public.POST("/create-calendar", calendar.PostCalendar)
		public.PUT("/update-calendar/:id", calendar.UpdateCalendar)
		public.DELETE("/delete-calendar/:id", calendar.DeleteCalendar)

		//like
		public.POST("/reviews/like", like.LikeReview)
		public.DELETE("/reviews/unlike", like.UnlikeReview)
		public.GET("/reviews/:userID/:reviewID/like", like.CheckUserLikeStatus)
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
