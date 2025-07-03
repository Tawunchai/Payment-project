import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListEVCharging } from "../../../services/index";
import { EVchargingInterface } from "../../../interface/IEV";
import logo from "../../../assets/picture/Direct_Energy_logo.svg.png";
import { Divider, Slider, ConfigProvider } from "antd";

const Index = () => {
  const [evChargers, setEvChargers] = useState<EVchargingInterface[]>([]);
  const [powerMap, setPowerMap] = useState<{ [id: number]: number }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const data = await ListEVCharging();
      if (data) {
        setEvChargers(data);

        // ตั้งค่าเริ่มต้นกำลังไฟเป็น 20
        const initialPower: { [id: number]: number } = {};
        data.forEach(item => {
          initialPower[item.ID] = 20;
        });
        setPowerMap(initialPower);
      }
    };
    fetchData();
  }, []);

  const handleNext = () => {
  const selectedData = evChargers.map((charger) => {
    const power = powerMap[charger.ID] || 0;
    return {
      id: charger.ID,          // เพิ่ม id (หรือตามชื่อที่ backend ต้องการ)
      name: charger.Name,
      power,
      total: charger.Price * power,
      picture: charger.Picture,
    };
  });

  navigate("/user/payment", { state: { chargers: selectedData } });
};

  return (
    <div className="w-full p-6 space-y-8 text-gray-800">
      <img src={logo} alt="Logo" className="w-[150px]" />
      <div className="space-y-6">
        <h1 className="text-2xl text-gray-600 font-bold">เลือกไฟฟ้าที่ต้องการชาร์จ</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2">
            <div className="w-full max-w-full border rounded-xl p-5 space-y-6 shadow-sm bg-white">
              <ConfigProvider
                theme={{
                  components: {
                    Slider: {
                      colorPrimary: "#ea580c",
                      colorPrimaryHover: "#c2410c",
                    },
                  },
                }}
              >
                {evChargers.map((charger) => {
                  const power = powerMap[charger.ID] || 0;
                  const total = charger.Price * power;

                  return (
                    <div key={charger.ID}>
                      <div className="flex gap-4 mb-4">
                        <img
                          src={`http://localhost:8000/${charger.Picture}`}
                          alt={charger.Name}
                          className="w-24 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{charger.Name}</h3>
                          <p className="text-orange-700 font-bold mt-1">
                            ฿{charger.Price.toFixed(2)} / Power
                          </p>
                          <div className="mt-3">
                            <span className="text-sm font-medium block mb-1">
                              กำลังไฟ (Power): {power}
                            </span>
                            <Slider
                              min={1}
                              max={100}
                              value={power}
                              onChange={(value) =>
                                setPowerMap((prev) => ({
                                  ...prev,
                                  [charger.ID]: value,
                                }))
                              }
                            />
                            <p className="text-sm text-gray-600 mt-1">
                              ยอดที่ต้องชำระ: ฿{total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Divider className="!my-4" />
                    </div>
                  );
                })}
              </ConfigProvider>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-orange-700 text-white py-2 rounded-xl text-lg mt-6 hover:bg-orange-800 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
