import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { FaMapMarkerAlt, FaClock } from "react-icons/fa";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Modal, Button } from "antd";

import { ListCabinetsEV, apiUrlPicture, GetCarByUserID } from "../../../services";
import type { EVCabinetInterface } from "../../../interface/IBooking";
import type { CarsInterface } from "../../../interface/ICar";

/* =========================
   EV Bolt Icon
   ========================= */
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

/* =========================
   HeaderBar (Desktop)
   ========================= */
const HeaderBar: React.FC<{ title?: string; onBack?: () => void }> = ({
  title = "แผนที่สถานีชาร์จไฟฟ้า",
  onBack,
}) => {
  const goBack = () => (onBack ? onBack() : window.history.back());
  return (
    <header
      className="sticky top-0 z-20 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-b-2xl shadow-md overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="w-full px-4 py-3 flex items-center gap-2 justify-start">
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
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 text-white"
          >
            <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
          </svg>
          <span className="text-sm md:text-base font-semibold tracking-wide">
            {title}
          </span>
        </div>
      </div>
    </header>
  );
};


/* =========================
   EV Marker Icon
   ========================= */
const createEVIcon = (selected: boolean) =>
  new L.DivIcon({
    html: `
      <div class="flex items-center justify-center ${
        selected
          ? "bg-blue-600 shadow-blue-400 scale-110"
          : "bg-blue-400 hover:bg-blue-500"
      } transition-all duration-200 rounded-full w-8 h-8 text-white shadow-md border-2 border-white">
        ⚡
      </div>`,
    iconSize: [36, 36],
    className: "animate-fadeIn",
  });

/* =========================
   EV Map (Desktop)
   ========================= */
const EVMapNotebook: React.FC = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [cabinets, setCabinets] = useState<EVCabinetInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCarModal, setShowCarModal] = useState(false);
  const navigate = useNavigate();

  const userID = Number(localStorage.getItem("userid"));

  useEffect(() => {
    const fetchCabinets = async () => {
      try {
        const res = await ListCabinetsEV();
        if (res) setCabinets(res);
      } catch (error) {
        console.error("Error loading EV cabinets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCabinets();
  }, []);

  // ✅ ตรวจสอบว่าผู้ใช้มีรถไหม
  const handleBookingClick = async (cabinet: EVCabinetInterface) => {
    try {
      const cars: CarsInterface[] | null = await GetCarByUserID(userID);
      if (!cars || cars.length === 0) {
        setShowCarModal(true);
        return;
      }
      navigate("/user/booking-date", { state: { cabinet } });
    } catch (error) {
      console.error("Error checking car:", error);
      setShowCarModal(true);
    }
  };

  // ✅ Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-blue-700 font-semibold">
        กำลังโหลดข้อมูลสถานีชาร์จ...
      </div>
    );
  }

  // ✅ No Data
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

        {/* Floating Card */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-full flex justify-center">
          <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory px-4 pb-2 w-full max-w-4xl justify-center scrollbar-hide">
            {cabinets.map((cabinet) => (
              <div
                key={cabinet.ID}
                onClick={() => setSelected(cabinet.ID)}
                className={`snap-center min-w-[230px] bg-white rounded-xl p-3 shadow-md border flex-shrink-0 transition-all duration-300 ${
                  selected === cabinet.ID
                    ? "border-blue-500 shadow-blue-300 scale-105"
                    : "border-gray-100"
                }`}
              >
                <div className="relative w-full h-28 rounded-lg overflow-hidden">
                  <img
                    src={`${apiUrlPicture}${cabinet.Image}`}
                    alt={cabinet.Name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/250x150.png?text=EV";
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-white/90 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    {cabinet.Status}
                  </div>
                </div>

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
                  onClick={() => handleBookingClick(cabinet)}
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

      {/* ✅ EV BLUE MODAL */}
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
          ก่อนทำการจอง กรุณาเพิ่มข้อมูลรถของคุณในระบบ
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

export default EVMapNotebook;
