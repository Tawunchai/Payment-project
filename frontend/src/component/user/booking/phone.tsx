import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { ListCabinetsEV, apiUrlPicture } from "../../../services"; // ✅ ดึง apiUrlPicture มาใช้
import type { EVCabinetInterface } from "../../../interface/IBooking";

/* =========================
   EV Bolt Icon (minimal)
   ========================= */
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

/* =========================
   Reusable HeaderBar
   ========================= */
const HeaderBar: React.FC<{ title?: string; onBack?: () => void }> = ({
  title = "จองเข้าชาร์จไฟฟ้า",
  onBack,
}) => {
  const goBack = () => (onBack ? onBack() : window.history.back());
  return (
    <header
      className="sticky top-0 z-30 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-2">
        <button
          onClick={goBack}
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
          <span className="text-sm font-semibold tracking-wide">{title}</span>
        </div>
      </div>
    </header>
  );
};

/* =========================
   EV Map Page
   ========================= */

// EV Marker icon
const createEVIcon = (selected: boolean) =>
  new L.DivIcon({
    html: `
      <div class="flex items-center justify-center ${selected
        ? "bg-blue-600 shadow-blue-400 scale-110"
        : "bg-blue-400 hover:bg-blue-500"
      } transition-all duration-200 rounded-full w-8 h-8 text-white shadow-md border-2 border-white">
        ⚡
      </div>`,
    iconSize: [36, 36],
    className: "animate-fadeIn",
  });

const EVMapMobile: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [cabinets, setCabinets] = useState<EVCabinetInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // โหลดข้อมูลจาก Backend
  useEffect(() => {
    const fetchCabinets = async () => {
      try {
        const res = await ListCabinetsEV();
        if (res) {
          setCabinets(res);
        }
      } catch (error) {
        console.error("Error loading EV cabinets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCabinets();
  }, []);

  // หากกำลังโหลด
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-blue-700 font-semibold">
        กำลังโหลดข้อมูลสถานีชาร์จ...
      </div>
    );
  }

  // หากไม่มีข้อมูล
  if (!cabinets.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-500">
        <BoltIcon className="h-6 w-6 text-blue-500 mb-2" />
        <p>ไม่พบข้อมูลสถานีชาร์จไฟฟ้า</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-blue-50 to-blue-100 overflow-hidden flex flex-col">
      {/* Header */}
      <HeaderBar title="แผนที่สถานีชาร์จไฟฟ้า" onBack={() => navigate(-1)} />

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={[cabinets[0].Latitude, cabinets[0].Longitude]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          className="z-10"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {cabinets.map((cabinet) => (
            <Marker
              key={cabinet.ID}
              position={[cabinet.Latitude, cabinet.Longitude]}
              icon={createEVIcon(selected === cabinet.ID)}
              eventHandlers={{
                click: () => setSelected(cabinet.ID),
              }}
            />
          ))}
        </MapContainer>

        {/* Floating Card Section */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 bg-gradient-to-t from-blue-100/95 to-transparent">
          <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
            {cabinets.map((cabinet) => (
              <div
                key={cabinet.ID}
                onClick={() => setSelected(cabinet.ID)}
                className={`snap-center min-w-[210px] bg-white rounded-xl p-2 shadow-md border flex-shrink-0 transition-all duration-300 ${selected === cabinet.ID
                    ? "border-blue-500 shadow-blue-300 scale-105"
                    : "border-gray-100"
                  }`}
              >
                {/* Image */}
                <div className="relative w-full h-24 rounded-lg overflow-hidden">
                  <img
                    src={`${apiUrlPicture}${cabinet.Image}`} // ✅ ใช้รูปจาก Backend
                    alt={cabinet.Name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/200x120.png?text=EV";
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-white/90 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    {cabinet.Status}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2 space-y-0.5">
                  <h2 className="font-semibold text-blue-800 text-[13px] truncate">
                    {cabinet.Name}
                  </h2>
                  <p className="text-gray-600 text-[11px] flex items-center gap-1 truncate">
                    <FaMapMarkerAlt className="text-blue-500 text-xs" />
                    {cabinet.Location}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1">
                    <FaClock className="text-blue-400 text-xs" />{" "}
                    {cabinet.Employee
                      ? `ดูแลโดย ${cabinet.Employee.User?.FirstName || ""}`
                      : "ไม่มีผู้ดูแล"}
                  </p>
                </div>

                <button
                  onClick={() => {
                    navigate("/user/booking-date", { state: { cabinet } });
                    console.log("Selected Cabinet:", cabinet);
                  }}
                  className="mt-2 w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] rounded-lg shadow-sm transition-all"
                >
                  จองจุดชาร์จนี้
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-1 w-full text-center text-[10px] text-gray-400">
        ⚡ EV Smart Charging App © {new Date().getFullYear()}
      </div>
    </div>
  );
};

export default EVMapMobile;
