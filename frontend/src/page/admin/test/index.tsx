// components/InverterStatus.tsx

import { useEffect, useState } from "react";
import { GetInverterStatus, } from "../../../services/index";
import {InverterStatus} from "../../../interface/IInverterStatus"

const InverterStatusComponent = () => {
  const [data, setData] = useState<InverterStatus | null>(null);

  useEffect(() => {
    GetInverterStatus().then(setData);
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">สถานะ Inverter</h2>
      {data ? (
        <p>กำลังไฟฟ้าปัจจุบัน: <strong>{data.active_power}</strong> {data.unit}</p>
      ) : (
        <p>กำลังโหลดข้อมูล...</p>
      )}
    </div>
  );
};

export default InverterStatusComponent;
