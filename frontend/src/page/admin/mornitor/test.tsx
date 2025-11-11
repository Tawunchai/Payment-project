// src/page/admin/mornitor/test.tsx
import React, { useEffect, useState } from "react";
import { connectOcppSocket } from "../../../services";

interface MeterData {
  power: string;
  energy: string;
  voltage: string;
  current: string;
  timestamp: string;
}

const Test: React.FC = () => {
  const [data, setData] = useState<MeterData | null>(null);

  useEffect(() => {
    const ws = connectOcppSocket((raw: any) => {
      try {
        // ตรวจว่าเป็น array แบบ OCPP [2, id, "MeterValues", payload]
        if (Array.isArray(raw) && raw[2] === "MeterValues") {
          const payload = raw[3];
          const meter = payload.meterValue[0];
          const sampled = meter.sampledValue;

          // แปลงข้อมูลให้อยู่ในรูป object
          const meterData: MeterData = {
            power: sampled.find((x: any) => x.measurand === "Power.Active.Import")?.value || "0",
            energy: sampled.find((x: any) => x.measurand === "Energy.Active.Import.Register")?.value || "0",
            voltage: sampled.find((x: any) => x.measurand === "Voltage")?.value || "0",
            current: sampled.find((x: any) => x.measurand === "Current.Import")?.value || "0",
            timestamp: meter.timestamp,
          };

          setData(meterData); // ✅ อัปเดตค่าใหม่ทุกครั้ง
        }
      } catch (err) {
        console.error("Parse error:", err);
      }
    });

    return () => ws.close();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-[350px] text-center border border-gray-200">
        <h1 className="text-xl font-semibold text-blue-700 mb-3">
          ⚡ EV Charger Monitor
        </h1>

        {data ? (
          <div className="space-y-2">
            <div className="text-gray-600">
              <span className="font-semibold text-gray-800">Power: </span>
              <span className="text-blue-600 text-lg">{data.power}</span> kW
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-gray-800">Energy: </span>
              <span className="text-green-600 text-lg">{data.energy}</span> kWh
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-gray-800">Voltage: </span>
              <span className="text-orange-600 text-lg">{data.voltage}</span> V
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-gray-800">Current: </span>
              <span className="text-purple-600 text-lg">{data.current}</span> A
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <p className="text-gray-400">Waiting for EV charger data...</p>
        )}
      </div>
    </div>
  );
};

export default Test;
