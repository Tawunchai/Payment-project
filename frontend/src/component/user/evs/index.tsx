import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ListEVCharging, apiUrlPicture } from "../../../services/index";
import { EVchargingInterface } from "../../../interface/IEV";
import { Slider, ConfigProvider } from "antd";

// EV bolt icon (minimal)
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const Index = () => {
  const [evChargers, setEvChargers] = useState<EVchargingInterface[]>([]);
  const [powerMap, setPowerMap] = useState<{ [id: number]: number }>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const handleNext = () => {
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
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ---------- HEADER: แบบเดียวกับ Payment ---------- */}
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
            {/* chevron-left */}
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold tracking-wide">EV Selector</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* Summary Capsule */}
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
          <span className="text-sm text-blue-900">ยอดรวมทั้งหมด</span>
          <span className="text-xl font-bold text-blue-700">฿{grandTotal.toFixed(2)}</span>
        </div>

        {/* List (มินิมอลการ์ด) */}
        <section className="space-y-3">
          <ConfigProvider
            theme={{
              components: {
                Slider: {
                  colorPrimary: "#2563eb",       // blue-600
                  colorPrimaryHover: "#1d4ed8",  // blue-700
                  handleColor: "#2563eb",
                  railBg: "#e5e7eb",            // gray-200
                  railHoverBg: "#e5e7eb",
                  trackBg: "#2563eb",
                  trackHoverBg: "#1d4ed8",
                },
              },
            }}
          >
            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-gray-100 h-28 animate-pulse" />
                ))}
              </div>
            ) : itemsWithTotal.length > 0 ? (
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
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{charger.Name}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ฿{(charger.Price || 0).toFixed(2)} / Power
                        </span>
                      </div>

                      {/* Power controls */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPower(charger.ID, power - 1)}
                              className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                              aria-label="ลดกำลังไฟ"
                            >
                              –
                            </button>
                            <span className="min-w-[2ch] text-sm font-medium text-gray-900 text-center">
                              {power}
                            </span>
                            <button
                              onClick={() => setPower(charger.ID, power + 1)}
                              className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                              aria-label="เพิ่มกำลังไฟ"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-sm text-gray-600">
                            ยอดชำระ: <b className="text-blue-700">฿{total.toFixed(2)}</b>
                          </span>
                        </div>

                        {/* Slider */}
                        <div className="mt-2">
                          <Slider
                            min={1}
                            max={100}
                            value={power}
                            onChange={(value) => setPower(charger.ID, value as number)}
                          />
                        </div>

                        {/* Quick presets */}
                        <div className="mt-1 flex flex-wrap gap-2">
                          {[10, 20, 30, 50].map((p) => (
                            <button
                              key={p}
                              onClick={() => setPower(charger.ID, p)}
                              className={`h-7 rounded-full px-3 text-xs font-medium transition
                                ${
                                  power === p
                                    ? "bg-blue-600 text-white"
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                                }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500">
                ไม่มีรายการชาร์จ
              </div>
            )}
          </ConfigProvider>
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/90 backdrop-blur"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex max-w-screen-sm items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-col leading-tight">
            <span className="text-xs text-gray-500">ยอดรวม</span>
            <span className="text-lg font-bold text-blue-700">฿{grandTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={handleNext}
            disabled={loading || evChargers.length === 0}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-white transition
              ${
                loading || evChargers.length === 0
                  ? "bg-blue-300"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:from-blue-800 active:to-blue-700"
              }`}
          >
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold">Next</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
