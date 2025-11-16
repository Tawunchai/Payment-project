// src/component/user/ev-selector/index.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListEVCharging,
  apiUrlPicture,
  GetCarByUserID,
  ListBank,
} from "../../../services";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";
import { EVchargingInterface } from "../../../interface/IEV";
import { CarsInterface } from "../../../interface/ICar";
import { ConfigProvider, Modal, Button, Input, Slider } from "antd";

/* ⚡ EV Icon ---------------------------------------------------- */
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

/* Cabinet Type --------------------------------------------------- */
type CabinetView = {
  id: number;
  name: string;
  location?: string;
  image?: string;
  status?: string;
  chargers: EVchargingInterface[];
};

/* Component ------------------------------------------------------- */
const Index: React.FC = () => {
  const [evChargers, setEvChargers] = useState<EVchargingInterface[]>([]);
  const [percentMap, setPercentMap] = useState<{ [id: number]: number }>({});
  const [money, setMoney] = useState<number>(1000);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [showCarModal, setShowCarModal] = useState(false);
  const [userID, setUserID] = useState<number | undefined>(undefined);

  // ⭐ LIST ของตู้ทั้งหมดที่รวมมาจาก Many-to-Many
  const [cabinets, setCabinets] = useState<CabinetView[]>([]);

  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);

  const navigate = useNavigate();

  /* โหลด user ID -------------------------------------------------- */
  useEffect(() => {
    const loadUser = async () => {
      let current = getCurrentUser();
      if (!current) current = await initUserProfile();
      const uid = current?.id;
      if (!uid) {
        navigate("/login");
        return;
      }
      setUserID(uid);
    };
    loadUser();
  }, [navigate]);

  /* โหลด minimum จาก Bank ---------------------------------------- */
  useEffect(() => {
    const fetchBankMin = async () => {
      try {
        const banks = await ListBank();
        if (Array.isArray(banks) && banks.length > 0) {
          const firstBank = banks[0];
          if (firstBank?.Minimum !== undefined) {
            setMinAmount(firstBank.Minimum);
            setMoney(firstBank.Minimum);
          }
        }
      } catch {}
    };
    fetchBankMin();
  }, []);

  /* โหลด EV + GROUP CABINETS (Many-to-Many) ----------------------- */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await ListEVCharging();
        if (!Array.isArray(data)) return;

        const group = new Map<number, CabinetView>();

        data.forEach((charger) => {
          // ⚡ Each charger may belong to MULTIPLE cabinets
          charger.Cabinets?.forEach((cab) => {
            if (!cab) return;
            if (cab.Status !== "Active") return;

            if (!group.has(cab.ID!)) {
              group.set(cab.ID!, {
                id: cab.ID!,
                name: cab.Name,
                location: cab.Location,
                image: cab.Image ? `${apiUrlPicture}${cab.Image}` : undefined,
                status: cab.Status,
                chargers: [],
              });
            }

            group.get(cab.ID!)!.chargers.push(charger);
          });
        });

        const list = Array.from(group.values());
        setCabinets(list);

        if (list.length > 0) {
          const firstCab = list[0];
          const available = firstCab.chargers.filter(
            (c) => c.Status?.Status !== "Unavailable"
          );

          setEvChargers(available);

          // Initial percent
          const init: { [id: number]: number } = {};
          available.forEach((chg, idx) => {
            init[chg.ID] = idx === 0 ? 100 : 0;
          });

          setPercentMap(init);
          setSelectedCabinetId(firstCab.id);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* เปลี่ยน Cabinet ------------------------------------------------ */
  useEffect(() => {
    if (selectedCabinetId == null) return;

    const cab = cabinets.find((c) => c.id === selectedCabinetId);
    if (!cab) return;

    const available = cab.chargers.filter(
      (c) => c.Status?.Status !== "Unavailable"
    );

    setEvChargers(available);

    const init: { [id: number]: number } = {};
    available.forEach((chg, idx) => {
      init[chg.ID] = idx === 0 ? 100 : 0;
    });

    setPercentMap(init);
  }, [selectedCabinetId, cabinets]);

  /* ปรับเปอร์เซนต์ ----------------------------------------------- */
  const setPercent = (id: number, value: number) => {
    if (evChargers.length < 2) return;
    const other = evChargers.find((c) => c.ID !== id);
    if (!other) return;

    const fix = Math.max(0, Math.min(100, value));
    const otherVal = 100 - fix;

    setPercentMap({
      [id]: fix,
      [other.ID]: otherVal,
    });
  };

  /* คำนวณ --------------------------------------------------------- */
  const itemsWithCalc = useMemo(() => {
    return evChargers.map((charger) => {
      const percent = percentMap[charger.ID] || 0;
      const amount = (money * percent) / 100;
      const power = charger.Price ? amount / charger.Price : 0;
      return { charger, percent, amount, power };
    });
  }, [evChargers, percentMap, money]);

  const totalAmount = useMemo(
    () => itemsWithCalc.reduce((sum, it) => sum + it.amount, 0),
    [itemsWithCalc]
  );

  /* ตรวจสอบขั้นต่ำ ------------------------------------------------ */
  const handleMoneyChange = (value: number) => {
    if (value < minAmount) {
      setErrorMsg(`จำนวนเงินต้องไม่ต่ำกว่า ${minAmount.toFixed(2)} บาท`);
    } else {
      setErrorMsg("");
    }

    setMoney(value);
  };

  /* NEXT ----------------------------------------------------------- */
  const handleNext = async () => {
    if (!userID) {
      navigate("/login");
      return;
    }

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
      total: it.amount,
      percent: it.percent,
      price_per_power: it.charger.Price,
      amount: it.amount,
    }));

    navigate("/user/payment", { state: { chargers: payload } });
  };

  /* SUMMARY CABINET ------------------------------------------------ */
  const cabinetSummary = useMemo(() => {
    return cabinets.map((cab) => ({
      id: cab.id,
      name: cab.name,
      image: cab.image,
      location: cab.location,
      chargerNames: cab.chargers
        .filter((c) => c.Status?.Status !== "Unavailable")
        .map((c) => c.Name),
    }));
  }, [cabinets]);

  /* ================================================================= */
  /* ============================ RENDER ============================== */
  /* ================================================================= */

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md">
        <div className="w-full px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate("/user")}
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-white" />
            <span className="text-base font-semibold">EV Selector</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* เงิน */}
        <div className="mb-5 rounded-xl bg-gradient-to-r from-[#EAF3FF] via-[#F3F8FF] to-[#FFFFFF] border border-blue-100 p-3 shadow-sm">
          <label className="block text-xs mb-1 text-[#0A84FF]">
            💵 ใส่จำนวนเงินที่ต้องการเติม (ขั้นต่ำ {minAmount.toFixed(2)} บาท)
          </label>

          <div className="relative">
            <Input
              type="number"
              min={minAmount}
              value={money}
              onChange={(e) => handleMoneyChange(Number(e.target.value) || 0)}
              className={`h-9 w-full rounded-lg border ${
                errorMsg ? "border-red-400" : "border-blue-200/40"
              } bg-white/70 text-gray-700`}
            />
            <span className="absolute right-3 top-1.5 text-[#0A84FF]">฿</span>
          </div>

          {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
        </div>

        {/* Total */}
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-blue-100 px-4 py-3">
          <span className="text-sm text-blue-900">ยอดรวมทั้งหมด</span>
          <span className="text-xl font-bold text-blue-700">
            ฿{totalAmount.toFixed(2)}
          </span>
        </div>

        {/* Cabinet Selector */}
        <section className="mb-5 rounded-2xl border bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 text-sm font-semibold">เลือกตู้ชาร์จ</div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : cabinets.length === 0 ? (
            <div className="text-sm text-gray-500">— ไม่มีข้อมูลตู้ชาร์จ —</div>
          ) : (
            <div className="flex flex-col gap-2">
              {cabinetSummary.map((cab) => {
                const isActive = selectedCabinetId === cab.id;
                return (
                  <button
                    key={cab.id}
                    onClick={() => setSelectedCabinetId(cab.id)}
                    className={`w-full text-left rounded-2xl border px-3 py-2 ${
                      isActive
                        ? "border-blue-300 bg-blue-50 ring-1 ring-blue-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 overflow-hidden rounded-xl bg-blue-50 ring-1 ring-blue-100">
                        {cab.image && (
                          <img
                            src={cab.image}
                            alt={cab.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isActive ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          />
                          <span className="font-medium">{cab.name}</span>
                        </div>

                        {cab.location && (
                          <div className="text-xs text-gray-500">{cab.location}</div>
                        )}

                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {cab.chargerNames.map((nm, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 ring-1 ring-blue-100"
                            >
                              {nm}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isActive && (
                        <span className="rounded-xl bg-blue-600 px-2 py-1 text-[11px] text-white">
                          เลือกอยู่
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Charger List */}
        <ConfigProvider
          theme={{
            components: {
              Slider: {
                colorPrimary: "#2563eb",
                handleColor: "#2563eb",
              },
            },
          }}
        >
          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="rounded-2xl bg-gray-100 h-28 animate-pulse" />
              ))}
            </div>
          ) : evChargers.length === 0 ? (
            <div className="rounded-2xl border bg-white px-4 py-6 text-center text-gray-500">
              — ไม่มีหัวชาร์จที่พร้อมใช้งาน —{" "}
            </div>
          ) : (
            evChargers.map((charger) => {
              const percent = percentMap[charger.ID] ?? 0;
              const amount = (money * percent) / 100;
              const power = charger.Price ? amount / charger.Price : 0;

              return (
                <div
                  key={charger.ID}
                  className="rounded-2xl border bg-white px-4 py-3 shadow-sm mb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`${apiUrlPicture}${charger.Picture}`}
                      className="h-16 w-16 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{charger.Name}</h3>
                        <span className="text-xs text-gray-500">
                          ฿{charger.Price.toFixed(2)} / kWh
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPercent(charger.ID, percent - 1)}
                            className="h-7 w-7 border rounded-lg"
                          >
                            –
                          </button>
                          <span className="text-sm">{percent}%</span>
                          <button
                            onClick={() => setPercent(charger.ID, percent + 1)}
                            className="h-7 w-7 border rounded-lg"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-sm text-gray-600">
                          ⚡ {power.toFixed(2)} kWh
                        </span>
                      </div>

                      <Slider
                        min={0}
                        max={100}
                        value={percent}
                        onChange={(v) => setPercent(charger.ID, v as number)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </ConfigProvider>
      </main>

      {/* Bottom bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 border-t backdrop-blur px-4 py-3">
        <div className="flex items-center justify-between max-w-screen-sm mx-auto">
          <div>
            <span className="text-xs text-gray-500">ยอดรวม</span>
            <div className="text-lg font-bold text-blue-700">
              ฿{totalAmount.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={evChargers.length === 0 || money < minAmount}
            className={`px-6 py-2 rounded-xl flex items-center gap-2 text-white ${
              evChargers.length === 0 || money < minAmount
                ? "bg-blue-300"
                : "bg-gradient-to-r from-blue-600 to-sky-500 shadow-md"
            }`}
          >
            <BoltIcon className="h-5 w-5 text-white" />
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={showCarModal}
        footer={null}
        onCancel={() => setShowCarModal(false)}
        centered
      >
        <div className="text-4xl mb-3">🚗</div>
        <h3 className="text-lg font-semibold text-blue-700 mb-2">
          ไม่พบข้อมูลรถของคุณ
        </h3>
        <p className="text-gray-600 mb-5">
          ก่อนทำการชำระเงิน กรุณาเพิ่มข้อมูลรถของคุณ
        </p>

        <div className="flex justify-center gap-3">
          <Button onClick={() => setShowCarModal(false)}>ยกเลิก</Button>
          <Button
            type="primary"
            onClick={() => navigate("/user/add-cars")}
            className="bg-blue-600"
          >
            ไปเพิ่มข้อมูลรถ
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Index;
