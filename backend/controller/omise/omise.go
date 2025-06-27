package omise

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type ChargeRequest struct {
	Amount int    `json:"amount"`
	Token  string `json:"token"`
}

func CreateCharge(c *gin.Context) {
	var req ChargeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	payload := map[string]interface{}{
		"amount":   req.Amount * 100, // สตางค์
		"currency": "thb",
		"card":     req.Token,
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to marshal JSON"})
		return
	}

	request, err := http.NewRequest("POST", "https://api.omise.co/charges", bytes.NewBuffer(payloadBytes))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create HTTP request"})
		return
	}

	secretKey := os.Getenv("OMISE_SECRET_KEY")
	if secretKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OMISE_SECRET_KEY not set"})
		return
	}

	request.SetBasicAuth(secretKey, "")
	request.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(request)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to call Omise API"})
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		c.JSON(resp.StatusCode, gin.H{"error": string(body)})
		return
	}

	var result map[string]interface{}
	if err := json.Unmarshal(body, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse Omise response"})
		return
	}

	c.JSON(http.StatusOK, result)
}

type PromptPayRequest struct {
	Amount int `json:"amount"`
}

// เก็บสถานะชำระเงิน (จำลองแทน DB)
var (
	statusMap = make(map[string]string)
	mu        sync.Mutex
)

// สร้าง PromptPay Charge
func CreatePromptPayCharge(c *gin.Context) {
	var req PromptPayRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	secretKey := os.Getenv("OMISE_SECRET_KEY")
	if secretKey == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "OMISE_SECRET_KEY not set"})
		return
	}

	// สร้าง Source
	sourcePayload := map[string]interface{}{
		"type":     "promptpay",
		"amount":   req.Amount * 100,
		"currency": "thb",
	}

	sourceBytes, _ := json.Marshal(sourcePayload)
	sourceReq, _ := http.NewRequest("POST", "https://api.omise.co/sources", bytes.NewBuffer(sourceBytes))
	sourceReq.SetBasicAuth(secretKey, "")
	sourceReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	sourceResp, err := client.Do(sourceReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "source creation failed"})
		return
	}
	defer sourceResp.Body.Close()

	body, _ := io.ReadAll(sourceResp.Body)
	if sourceResp.StatusCode >= 400 {
		c.JSON(sourceResp.StatusCode, gin.H{"error": string(body)})
		return
	}

	var sourceData map[string]interface{}
	json.Unmarshal(body, &sourceData)

	// สร้าง Charge จาก source
	chargePayload := map[string]interface{}{
		"amount":   req.Amount * 100,
		"currency": "thb",
		"source":   sourceData["id"],
	}

	chargeBytes, _ := json.Marshal(chargePayload)
	chargeReq, _ := http.NewRequest("POST", "https://api.omise.co/charges", bytes.NewBuffer(chargeBytes))
	chargeReq.SetBasicAuth(secretKey, "")
	chargeReq.Header.Set("Content-Type", "application/json")

	chargeResp, err := client.Do(chargeReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "charge creation failed"})
		return
	}
	defer chargeResp.Body.Close()

	chargeBody, _ := io.ReadAll(chargeResp.Body)
	if chargeResp.StatusCode >= 400 {
		c.JSON(chargeResp.StatusCode, gin.H{"error": string(chargeBody)})
		return
	}

	var chargeData map[string]interface{}
	json.Unmarshal(chargeBody, &chargeData)

	// เก็บสถานะ charge เป็น pending ตอนสร้าง
	mu.Lock()
	statusMap[chargeData["id"].(string)] = "pending"
	mu.Unlock()

	c.JSON(http.StatusOK, chargeData)
}

// รับ webhook จาก Omise เพื่ออัพเดตสถานะ
func OmiseWebhook(c *gin.Context) {
	var payload struct {
		Object string `json:"object"`
		Key    string `json:"key"`
		Data   struct {
			ID     string `json:"id"`
			Status string `json:"status"`
		} `json:"data"`
	}

	if err := c.BindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON"})
		return
	}

	if payload.Object == "event" {
		mu.Lock()
		switch payload.Key {
		case "charge.create":
			statusMap[payload.Data.ID] = "pending"
		case "charge.complete":
			statusMap[payload.Data.ID] = "successful"
		case "charge.failed":
			statusMap[payload.Data.ID] = "failed"
		case "charge.expire":
			statusMap[payload.Data.ID] = "expired"
		}
		mu.Unlock()
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// เช็คสถานะ charge
func GetChargeStatus(c *gin.Context) {
	chargeId := c.Param("chargeId")
	mu.Lock()
	status, exists := statusMap[chargeId]
	mu.Unlock()

	if !exists {
		status = "pending"
	}

	c.JSON(http.StatusOK, gin.H{"status": status})
}

// simulate webhook confirm ชำระเงินสำเร็จ (สำหรับทดสอบ)
func ConfirmCharge(c *gin.Context) {
	chargeId := c.Param("chargeId")

	payload := map[string]interface{}{
		"object": "event",
		"key":    "charge.complete",
		"data": map[string]interface{}{
			"id":     chargeId,
			"status": "successful",
			"object": "charge",
		},
	}

	payloadBytes, _ := json.Marshal(payload)

	// ส่ง POST ไปยัง webhook endpoint ของเราเอง (localhost)
	http.Post("http://localhost:8000/webhook/omise", "application/json", bytes.NewBuffer(payloadBytes))

	c.JSON(http.StatusOK, gin.H{"message": "Simulated webhook sent"})
}