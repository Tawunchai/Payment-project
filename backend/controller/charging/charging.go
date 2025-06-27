package charging

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/Tawunchai/work-project/config"
	"github.com/Tawunchai/work-project/entity"
)

func ListEVData(c *gin.Context) {
	var evs []entity.EVcharging

	db := config.DB()
	results := db.
		Preload("Employee.User"). 
		Preload("Employee").      
		Preload("Status").
		Preload("Type").
		Find(&evs)

	if results.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": results.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, evs)
}

func UpdateEVByID(c *gin.Context) {
	id := c.Param("id")

	var ev entity.EVcharging
	if err := config.DB().First(&ev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูล EV Charging ที่ต้องการอัปเดต"})
		return
	}

	type UpdateEVInput struct {
		Name       *string  `json:"name"`
		Voltage    *float64 `json:"voltage"`
		Current    *float64 `json:"current"`
		Price      *float64 `json:"price"`
		EmployeeID *uint    `json:"employeeID"`
		StatusID   *uint    `json:"statusID"`
		TypeID     *uint    `json:"typeID"`
	}

	var input UpdateEVInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูล JSON ไม่ถูกต้อง"})
		return
	}

	if input.Name != nil {
		ev.Name = *input.Name
	}
	if input.Voltage != nil {
		ev.Voltage = *input.Voltage
	}
	if input.Current != nil {
		ev.Current = *input.Current
	}
	if input.Price != nil {
		ev.Price = *input.Price
	}
	if input.EmployeeID != nil {
		ev.EmployeeID = input.EmployeeID
	}
	if input.StatusID != nil {
		ev.StatusID = *input.StatusID
	}
	if input.TypeID != nil {
		ev.TypeID = *input.TypeID
	}

	// บันทึก
	if err := config.DB().Save(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอัปเดตข้อมูล EV Charging ได้"})
		return
	}

	// โหลดข้อมูลความสัมพันธ์ใหม่
	if err := config.DB().
		Preload("Employee").
		Preload("Status").
		Preload("Type").
		First(&ev, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "โหลดข้อมูล EV Charging หลังอัปเดตไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "อัปเดตข้อมูล EV Charging สำเร็จ",
		"data":    ev,
	})
}

func CreateEV(c *gin.Context) {
	var input struct {
		Name       string  `json:"name" binding:"required"`
		Voltage    float64 `json:"voltage" binding:"required"`
		Current    float64 `json:"current" binding:"required"`
		Price      float64 `json:"price" binding:"required"`
		EmployeeID *uint   `json:"employeeID"`  
		StatusID   uint    `json:"statusID" binding:"required"`
		TypeID     uint    `json:"typeID" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลที่ส่งมาไม่ถูกต้อง", "detail": err.Error()})
		return
	}

	ev := entity.EVcharging{
		Name:       input.Name,
		Voltage:    input.Voltage,
		Current:    input.Current,
		Price:      input.Price,
		EmployeeID: input.EmployeeID,
		StatusID:   input.StatusID,
		TypeID:     input.TypeID,
	}

	if err := config.DB().Create(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูล EV Charging ได้", "detail": err.Error()})
		return
	}

	// preload ความสัมพันธ์หลังสร้าง
	if err := config.DB().
		Preload("Employee.User").
		Preload("Employee").
		Preload("Status").
		Preload("Type").
		First(&ev, ev.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "โหลดข้อมูลหลังบันทึกไม่สำเร็จ"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "สร้างข้อมูล EV Charging สำเร็จ",
		"data":    ev,
	})
}


func DeleteEVByID(c *gin.Context) {
	id := c.Param("id")

	db := config.DB()
	var ev entity.EVcharging
	if err := db.First(&ev, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "EVcharging not found"})
		return
	}

	if err := db.Delete(&ev).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "EVcharging deleted successfully"})
}
