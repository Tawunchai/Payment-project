import { useState } from "react";
import { useNavigate } from "react-router-dom"; // เพิ่มบรรทัดนี้
import logo from "../../../assets/picture/Direct_Energy_logo.svg.png";
import product1 from "../../../assets/admin/product1.jpg";
import product2 from "../../../assets/admin/product2.jpg";
import { Divider, Slider, ConfigProvider } from "antd";

const Index = () => {
  const [acPower, setAcPower] = useState(20);
  const [dcPower, setDcPower] = useState(20);
  const navigate = useNavigate(); 

  const handleNext = () => {
    navigate("/user/payment"); 
  };

  return (
    <div className="w-full p-6 space-y-8 text-gray-800">
      <img src={logo} alt="Logo" className="w-[150px]" />

      <div className="space-y-6">
        <h1 className="text-2xl text-gray-600 font-bold">เลือกไฟฟ้าที่ต้องการชาร์จ</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ให้กล่องนี้กินเต็ม 2 คอลัมน์ */}
          <div className="col-span-2">
            <div className="w-full max-w-full border rounded-xl p-5 space-y-6 shadow-sm bg-white">
              <ConfigProvider
                theme={{
                  components: {
                    Slider: {
                      colorPrimary: "#ea580c", // orange-600
                      colorPrimaryHover: "#c2410c", // orange-700
                    },
                  },
                }}
              >
                {/* AC Charging */}
                <div className="flex gap-4">
                  <img
                    src={product1}
                    alt="AC Charging"
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">AC Charging</h3>
                    <p className="text-orange-700 font-bold mt-1">
                      ฿1000.00 / Power
                    </p>
                    <div className="mt-3">
                      <span className="text-sm font-medium block mb-1">
                        กำลังไฟ (Power): {acPower}
                      </span>
                      <Slider
                        min={1}
                        max={100}
                        value={acPower}
                        onChange={setAcPower}
                      />
                    </div>
                  </div>
                </div>

                <Divider className="!my-4" />

                {/* DC Charging */}
                <div className="flex gap-4">
                  <img
                    src={product2}
                    alt="DC Charging"
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">DC Charging</h3>
                    <p className="text-orange-700 font-bold mt-1">
                      ฿1000.00 / Power
                    </p>
                    <div className="mt-3">
                      <span className="text-sm font-medium block mb-1">
                        กำลังไฟ (Power): {dcPower}
                      </span>
                      <Slider
                        min={1}
                        max={100}
                        value={dcPower}
                        onChange={setDcPower}
                      />
                    </div>
                  </div>
                </div>
              </ConfigProvider>
            </div>

            {/* ปุ่ม Next */}
            <button
              onClick={handleNext} // เพิ่ม onClick
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
