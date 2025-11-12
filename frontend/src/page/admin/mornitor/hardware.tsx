import React, { useEffect, useState } from "react";
import { connectHardwareSocket, sendHardwareCommand } from "../../../services";

const Hardware: React.FC = () => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [log, setLog] = useState<string[]>([]);

  // ✅ เชื่อมต่อ WebSocket เมื่อเปิดหน้า
  useEffect(() => {
    const socket = connectHardwareSocket((data) => {
      const text = typeof data === "string" ? data : JSON.stringify(data);
      setLog((prev) => [...prev, `📩 Received: ${text}`]);
    });

    setWs(socket);
    return () => socket.close();
  }, []);

  // ✅ ฟังก์ชันส่งคำสั่งไปยัง Hardware
  const handleSendCommand = () => {
    if (!ws) {
      alert("WebSocket ยังไม่เชื่อมต่อ");
      return;
    }

    // ตัวอย่างคำสั่ง
    const command = {
      solar_kwh: 3.5,
      grid_kwh: 1.2,
    };

    sendHardwareCommand(ws, "hardware_001", command);
    setLog((prev) => [...prev, `📤 Sent: ${JSON.stringify(command)}`]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          ⚙️ Hardware Command Center
        </h1>

        <button
          onClick={handleSendCommand}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
        >
          🚀 Send Command (solar_kwh=3.5, grid_kwh=1.2)
        </button>

        <div className="mt-6 bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto text-sm font-mono border border-gray-200">
          {log.length === 0 ? (
            <p className="text-gray-400 text-center">ยังไม่มีข้อมูล...</p>
          ) : (
            log.map((item, i) => (
              <div key={i} className="mb-1">
                {item}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Hardware;
