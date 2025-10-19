import React, { useEffect, useRef, useState } from "react";
import Footer from "../../../component/user/footer/footer";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// FIX ไอคอนของ Leaflet สำหรับ Vite/CRA
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** ------------------------- ข้อมูลสถานีเดียว (SUT) ------------------------- */
type Station = {
  id: number;
  name: string;
  address: string;
  distanceKm: number;
  etaMin: number;
  open24h?: boolean;
  status: "พร้อมใช้งาน" | "ไม่พร้อม" | "กำลังใช้งาน";
  lat: number;
  lng: number;
};

const SUT_STATION: Station = {
  id: 1,
  name: "มหาวิทยาลัยเทคโนโลยีสุรนารี (SUT)",
  address: "111 ถ.มหาวิทยาลัย ต.สุรนารี อ.เมืองนครราชสีมา",
  distanceKm: 5.1,
  etaMin: 8,
  open24h: true,
  status: "พร้อมใช้งาน",
  lat: 14.8819,
  lng: 102.0170,
};

/** ------------------------------ Helpers UI ------------------------------ */
const formatNow = () => {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm} น.`;
};

const StatusBadge: React.FC<{ s: Station["status"] }> = ({ s }) => {
  const cls =
    s === "พร้อมใช้งาน"
      ? "bg-blue-50 text-blue-700 border-blue-200"
      : s === "กำลังใช้งาน"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span className={`rounded-xl border px-3 py-1 text-[12px] ${cls}`}>{s}</span>
  );
};

/** ------------------------- หน้า Map (Leaflet ตรง ๆ) ------------------------- */
const Index: React.FC = () => {
  // เริ่มแบบ "peek" เพื่อไม่ให้แผงเปิดเอง
  const [sheetOpen, setSheetOpen] = useState<"peek" | "half">("peek");
  const [infoOpen, setInfoOpen] = useState(false);

  // Leaflet refs
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // init map
  useEffect(() => {
    if (!mapEl.current || mapInstance.current) return;

    const map = L.map(mapEl.current, {
      center: [SUT_STATION.lat, SUT_STATION.lng],
      zoom: 16,
      zoomControl: true,
      scrollWheelZoom: true,
    });
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const mk = L.marker([SUT_STATION.lat, SUT_STATION.lng]).addTo(map);
    mk.bindPopup(`<b>${SUT_STATION.name}</b><br/>${SUT_STATION.address}`, {
      closeButton: true,
    });
    mk.on("click", () => setInfoOpen(true));
    markerRef.current = mk;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // gesture เลื่อนแผงขึ้น/ลง
  const dragRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    let startY = 0;
    let endY = 0;

    const onStart = (e: TouchEvent | MouseEvent) => {
      startY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      window.addEventListener("touchmove", onMove as any);
      window.addEventListener("mousemove", onMove as any);
      window.addEventListener("touchend", onEnd as any, { once: true });
      window.addEventListener("mouseup", onEnd as any, { once: true });
    };
    const onMove = (e: TouchEvent | MouseEvent) => {
      endY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    };
    const onEnd = () => {
      const delta = endY - startY;
      if (delta > 30) setSheetOpen("peek");
      else if (delta < -30) setSheetOpen("half");
      window.removeEventListener("touchmove", onMove as any);
      window.removeEventListener("mousemove", onMove as any);
    };
    el.addEventListener("touchstart", onStart as any);
    el.addEventListener("mousedown", onStart as any);
    return () => {
      el.removeEventListener("touchstart", onStart as any);
      el.removeEventListener("mousedown", onStart as any);
    };
  }, []);

  // action: โฟกัส marker + เปิด popup + เปิดการ์ดข้อมูล
  const focusStationOnMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([SUT_STATION.lat, SUT_STATION.lng], 17, { animate: true });
    }
    markerRef.current?.openPopup();
    setInfoOpen(true);
  };

  // action: เปิด Google Maps นำทาง
  const openGoogleMaps = () => {
    const { lat, lng, name } = SUT_STATION;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=&travelmode=driving&dir_action=navigate`;
    // บางเครื่องชอบ query ชื่อด้วย
    const withQuery = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      name
    )}&destination_place_id=&travelmode=driving&dir_action=navigate`;
    // ลองเปิดพิกัดก่อน ถ้า popup block ก็ยังเปิดด้วยชื่อได้
    window.open(url, "_blank");
    setTimeout(() => window.open(withQuery, "_blank"), 200);
  };

  const sheetHeight = sheetOpen === "peek" ? "36vh" : "50vh";

  return (
    <div className="relative min-h-screen bg-white">
      {/* ค้นหา — ตัดปุ่มหัวใจออกตามที่ขอ */}
      <div className="absolute left-0 right-0 top-3 z-[35] mx-auto max-w-screen-sm px-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-2xl bg-white shadow-md ring-1 ring-black/5 px-3 py-2.5 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value="ค้นหาชื่อสถานี, ที่อยู่"
              readOnly
              className="w-full bg-transparent text-[15px] text-gray-500 outline-none"
            />
          </div>
        </div>

        {/* ชิปตัวกรองเล็กๆ (ไม่ต้องมีฟังก์ชัน) */}
        <div className="mt-2 flex gap-2">
          {["ตัวกรอง", "พร้อมใช้งาน"].map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-2xl bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm ring-1 ring-black/5"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* แผนที่จริง */}
      <div className="absolute inset-0 z-[10]">
        <div ref={mapEl} style={{ height: "100%", width: "100%" }} />
      </div>

      {/* การ์ดข้อมูลสถานีแบบลอย (ตามภาพ) */}
      {infoOpen && (
        <div
          className="fixed left-0 right-0 z-30 mx-auto max-w-screen-sm px-3"
          style={{ bottom: `calc(${sheetHeight} + 12px)` }}
        >
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-4">
            <div className="flex items-start justify-between">
              <StatusBadge s={SUT_STATION.status} />
              <button
                aria-label="ปิด"
                onClick={() => setInfoOpen(false)}
                className="ml-2 inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-gray-100"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl ring-1 ring-blue-100 bg-blue-50">
                <span className="text-base font-bold text-blue-600">EV</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-[16px] font-semibold text-gray-900">
                  {SUT_STATION.name}
                </h3>
                <p className="text-[13px] text-gray-500">{SUT_STATION.address}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="rounded-2xl border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700">
                กดเพื่ออัปเดตข้อมูล
              </button>
              <span className="text-[12px] text-gray-400">ข้อมูลล่าสุด ณ {formatNow()}</span>
            </div>

            <div className="mt-3 text-sm">
              {SUT_STATION.open24h && (
                <span className="text-gray-900">เปิด <b>24 ชั่วโมง</b></span>
              )}
              <span className="text-gray-500"> | ≈ {SUT_STATION.distanceKm} กม. ({SUT_STATION.etaMin} นาที)</span>
            </div>

            {/* ชิปประเภทหัวชาร์จ (ตัวอย่าง) */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-xl bg-white ring-1 ring-gray-200 px-3 py-1.5 text-sm text-gray-800">
                DC ชาร์จเร็ว
              </span>
              <span className="rounded-xl bg-blue-50 text-blue-700 px-3 py-1.5 text-sm ring-1 ring-blue-100">
                ว่าง 2
              </span>
            </div>

            {/* ปุ่มแอคชัน: เหลือเฉพาะ “นำทาง” ตามที่ขอ */}
            <div className="mt-4 flex gap-3">
              <button
                onClick={openGoogleMaps}
                className="flex-1 rounded-2xl border border-blue-300 bg-white px-4 py-3 text-center text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                นำทาง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* แผงข้อมูลสถานี (รายการ) */}
      <div
        className="fixed inset-x-0 z-20 mx-auto max-w-screen-sm rounded-t-3xl bg-white shadow-[0_-10px_30px_rgba(0,0,0,0.12)] transition-[height] duration-200"
        style={{ height: sheetHeight, bottom: 0 }}
      >
        <div ref={dragRef} className="cursor-grab active:cursor-grabbing select-none">
          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        <div className="px-4 pb-2">
          <div className="flex items-center justify-between py-2">
            <div className="text-gray-900">
              รายชื่อ <span className="text-gray-500">ค้นเจอ <b className="text-blue-600">1</b> สถานี</span>
              <div className="text-[12px] text-gray-400">ข้อมูลล่าสุด ณ {formatNow()}</div>
            </div>

            <button
              onClick={() => setSheetOpen((s) => (s === "peek" ? "half" : "peek"))}
              className="grid h-9 w-9 place-items-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
              aria-label="ขยาย/ย่อ"
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-5 w-5 transition-transform duration-200 ${sheetOpen === "half" ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 10l5 5 5-5" />
              </svg>
            </button>
          </div>

          <div className="mt-2 h-[calc(100%-84px)] overflow-y-auto pb-28">
            {/* คลิกเพื่อโฟกัส + เปิดการ์ดข้อมูล */}
            <article
              className="flex gap-3 border-b border-gray-100 py-3 active:bg-gray-50 rounded-xl px-2 -mx-2"
              onClick={focusStationOnMap}
              role="button"
            >
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl ring-1 ring-blue-100">
                <span className="text-sm font-bold text-blue-600">EV</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[15px] font-semibold text-gray-900">
                  {SUT_STATION.name}
                </h3>
                <p className="truncate text-[12px] text-gray-500">{SUT_STATION.address}</p>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {SUT_STATION.open24h && (
                    <span className="text-[12px] text-blue-700">เปิด 24 ชั่วโมง</span>
                  )}
                  <span className="text-[12px] text-gray-500">
                    ≈ {SUT_STATION.distanceKm} กม. ({SUT_STATION.etaMin} นาที)
                  </span>
                  <StatusBadge s={SUT_STATION.status} />
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
