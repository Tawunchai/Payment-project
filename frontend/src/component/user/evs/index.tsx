import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListEVCharging,
  apiUrlPicture,
  GetCarByUserID,
} from "../../../services";
import { EVchargingInterface } from "../../../interface/IEV";
import { CarsInterface } from "../../../interface/ICar";
import { ConfigProvider, Modal, Button, Input, Slider } from "antd";

// ⚡ EV Icon
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const Index = () => {
  const [evChargers, setEvChargers] = useState<EVchargingInterface[]>([]);
  const [percentMap, setPercentMap] = useState<{ [id: number]: number }>({});
  const [money, setMoney] = useState<number>(1000);
  const [loading, setLoading] = useState(true);
  const [showCarModal, setShowCarModal] = useState(false);
  const navigate = useNavigate();

  const userID = Number(localStorage.getItem("userid"));

  // โหลดข้อมูล EV Charger
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await ListEVCharging();
      if (data && data.length > 0) {
        setEvChargers(data.slice(0, 2)); // สมมติใช้ 2 ตัว
        const init: { [id: number]: number } = {};
        data.slice(0, 2).forEach((item, index) => {
          init[item.ID] = index === 0 ? 100 : 0; // เริ่มต้น 100 / 0
        });
        setPercentMap(init);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ปรับเปอร์เซ็นต์
  const setPercent = (id: number, value: number) => {
    if (evChargers.length !== 2) return;
    const other = evChargers.find((c) => c.ID !== id);
    const fixed = Math.min(100, Math.max(0, value));
    const otherValue = 100 - fixed;
    setPercentMap({
      [id]: fixed,
      [other!.ID]: otherValue,
    });
  };

  // คำนวณ
  const itemsWithCalc = useMemo(() => {
    return evChargers.map((charger) => {
      const percent = percentMap[charger.ID] || 0;
      const amount = (money * percent) / 100;
      const power = charger.Price ? amount / charger.Price : 0;
      const total = (charger.Price || 0) * power;
      return { charger, percent, amount, power, total };
    });
  }, [evChargers, percentMap, money]);

  const totalAmount = useMemo(
    () => itemsWithCalc.reduce((sum, it) => sum + it.amount, 0),
    [itemsWithCalc]
  );

  // กด Next
  const handleNext = async () => {
    try {
      const cars: CarsInterface[] | null = await GetCarByUserID(userID);
      if (!cars || cars.length === 0) {
        setShowCarModal(true);
        return;
      }

      const payload = itemsWithCalc.map((it) => ({
        id: it.charger.ID,
        name: it.charger.Name,
        picture: it.charger.Picture,
        power: it.power,
        total: it.total,
        percent: it.percent,
        price_per_power: it.charger.Price,
        amount: it.amount,
      }));

      console.log("📦 Data to send:", payload);
      console.log("💰 Total Amount:", totalAmount);

      // ✅ ส่งข้อมูลไปหน้า /user/payment
      navigate("/user/payment", { state: { chargers: payload } });
    } catch (err) {
      console.error("Error checking user car:", err);
      setShowCarModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md">
        <div className="w-full px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M15 18l-6-6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-base font-semibold tracking-wide">
              EV Selector (Percent Mode)
            </span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* Input เงิน */}
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3">
          <label className="text-sm font-medium text-blue-700">
            💰 ใส่จำนวนเงิน (บาท)
          </label>
          <Input
            type="number"
            min={0}
            value={money}
            onChange={(e) => setMoney(Number(e.target.value) || 0)}
            className="mt-2 rounded-lg border-blue-200"
          />
        </div>

        {/* สรุป */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-100 px-4 py-3">
          <span className="text-sm text-blue-900">ยอดรวมทั้งหมด</span>
          <span className="text-xl font-bold text-blue-700">
            ฿{totalAmount.toFixed(2)}
          </span>
        </div>

        {/* รายการ Charger */}
        <ConfigProvider
          theme={{
            components: {
              Slider: {
                colorPrimary: "#2563eb",
                handleColor: "#2563eb",
                railBg: "#e5e7eb",
              },
            },
          }}
        >
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-100 h-28 animate-pulse"
                />
              ))}
            </div>
          ) : (
            itemsWithCalc.map(({ charger, percent, power }) => (
              <div
                key={charger.ID}
                className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`${apiUrlPicture}${charger.Picture}`}
                    alt={charger.Name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {charger.Name}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        ฿{(charger.Price || 0).toFixed(2)} / Power
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPercent(charger.ID, percent - 10)}
                          className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                        >
                          –
                        </button>
                        <span className="min-w-[3ch] text-sm font-medium text-gray-900 text-center">
                          {percent}%
                        </span>
                        <button
                          onClick={() => setPercent(charger.ID, percent + 10)}
                          className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm text-gray-600">
                        ⚡ {power.toFixed(2)} Power
                      </span>
                    </div>

                    <div className="mt-2">
                      <Slider
                        min={0}
                        max={100}
                        value={percent}
                        onChange={(value) => setPercent(charger.ID, value as number)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </ConfigProvider>
      </main>

      {/* Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-500">ยอดรวม</span>
            <span className="text-lg font-bold text-blue-700">
              ฿{totalAmount.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleNext}
            disabled={loading || evChargers.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-white transition ${
              loading || evChargers.length === 0
                ? "bg-blue-300"
                : "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 shadow-md"
            }`}
          >
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold">Next</span>
          </button>
        </div>
      </div>

      {/* Modal แจ้งเตือน */}
      <Modal
        open={showCarModal}
        onCancel={() => setShowCarModal(false)}
        footer={null}
        centered
        closable={false}
        maskStyle={{ backgroundColor: "rgba(0, 102, 204, 0.15)" }}
        className="ev-modal-clean"
      >
        <div className="text-4xl mb-3">🚗</div>
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          ไม่พบข้อมูลรถของคุณ
        </h3>
        <p className="text-gray-600 mb-5">
          ก่อนทำการชำระเงิน กรุณาเพิ่มข้อมูลรถของคุณในระบบ
        </p>
        <div className="flex justify-center gap-3">
          <Button
            onClick={() => setShowCarModal(false)}
            className="rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            ยกเลิก
          </Button>
          <Button
            type="primary"
            className="rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 border-0 shadow-md"
            onClick={() => navigate("/user/add-cars")}
          >
            ไปเพิ่มข้อมูลรถ
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Index;
