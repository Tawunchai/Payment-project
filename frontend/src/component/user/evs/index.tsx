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

// ⚡ EV Icon
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

type CabinetView = {
  id: number;
  name: string;
  location?: string;
  image?: string;
  status?: string;
  chargers: EVchargingInterface[];
};

const Index: React.FC = () => {
  //@ts-ignore
  const [allChargers, setAllChargers] = useState<EVchargingInterface[]>([]);
  const [evChargers, setEvChargers] = useState<EVchargingInterface[]>([]);
  const [percentMap, setPercentMap] = useState<{ [id: number]: number }>({});
  const [money, setMoney] = useState<number>(1000);
  const [minAmount, setMinAmount] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showCarModal, setShowCarModal] = useState(false);
  const [userID, setUserID] = useState<number | undefined>(undefined);
  const [cabinets, setCabinets] = useState<CabinetView[]>([]);
  const [selectedCabinetId, setSelectedCabinetId] = useState<number | null>(null);

  const navigate = useNavigate();

  // ✅ โหลด userID
  useEffect(() => {
    const loadUser = async () => {
      try {
        let current = getCurrentUser();
        if (!current) current = await initUserProfile();
        const uid = current?.id;
        if (!uid) {
          navigate("/login");
          return;
        }
        setUserID(uid);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [navigate]);

  // ✅ โหลดค่า Minimum จากธนาคาร
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
      } catch (err) {
        console.error("Error loading banks:", err);
      }
    };
    fetchBankMin();
  }, []);

  // ✅ โหลดข้อมูล EV Charger ทั้งหมด + Cabinet เฉพาะ Active
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await ListEVCharging();
        if (Array.isArray(data) && data.length > 0) {
          const groupMap = new Map<number, CabinetView>();
          data.forEach((c) => {
            const cab = c.EVCabinet;
            if (!cab) return;
            // ✅ กรอง Cabinet เฉพาะ Active
            if (cab.Status !== "Active") return;
            const id = cab.ID!;
            if (!groupMap.has(id)) {
              groupMap.set(id, {
                id,
                name: cab.Name || `Cabinet #${id}`,
                location: cab.Location || "",
                image: cab.Image ? `${apiUrlPicture}${cab.Image}` : undefined,
                status: cab.Status,
                chargers: [],
              });
            }
            groupMap.get(id)!.chargers.push(c);
          });

          const list = Array.from(groupMap.values());
          setCabinets(list);

          if (list.length > 0) {
            const firstCab = list[0];
            const availableChargers = firstCab.chargers.filter(
              (c) => c.Status?.Status !== "Unavailable"
            );
            setEvChargers(availableChargers);
            const init: { [id: number]: number } = {};
            availableChargers.forEach((item, idx) => {
              init[item.ID] = idx === 0 ? 100 : 0;
            });
            setPercentMap(init);
            setSelectedCabinetId(firstCab.id);
          }
        }
      } catch (err) {
        console.error("Error loading chargers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ เมื่อเปลี่ยน “ตู้ที่เลือก”
  useEffect(() => {
    if (selectedCabinetId == null || cabinets.length === 0) return;
    const cab = cabinets.find((c) => c.id === selectedCabinetId);
    if (!cab) return;
    const availableChargers = cab.chargers.filter(
      (c) => c.Status?.Status !== "Unavailable"
    );
    setEvChargers(availableChargers);
    const init: { [id: number]: number } = {};
    availableChargers.forEach((item, idx) => {
      init[item.ID] = idx === 0 ? 100 : 0;
    });
    setPercentMap(init);
  }, [selectedCabinetId, cabinets]);

  // ✅ ปรับเปอร์เซ็นต์
  const setPercent = (id: number, value: number) => {
    if (evChargers.length < 2) return;
    const other = evChargers.find((c) => c.ID !== id);
    if (!other) return;
    const fixed = Math.min(100, Math.max(0, value));
    const otherValue = 100 - fixed;
    setPercentMap({
      [id]: fixed,
      [other.ID]: otherValue,
    });
  };

  // ✅ คำนวณเงิน
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

  // ✅ ตรวจสอบขั้นต่ำ
  const handleMoneyChange = (value: number) => {
    if (value < minAmount) {
      setErrorMsg(`จำนวนเงินต้องไม่ต่ำกว่า ${minAmount.toFixed(2)} บาท`);
    } else {
      setErrorMsg("");
    }
    setMoney(value);
  };

  // ✅ Next
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
      total: it.total,
      percent: it.percent,
      price_per_power: it.charger.Price,
      amount: it.amount,
    }));
    navigate("/user/payment", { state: { chargers: payload } });
  };

  // ✅ แสดงเฉพาะ Cabinet Active เท่านั้น
  const cabinetSummary = useMemo(() => {
    return cabinets
      .filter((cab) => cab.status === "Active")
      .map((cab) => ({
        id: cab.id,
        name: cab.name,
        location: cab.location,
        image: cab.image,
        chargerNames: cab.chargers
          .filter((c) => c.Status?.Status !== "Unavailable")
          .map((c) => c.Name)
          .filter(Boolean),
      }));
  }, [cabinets]);

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER */}
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
            <span className="text-base font-semibold tracking-wide">EV Selector</span>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="mx-auto max-w-screen-sm px-4 pb-28 pt-4">
        {/* 💵 Input เงิน */}
        <div className="mb-5 rounded-xl bg-gradient-to-r from-[#EAF3FF] via-[#F3F8FF] to-[#FFFFFF] border border-blue-100 p-3 shadow-sm">
          <label className="block text-xs font-medium text-[#0A84FF] mb-1">
            💵 ใส่จำนวนเงินที่ต้องการเติม (ขั้นต่ำ {minAmount} บาท)
          </label>
          <div className="relative">
            <Input
              type="number"
              min={minAmount}
              value={money}
              onChange={(e) => handleMoneyChange(Number(e.target.value) || 0)}
              placeholder={`ขั้นต่ำ ${minAmount} บาท`}
              className={`h-9 w-full rounded-lg border ${
                errorMsg ? "border-red-400" : "border-blue-200/40"
              } bg-white/70 text-gray-700 placeholder:text-gray-400 focus:ring-1 transition-all duration-300`}
            />
            <span className="absolute right-3 top-1.5 text-[#0A84FF] font-semibold text-sm">฿</span>
          </div>
          {errorMsg && <p className="text-red-500 text-xs mt-1">{errorMsg}</p>}
        </div>

        {/* ยอดรวม */}
        <div className="mb-3 flex items-center justify-between rounded-2xl bg-blue-100 px-4 py-3">
          <span className="text-sm text-blue-900">ยอดรวมทั้งหมด</span>
          <span className="text-xl font-bold text-blue-700">฿{totalAmount.toFixed(2)}</span>
        </div>

        {/* 🔷 ตัวเลือก Cabinet */}
        <section className="mb-5 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-800">เลือกตู้ชาร์จ</div>
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
                    type="button"
                    onClick={() => setSelectedCabinetId(cab.id)}
                    className={`w-full text-left rounded-2xl border px-3 py-2 transition ${
                      isActive
                        ? "border-blue-300 bg-blue-50 ring-1 ring-blue-100"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 overflow-hidden rounded-xl ring-1 ring-blue-100 bg-blue-50 shrink-0">
                        {cab.image ? (
                          <img
                            src={cab.image}
                            alt={cab.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                            }}
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block h-2 w-2 rounded-full ${
                              isActive ? "bg-blue-600" : "bg-gray-300"
                            }`}
                          />
                          <span className="font-medium text-gray-900">{cab.name}</span>
                        </div>
                        {cab.location && (
                          <div className="mt-0.5 text-xs text-gray-500">{cab.location}</div>
                        )}
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {cab.chargerNames.length > 0 ? (
                            cab.chargerNames.map((nm, idx) => (
                              <span
                                key={idx}
                                className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700 ring-1 ring-blue-100"
                              >
                                {nm}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">
                              — ไม่มีหัวชาร์จที่พร้อมใช้งาน —
                            </span>
                          )}
                        </div>
                      </div>
                      {isActive && (
                        <span className="shrink-0 rounded-xl bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white">
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
                <div key={i} className="rounded-2xl bg-gray-100 h-28 animate-pulse" />
              ))}
            </div>
          ) : evChargers.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-4 py-6 text-center text-sm text-gray-500">
              — ไม่มีหัวชาร์จที่พร้อมใช้งาน —
            </div>
          ) : (
            evChargers.map(({ ID, Name, Picture, Price }) => {
              const percent = percentMap[ID] ?? 0;
              const amount = (money * percent) / 100;
              const power = Price ? amount / Price : 0;
              return (
                <div
                  key={ID}
                  className="rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm mb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`${apiUrlPicture}${Picture}`}
                      alt={Name}
                      className="h-16 w-16 rounded-xl object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-gray-900">{Name}</h3>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          ฿{(Price || 0).toFixed(2)} / kWh
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPercent(ID, (percent ?? 0) - 1)}
                            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                          >
                            –
                          </button>
                          <span className="min-w-[3ch] text-sm font-medium text-gray-900 text-center">
                            {percent}%
                          </span>
                          <button
                            onClick={() => setPercent(ID, (percent ?? 0) + 1)}
                            className="h-7 w-7 rounded-lg border border-gray-200 text-gray-700 active:bg-gray-50"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm text-gray-600">⚡ {power.toFixed(2)} kWh</span>
                      </div>
                      <div className="mt-2">
                        <Slider
                          min={0}
                          max={100}
                          value={percent}
                          onChange={(value) => setPercent(ID, value as number)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
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
            disabled={loading || evChargers.length === 0 || money < minAmount}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-white transition ${
              loading || evChargers.length === 0 || money < minAmount
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
        <h3 className="text-lg font-semibold text-blue-700 mb-2">ไม่พบข้อมูลรถของคุณ</h3>
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
