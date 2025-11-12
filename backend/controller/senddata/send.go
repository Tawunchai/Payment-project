package hardware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// ======================================================
// 🔧 WebSocket Upgrader
// ======================================================
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// ======================================================
// 🌐 เก็บ client ทั้งสองฝั่ง (frontend + hardware)
// ======================================================
var (
	hardwareMu       sync.Mutex
	frontendClients  = make(map[*websocket.Conn]bool)
	hardwareClients  = make(map[string]*websocket.Conn) // deviceID → conn
)

// ======================================================
// 💻 FRONTEND — สำหรับ web dashboard (React)
// ======================================================
func HandleFrontend(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("❌ Upgrade frontend error:", err)
		return
	}
	defer conn.Close()

	hardwareMu.Lock()
	frontendClients[conn] = true
	hardwareMu.Unlock()

	fmt.Println("💻 Frontend connected to Hardware stream")

	for {
		// 📥 รอ message จาก web (เช่น คำสั่งให้ hardware ทำงาน)
		_, msg, err := conn.ReadMessage()
		if err != nil {
			hardwareMu.Lock()
			delete(frontendClients, conn)
			hardwareMu.Unlock()
			fmt.Println("❌ Frontend disconnected")
			break
		}

		var data map[string]interface{}
		if err := json.Unmarshal(msg, &data); err == nil {
			deviceID, _ := data["device_id"].(string)
			if payload, ok := data["command"]; ok {
				sendCommandToHardware(deviceID, payload)
			}
		}
	}
}

// ======================================================
// 🔋 HARDWARE — สำหรับอุปกรณ์จริง เช่น ESP32, Solar Controller
// ======================================================
func HandleHardware(c *gin.Context) {
	deviceID := c.Param("deviceID")

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("❌ Upgrade hardware error:", err)
		return
	}
	defer conn.Close()

	hardwareMu.Lock()
	hardwareClients[deviceID] = conn
	hardwareMu.Unlock()

	fmt.Printf("🔌 Hardware '%s' connected\n", deviceID)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			hardwareMu.Lock()
			delete(hardwareClients, deviceID)
			hardwareMu.Unlock()
			fmt.Printf("⚠️ Hardware '%s' disconnected\n", deviceID)
			break
		}

		conn.WriteMessage(websocket.TextMessage, []byte("ready"))

		var jsonData map[string]interface{}
		if err := json.Unmarshal(msg, &jsonData); err != nil {
			fmt.Println("❌ Invalid JSON from hardware:", err)
			continue
		}

		fmt.Printf("📦 Data from '%s': %s\n", deviceID, string(msg))

		broadcastToFrontend(msg)
	}
}

// ======================================================
// 📤 Broadcast จาก Hardware → ทุก frontend
// ======================================================
func broadcastToFrontend(msg []byte) {
	hardwareMu.Lock()
	defer hardwareMu.Unlock()

	for client := range frontendClients {
		if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
			client.Close()
			delete(frontendClients, client)
		}
	}
}

// ======================================================
// 📡 ส่งคำสั่งจาก frontend → hardware เฉพาะตัว
// ======================================================
func sendCommandToHardware(deviceID string, payload interface{}) {
	hardwareMu.Lock()
	defer hardwareMu.Unlock()

	conn, ok := hardwareClients[deviceID]
	if !ok {
		fmt.Printf("⚠️ Hardware '%s' not connected\n", deviceID)
		return
	}

	msg := map[string]interface{}{
		"type":    "command",
		"payload": payload,
	}
	jsonMsg, _ := json.Marshal(msg)

	if err := conn.WriteMessage(websocket.TextMessage, jsonMsg); err != nil {
		fmt.Printf("❌ Failed to send command to '%s': %v\n", deviceID, err)
		conn.Close()
		delete(hardwareClients, deviceID)
	} else {
		fmt.Printf("✅ Sent command to '%s': %s\n", deviceID, string(jsonMsg))
	}
}
