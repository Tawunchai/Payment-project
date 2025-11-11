package ocpp

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

var (
	clients   = make(map[*websocket.Conn]bool)
	clientsMu sync.Mutex
)

// ✅ สำหรับ frontend ที่เข้ามารับข้อมูล
func HandleFrontend(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()

	// ✅ แสดงเฉพาะตอนเชื่อมต่อครั้งแรก
	println("🌐 Frontend connected")

	for {
		if _, _, err := conn.NextReader(); err != nil {
			clientsMu.Lock()
			delete(clients, conn)
			clientsMu.Unlock()
			break
		}
	}
}

// ✅ สำหรับตู้ EV ที่ส่งข้อมูลเข้ามา
func HandleOCPP(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	defer conn.Close()

	chargerID := c.Param("chargerID")
	// ✅ แสดงเฉพาะตอนเชื่อมต่อครั้งแรก
	println("🚗 Charger connected:", chargerID)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}

		// ✅ Parse JSON frame [messageType, messageID, action, payload]
		var frame []interface{}
		if err := json.Unmarshal(msg, &frame); err != nil {
			continue
		}

		if len(frame) >= 3 {
			messageType, ok := frame[0].(float64)
			if !ok {
				continue
			}
			messageID, _ := frame[1].(string)
			action, _ := frame[2].(string)

			if int(messageType) == 2 {
				switch action {
				case "BootNotification":
					// ✅ ตอบกลับ BootNotification
					response := []interface{}{
						3,
						messageID,
						map[string]interface{}{
							"status":      "Accepted",
							"currentTime": "2025-11-11T12:00:00Z",
							"interval":    30,
						},
					}
					respJSON, _ := json.Marshal(response)
					conn.WriteMessage(websocket.TextMessage, respJSON)

				case "MeterValues":
					// ✅ ตอบกลับ MeterValues
					response := []interface{}{
						3,
						messageID,
						map[string]interface{}{},
					}
					respJSON, _ := json.Marshal(response)
					conn.WriteMessage(websocket.TextMessage, respJSON)
				}
			}
		}

		// ✅ ส่งต่อข้อมูลให้ frontend ทุกตัว
		clientsMu.Lock()
		for client := range clients {
			client.WriteMessage(websocket.TextMessage, msg)
		}
		clientsMu.Unlock()
	}
}
