package solar

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// ✅ WebSocket Upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// ✅ เก็บ frontend connections
var (
	solarClients   = make(map[*websocket.Conn]bool)
	solarClientsMu sync.Mutex
)

// ============================================================================
// 🔹 FRONTEND — สำหรับเว็บ Dashboard
// ============================================================================
func HandleFrontend(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("❌ Upgrade frontend error:", err)
		return
	}
	defer conn.Close()

	solarClientsMu.Lock()
	solarClients[conn] = true
	solarClientsMu.Unlock()

	fmt.Println("🌐 Frontend connected to Solar stream")

	for {
		if _, _, err := conn.NextReader(); err != nil {
			solarClientsMu.Lock()
			delete(solarClients, conn)
			solarClientsMu.Unlock()
			fmt.Println("❌ Frontend disconnected from Solar stream")
			break
		}
	}
}

// ============================================================================
// 🔹 HARDWARE / SOLAR DEVICE — สำหรับอุปกรณ์ที่ส่งข้อมูลเข้ามา
// ============================================================================
func HandleSolar(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("❌ Upgrade solar error:", err)
		return
	}
	defer conn.Close()

	deviceID := c.Param("deviceID")
	fmt.Println("🔋 Solar device connected:", deviceID)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("⚠️  Solar device disconnected:", deviceID)
			break
		}

		// ตอบกลับ hardware
		conn.WriteMessage(websocket.TextMessage, []byte("ready"))

		// ตรวจสอบ JSON ที่เข้ามา
		var jsonData map[string]interface{}
		if err := json.Unmarshal(msg, &jsonData); err != nil {
			fmt.Println("❌ Invalid JSON from solar:", err)
			continue
		}

		fmt.Println("📦 Solar Data Received:", string(msg))

		// ส่งข้อมูลให้ frontend ทุกตัว
		broadcastToFrontend(msg)
	}
}

// ============================================================================
// 🔸 Broadcast ข้อมูลไปยังทุก frontend ที่เชื่อมอยู่
// ============================================================================
func broadcastToFrontend(msg []byte) {
	solarClientsMu.Lock()
	defer solarClientsMu.Unlock()

	for client := range solarClients {
		if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
			client.Close()
			delete(solarClients, client)
		}
	}
}
