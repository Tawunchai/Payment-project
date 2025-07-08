package inverter

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

type InverterResponse struct {
	ActivePower int    `json:"active_power"`
	Unit        string `json:"unit"`
}

func GetInverterStatus(c *gin.Context) {
	resp, err := http.Get("http://localhost:9000/active_power")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "เชื่อมต่อ Python API ไม่สำเร็จ: " + err.Error(),
		})
		return
	}
	defer resp.Body.Close()

	var result InverterResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "อ่านข้อมูล JSON ไม่สำเร็จ: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, result)
}
