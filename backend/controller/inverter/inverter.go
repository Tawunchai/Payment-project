package inverter

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/goburrow/modbus"
)

// GetInverterStatus ดึงข้อมูล Active Power จาก SUN2000
func GetInverterStatus(c *gin.Context) {
	handler := modbus.NewTCPClientHandler("192.168.1.139:502") // ใช้ IP เครื่อง SUN2000 ของคุณ
	handler.SlaveId = 1
	handler.Timeout = 5 * 1000000000 // 5 วินาที (5e9 ns)

	err := handler.Connect()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "เชื่อมต่อ inverter ไม่สำเร็จ: " + err.Error(),
			"inverterIP": "192.168.1.139:502",
		})
		return
	}
	defer handler.Close()

	client := modbus.NewClient(handler)

	// อ่านค่า Active Power ที่ Register 32080 (2 register)
	results, err := client.ReadHoldingRegisters(32080, 2)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "อ่านข้อมูลจาก inverter ไม่สำเร็จ: " + err.Error(),
		})
		return
	}

	if len(results) < 4 {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "ข้อมูลจาก inverter ไม่สมบูรณ์",
		})
		return
	}

	// แปลง 4 byte เป็น int16 (อาจต้องปรับตามข้อมูลจริง)
	power := int16(results[0])<<8 | int16(results[1])

	c.JSON(http.StatusOK, gin.H{
		"active_power": power,
		"unit":         "Watt",
	})
}
