import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListEVCharging,
  apiUrlPicture,
  GetCarByUserID,
} from "../../../services";
import { EVchargingInterface } from "../../../interface/IEV";
import { CarsInterface } from "../../../interface/ICar";
import { Slider, ConfigProvider, Modal, Button } from "antd";

// ⚡ EV Minimal Icon
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const Index = () => {
  const [evChargers, setEvChargers] = useState<EVchargingInterface[]>([]);
  const [powerMap, setPowerMap] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const [showCarModal, setShowCarModal] = useState(false);
  const navigate = useNavigate();

  const userID = Number(localStorage.getItem("userid"));

  // ✅ โหลดข้อมูล EV Charger
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await ListEVCharging();
      if (data) {
        setEvChargers(data);
        const init: { [id: number]: number } = {};
        data.forEach((item: EVchargingInterface) => (init[item.ID] = 20));
        setPowerMap(init);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // ✅ คำนวณยอดรวม
  const itemsWithTotal = useMemo(() => {
    return evChargers.map((charger) => {
      const power = powerMap[charger.ID] || 0;
      const total = (charger.Price || 0) * power;
      return { charger, power, total };
    });
  }, [evChargers, powerMap]);

  const grandTotal = useMemo(
    () => itemsWithTotal.reduce((sum, it) => sum + it.total, 0),
    [itemsWithTotal]
  );

  const setPower = (id: number, value: number) => {
    const v = Math.min(100, Math.max(1, value));
    setPowerMap((prev) => ({ ...prev, [id]: v }));
  };

  // ✅ เมื่อผู้ใช้กด Next → ตรวจว่ามีรถหรือไม่
  const handleNext = async () => {
    try {
      const cars: CarsInterface[] | null = await GetCarByUserID(userID);
      if (!cars || cars.length === 0) {
        setShowCarModal(true);
        return;
      }

      const selectedData = evChargers.map((c) => {
        const power = powerMap[c.ID] || 0;
        return {
          id: c.ID,
          name: c.Name,
          power,
          total: (c.Price || 0) * power,
          picture: c.Picture,
        };
      });

      navigate("/user/payment", { state: { chargers: selectedData } });
    } catch (err) {
      console.error("Error checking user car:", err);
      setShowCarModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- HEADER ---------- */}
      <header
        className="sticky top-0 z-20 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => window.history.back()}
            aria-label="ย้อนกลับ"
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
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
            <span className="text-sm font-semibold tracking-wide">
              EV Selector
            </span>
          </div>
        </div>
      </header>

      {/* ---------- CONTENT ---------- */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* Summary */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
          <span className="text-sm text-blue-900">ยอดรวมทั้งหมด</span>
          <span className="text-xl font-bold text-blue-700">
            ฿{grandTotal.toFixed(2)}
          </span>
        </div>

        {/* รายการ Charger */}
        <section className="space-y-3">
          <ConfigProvider
            theme={{
              components: {
                Slider: {
                  colorPrimary: "#2563eb",
                  colorPrimaryHover: "#1d4ed8",
                  handleColor: "#2563eb",
                  railBg: "#e5e7eb",
                  trackBg: "#2563eb",
                },
              },
            }}
          >
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-gray-100 h-28 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              itemsWithTotal.map(({ charger, power, total }) => (
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
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {charger.Name}
                        </h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ฿{(charger.Price || 0).toFixed(2)} / Power
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPower(charger.ID, power - 1)}
                            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                          >
                            –
                          </button>
                          <span className="min-w-[2ch] text-sm font-medium text-gray-900 text-center">
                            {power}
                          </span>
                          <button
                            onClick={() => setPower(charger.ID, power + 1)}
                            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm text-gray-600">
                          ยอดชำระ:{" "}
                          <b className="text-blue-700">฿{total.toFixed(2)}</b>
                        </span>
                      </div>
                      <div className="mt-2">
                        <Slider
                          min={1}
                          max={100}
                          value={power}
                          onChange={(value) =>
                            setPower(charger.ID, value as number)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ConfigProvider>
        </section>
      </main>

      {/* ---------- Bottom Bar ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-500">ยอดรวม</span>
            <span className="text-lg font-bold text-blue-700">
              ฿{grandTotal.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleNext}
            disabled={loading || evChargers.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-white transition
              ${
                loading || evChargers.length === 0
                  ? "bg-blue-300"
                  : "bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 active:from-blue-800 active:to-sky-700 shadow-md"
              }`}
          >
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold">Next</span>
          </button>
        </div>
      </div>

      {/* ---------- EV BLUE MODAL (Clean) ---------- */}
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
            className="rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 border-0 shadow-md"
            onClick={() => navigate("/user/add-cars")}
          >
            ไปเพิ่มข้อมูลรถ
          </Button>
        </div>
      </Modal>

      <style>
        {`
          .ev-modal-clean .ant-modal-content {
            border-radius: 20px !important;
            background: linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%) !important;
            box-shadow: 0 8px 30px rgba(59,130,246,0.25) !important;
            text-align: center;
            padding: 32px 28px !important;
            border: none !important;
            animation: fadeIn 0.3s ease-out;
          }

          .ev-modal-clean .ant-modal-body {
            padding: 0 !important;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default Index;
