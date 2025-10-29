package main

import (
	"log"
	"net/http"

	"github.com/robfig/cron/v3" 

	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/controller/booking"
	"github.com/Tawunchai/work-project/controller/cabinet"
	"github.com/Tawunchai/work-project/controller/calendar"
	"github.com/Tawunchai/work-project/controller/car"
	"github.com/Tawunchai/work-project/controller/charging"
	"github.com/Tawunchai/work-project/controller/employee"
	"github.com/Tawunchai/work-project/controller/gender"
	"github.com/Tawunchai/work-project/controller/getstarted"
	"github.com/Tawunchai/work-project/controller/inverter"
	"github.com/Tawunchai/work-project/controller/like"
	"github.com/Tawunchai/work-project/controller/login"
	"github.com/Tawunchai/work-project/controller/method"
	"github.com/Tawunchai/work-project/controller/new"
	"github.com/Tawunchai/work-project/controller/notify"
	"github.com/Tawunchai/work-project/controller/otp"
	"github.com/Tawunchai/work-project/controller/payment"
	"github.com/Tawunchai/work-project/controller/report"
	"github.com/Tawunchai/work-project/controller/review"
	"github.com/Tawunchai/work-project/controller/role"
	"github.com/Tawunchai/work-project/controller/sendemail"
	"github.com/Tawunchai/work-project/controller/service"
	"github.com/Tawunchai/work-project/controller/slip"
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

	// ✅ 2. เพิ่ม Cron Job หลัง DB setup และก่อนรันเซิร์ฟเวอร์
	c := cron.New()
	c.AddFunc("0 7 * * *", func() {
		log.Println("🕖 เริ่มทำงานส่งอีเมลแจ้งเตือน Booking วันนี้...")
		notify.SendBookingReminder(nil)
	})
	c.Start()
	log.Println("✅ Scheduler started (runs every day at 07:00 AM).")

	authorized := r.Group("")
	authorized.Use(middlewares.Authorizes())
	{

	}

	public := r.Group("")
	{
		//SlipOK
		public.POST("/api/check-slipok", slip.CheckSlipOI)
		//CheckSlip
		public.POST("/api/check-slip", slip.CheckSlipThunder)
		//Iverter
		public.GET("/inverter", inverter.GetInverterStatus)

		//user and admin
		public.PATCH("/update-employee-profile/:id", employee.UpdateEmployeeProfile)
		public.PATCH("/update-user-profile/:id", user.UpdateUserProfileByID)
		public.GET("/employee/:userID", user.GetEmployeeByUserID)
		public.POST("/create-employees", employee.CreateEmployeeByAdmin)
		public.GET("/uploads/*filename", user.ServeImage)
		public.GET("/users/:id", user.ListUserByID)
		public.POST("/create-user", user.CreateUser)
		public.PATCH("/update-user/:id", user.UpdateUserByID)
		public.DELETE("/delete-users/:id", user.DeleteUserByID)
		public.GET("/users", user.ListUser)
		public.GET("/user/:id", user.GetUserByID)
		public.GET("/users/by-role/user", user.GetDataUserByRoleUser)
		public.GET("/users/by-role/admin", user.GetDataUserByRoleAdminAndEmployee)
		public.GET("/employees/user/:id", employee.GetEmployeeByUserID)
		public.DELETE("/delete-admins/:id", employee.DeleteAdminByID)
		public.PATCH("/update-boss-admins/:id", employee.UpdateAdminByID)
		public.GET("employeebyid/:id", employee.ListEmployeeByID)
		public.POST("/check-email", user.CheckEmailExists)
		public.POST("/reset-password", user.ResetPassword)
		public.PUT("/users/update-coin", user.UpdateCoins)

		//payment
		public.GET("/payments", payment.ListPayment)
		public.GET("/payments/user/:user_id", payment.ListPaymentByUserID)
		public.GET("/banks", payment.ListBank)
		public.PATCH("/banks/:id", payment.UpdateBank)
		public.POST("/create-payments", payment.CreatePayment)
		public.POST("/create-evchargingpayments", payment.CreateEVChargingPayment) //Persen
		public.GET("/evcharging-payments", payment.ListEVChargingPayment)
		public.GET("/payment-coins", payment.ListPaymentCoins)
		public.POST("/create-payment-coins", payment.CreatePaymentCoin)
		public.GET("/payment-coins/:user_id", payment.ListPaymentCoinsByUserID)
		public.DELETE("/payment-coins", payment.DeletePaymentCoins)
		r.DELETE("/payments", payment.DeletePayment)

		//Send Email
		public.GET("/send-emails", sendemail.ListSendEmail)
		public.PATCH("/send-email/:id", sendemail.UpdateSendEmailByID)

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
		public.POST("/create-evs", charging.CreateEV)

		//gender
		public.GET("/genders", gender.ListGenders)

		//Method
		public.GET("/methods", method.ListMethods)

		//Car
		public.GET("/cars", car.ListCar)
		public.POST("/car-create", car.CreateCar)
		public.GET("/cars/user/:id", car.GetCarByUserID)
		public.PUT("/cars/:id", car.UpdateCarByID)
		public.DELETE("/cars/:id", car.DeleteCarByID)
		public.GET("/modals", car.ListModal)

		//service
		public.GET("/services", service.ListService)
		public.PUT("/services/:id", service.UpdateServiceByID)

		//review
		public.GET("/reviews", review.ListReview)
		public.POST("/reviews-create", review.CreateReview)
		public.GET("/reviews/visible", review.ListReviewsStatusTrue)
		public.PATCH("/reviews/:id/status", review.UpdateStatusReviewsByID)
		public.DELETE("/reviews/:id", review.DeleteReviewsByID)
		public.GET("/reviews/user/:id", review.GetReviewByUserID)

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
		public.GET("/report/:id", report.GetReportByID)

		//calendar
		public.GET("/calendars", calendar.ListCalendar)
		public.POST("/create-calendar", calendar.PostCalendar)
		public.PUT("/update-calendar/:id", calendar.UpdateCalendar)
		public.DELETE("/delete-calendar/:id", calendar.DeleteCalendar)

		//like
		public.POST("/reviews/like", like.LikeReview)
		public.DELETE("/reviews/unlike", like.UnlikeReview)
		public.GET("/reviews/:userID/:reviewID/like", like.CheckUserLikeStatus)

		//OTP
		public.POST("/send-otp", otp.SendOTP)
		public.POST("/verify-otp", otp.VerifyOTP)

		//Booking
		public.POST("create-bookings", booking.CreateBooking)
		public.GET("bookings", booking.ListBooking)
		public.GET("/booking/:user_id", booking.ListBookingByUserID)
		public.DELETE("delete-booking/:id", booking.DeleteBookingByID)
		public.PUT("update-booking/:id", booking.UpdateBookingByID)
		public.GET("/bookings/evcabinet/:id/date", booking.ListBookingByEVCabinetIDandStartDate)

		//EV Cabinet
		public.GET("/ev-cabinets", cabinet.ListCabinetEV)
		public.POST("/create-evcabinet", cabinet.CreateEVCabinet) // เพิ่มข้อมูลใหม่
		public.PUT("/evcabinet/:id", cabinet.UpdateEVCabinetByID) // อัปเดตข้อมูลตาม ID
		public.DELETE("/evcabinet/:id", cabinet.DeleteEVCabinetByID)

		//Notify
		public.GET("/booking/reminder", notify.SendBookingReminder)

	}

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	r.Run("localhost:" + PORT)
	//r.Run("0.0.0.0:" + PORT)
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
