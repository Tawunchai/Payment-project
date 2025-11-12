package ocpp

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// ✅ WebSocket Upgrader รองรับ OCPP 1.6
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
	Subprotocols: []string{"ocpp1.6"}, // ต้องใส่ เพื่อจับคู่กับ Python simulator
}

// ✅ เก็บ frontend clients ที่เชื่อมเข้ามา
var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
)

// ============================================================================
// 🔹 สำหรับ FRONTEND ที่เข้ามารับข้อมูล
// ============================================================================
func HandleFrontend(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("❌ Upgrade frontend error:", err)
		return
	}
	defer conn.Close()

	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()

	fmt.Println("🌐 Frontend connected")

	for {
		if _, _, err := conn.NextReader(); err != nil {
			clientsMu.Lock()
			delete(clients, conn)
			clientsMu.Unlock()
			fmt.Println("❌ Frontend disconnected")
			break
		}
	}
}

// ============================================================================
// 🔹 สำหรับ CHARGER (OCPP 1.6) ที่ส่งข้อมูลเข้ามา
// ============================================================================
func HandleOCPP(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Println("❌ Upgrade OCPP error:", err)
		return
	}
	defer conn.Close()

	chargerID := c.Param("chargerID")
	fmt.Println("🚗 Charger connected:", chargerID)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("⚠️  Charger disconnected:", chargerID)
			break
		}

		// ✅ ตอบกลับข้อความ "ready" ทุกครั้งที่มีการส่งข้อมูลเข้ามา
		if err := conn.WriteMessage(websocket.TextMessage, []byte("ready")); err != nil {
			fmt.Println("❌ Failed to send ready response:", err)
		}

		// ✅ แปลง JSON frame สำหรับ OCPP message
		var frame []interface{}
		if err := json.Unmarshal(msg, &frame); err != nil {
			fmt.Println("❌ JSON parse error:", err)
			continue
		}

		if len(frame) < 3 {
			continue
		}

		messageType, ok := frame[0].(float64)
		if !ok {
			continue
		}
		messageID, _ := frame[1].(string)
		action, _ := frame[2].(string)

		if int(messageType) == 2 {
			switch action {
			case "BootNotification":
				// 🔸 ตอบกลับ BootNotification
				response := []interface{}{
					3,
					messageID,
					map[string]interface{}{
						"status":      "Accepted",
						"currentTime": "2025-11-12T12:00:00Z",
						"interval":    30,
					},
				}
				respJSON, _ := json.Marshal(response)
				conn.WriteMessage(websocket.TextMessage, respJSON)
				fmt.Println("✅ BootNotification Accepted")

			case "MeterValues":
				// 🔸 ตอบกลับ MeterValues
				response := []interface{}{
					3,
					messageID,
					map[string]interface{}{},
				}
				respJSON, _ := json.Marshal(response)
				conn.WriteMessage(websocket.TextMessage, respJSON)
				fmt.Println("📊 MeterValues Received and Acknowledged")

			default:
				fmt.Println("ℹ️ Unknown OCPP Action:", action)
			}
		}

		// ✅ Broadcast ไปยัง frontend ทุกตัว
		broadcastToFrontend(msg)
	}
}

// ============================================================================
// 🔸 Broadcast ข้อมูลให้ทุก frontend ที่เชื่อมอยู่
// ============================================================================
func broadcastToFrontend(msg []byte) {
	clientsMu.Lock()
	defer clientsMu.Unlock()

	for client := range clients {
		if err := client.WriteMessage(websocket.TextMessage, msg); err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}
