import { useEffect, useRef, useState } from "react";
import { BiMenuAltRight } from "react-icons/bi";
import { GiTwoCoins } from "react-icons/gi";
import { FaCarSide } from "react-icons/fa";
import { MdOutlineReport, MdMap } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import OutsideClickHandler from "react-outside-click-handler";
import ReportModal from "./report/index";
import { getUserByID, apiUrlPicture } from "../../../services";
import { UsersInterface } from "../../../interface/IUser";

/* === Leaflet (แสดงแผนที่ใน dropdown เดสก์ท็อป) === */
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
  lat: number;
  lng: number;
  open24h?: boolean;
  status: "พร้อมใช้งาน" | "ไม่พร้อม" | "กำลังใช้งาน";
};

const SUT_STATION: Station = {
  id: 1,
  name: "มหาวิทยาลัยเทคโนโลยีสุรนารี (SUT)",
  address: "111 ถ.มหาวิทยาลัย ต.สุรนารี อ.เมืองนครราชสีมา",
  lat: 14.8819,
  lng: 102.0170,
  open24h: true,
  status: "พร้อมใช้งาน",
};

type HeaderProps = {
  scrollToValue?: () => void;
  scrollToNew: () => void;
};
//@ts-ignore
const Header: React.FC<HeaderProps> = ({ scrollToNew }) => {
  const navigate = useNavigate();
  const [menuOpened, setMenuOpened] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // desktop map dropdown state
  const [mapOpen, setMapOpen] = useState(false);
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    const uid = Number(localStorage.getItem("userid") || 0);
    if (!uid) return;
    getUserByID(uid)
      .then((res) => res && setUser(res))
      .catch(() => {});
  }, []);

  // ปิด dropdown เมื่อกดนอก/กด ESC
  useEffect(() => {
    if (!mapOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMapOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!mapWrapRef.current) return;
      if (!mapWrapRef.current.contains(e.target as Node)) setMapOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [mapOpen]);

  // สร้าง/อัปเดต Leaflet map ใน dropdown เมื่อเปิด
  useEffect(() => {
    if (!mapOpen) return;
    // ถ้ายังไม่มี instance ให้สร้างใหม่
    if (!mapInstance.current && mapElRef.current) {
      const map = L.map(mapElRef.current, {
        center: [SUT_STATION.lat, SUT_STATION.lng],
        zoom: 16,
        zoomControl: true,
      });
      mapInstance.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      const mk = L.marker([SUT_STATION.lat, SUT_STATION.lng]).addTo(map);
      mk.bindPopup(`<b>${SUT_STATION.name}</b><br/>${SUT_STATION.address}`, {
        closeButton: true,
      });
      markerRef.current = mk;

      // เปิด popup ครั้งแรกเพื่อโชว์ชื่อ
      setTimeout(() => mk.openPopup(), 200);
    } else {
      // ถ้ามีแล้ว แค่รีไซส์ + เซ็ตวิวอีกครั้ง
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
        mapInstance.current?.setView([SUT_STATION.lat, SUT_STATION.lng], 16, { animate: true });
        markerRef.current?.openPopup();
      }, 50);
    }

    // ไม่ลบ map ตอนปิด dropdown เพื่อให้เปิดใหม่ไวขึ้น
  }, [mapOpen]);

  const handleLogout = () => {
    localStorage.clear();
    messageApi.success("ออกจากระบบ");
    setTimeout(() => navigate("/login"), 1200);
  };

  const openReportModal = () => {
    setModalOpen(true);
    setMenuOpened(false);
  };

  const openGmapsNavigate = () => {
    const { lat, lng, name } = SUT_STATION;
    const urlByCoord = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
    const urlByName = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      name
    )}&travelmode=driving&dir_action=navigate`;
    window.open(urlByCoord, "_blank");
    setTimeout(() => window.open(urlByName, "_blank"), 200);
  };

  // ปุ่มเดสก์ท็อปให้ขนาดเท่ากัน
  const btnEqual =
    "inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50";

  return (
    <>
      {contextHolder}

      {/* HEADER */}
      <header
        className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
          {/* Left: Brand */}
          <button
            className="flex items-center gap-2"
            onClick={() => navigate("/user")}
            aria-label="หน้าหลัก"
          >
            <span className="text-sm font-semibold tracking-wide">EV Station</span>
          </button>

          {/* Right: Desktop menu */}
          <nav className="relative hidden items-center gap-3 md:flex">
            {/* Report */}
            <button onClick={openReportModal} className={btnEqual} title="รายงานปัญหา">
              <MdOutlineReport className="text-blue-600" />
              <span>Report</span>
            </button>

            {/* Map (Dropdown + Leaflet แสดงโลเคชัน SUT เดียว) */}
            <div className="relative" ref={mapWrapRef}>
              <button
                onClick={() => setMapOpen((s) => !s)}
                className={btnEqual}
                title="Map"
                aria-expanded={mapOpen}
                aria-haspopup="dialog"
              >
                <MdMap className="text-blue-600" />
                <span>Map</span>
              </button>

              {mapOpen && (
                <div
                  className="
                    absolute right-0 mt-2 w-[560px] max-w-[92vw]
                    rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden
                  "
                  role="dialog"
                  aria-label="EV Map (SUT)"
                >
                  <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900">
                      ตำแหน่งตัวอย่าง: {SUT_STATION.name}
                    </div>
                    <button
                      onClick={() => setMapOpen(false)}
                      className="rounded-lg px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      ปิด
                    </button>
                  </div>

                  {/* แผนที่ Leaflet */}
                  <div className="relative">
                    <div
                      ref={mapElRef}
                      style={{ width: "100%", height: 360 }}
                    />
                  </div>

                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50 text-xs text-gray-600">
                    <span className="truncate">
                      {SUT_STATION.address}
                    </span>
                    <button
                      onClick={openGmapsNavigate}
                      className="ml-3 shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100/60"
                    >
                      นำทางด้วย Google Maps
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ADD CAR */}
            <button
              onClick={() => navigate("/user/add-cars")}
              className={btnEqual}
              title="เพิ่มข้อมูลรถ"
            >
              <FaCarSide className="text-blue-600" />
              <span>ADD CAR</span>
            </button>

            {/* My Coins */}
            {user && (
              <button
                onClick={() => navigate("/user/my-coins")}
                className={btnEqual}
                title="ดู Coins"
              >
                <GiTwoCoins className="text-blue-600" />
                <span className="leading-none">
                  My Coins: <b className="text-blue-700">{user.Coin}</b>
                </span>
              </button>
            )}

            {/* Logout */}
            <button onClick={handleLogout} className={btnEqual}>
              <span>Logout</span>
            </button>

            {/* Profile avatar */}
            <button
              onClick={() => navigate("/user/profile")}
              className="ml-1 inline-flex items-center justify-center"
              aria-label="โปรไฟล์"
              title="โปรไฟล์"
            >
              <img
                src={user?.Profile ? `${apiUrlPicture}${user.Profile}` : undefined}
                alt="profile"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                }}
              />
            </button>
          </nav>

          {/* Mobile: hamburger */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-white/10 md:hidden"
            onClick={() => setMenuOpened((s) => !s)}
            aria-label="เมนู"
          >
            <BiMenuAltRight size={26} />
          </button>
        </div>
      </header>

      {/* Mobile sheet menu */}
      <OutsideClickHandler onOutsideClick={() => setMenuOpened(false)}>
        {menuOpened && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setMenuOpened(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-4 shadow-2xl animate-[sheetUp_160ms_ease-out]">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-gray-300" />
              <div className="flex flex-col gap-2">
                <div className="px-1 pb-1 text-base font-semibold text-gray-900">EV Station</div>

                <button
                  onClick={openReportModal}
                  className="w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-50"
                >
                  Report
                </button>

                {/* Map (mobile) → เปิด Google Maps พิกัด SUT */}
                <button
                  onClick={() => {
                    const { lat, lng, name } = SUT_STATION;
                    const urlByCoord = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving&dir_action=navigate`;
                    const urlByName = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                      name
                    )}&travelmode=driving&dir_action=navigate`;
                    window.open(urlByCoord, "_blank");
                    setTimeout(() => window.open(urlByName, "_blank"), 200);
                    setMenuOpened(false);
                  }}
                  className="w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-50"
                >
                  Map
                </button>

                {user && (
                  <button
                    onClick={() => {
                      navigate("/user/my-coins");
                      setMenuOpened(false);
                    }}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <span className="inline-flex items-center gap-2 justify-center">
                      <GiTwoCoins />
                      My Coins: <b className="font-bold">{user.Coin}</b>
                    </span>
                  </button>
                )}

                <div className="mt-1 flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={user?.Profile ? `${apiUrlPicture}${user.Profile}` : undefined}
                      alt="profile"
                      className="h-9 w-9 rounded-full object-cover ring-1 ring-gray-200"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='100%' height='100%' fill='%23e5e7eb'/></svg>";
                      }}
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">
                        {user ? `${user.FirstName ?? ""} ${user.LastName ?? ""}` : "Guest"}
                      </div>
                      <div className="text-gray-500">โปรไฟล์</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/user/profile");
                      setMenuOpened(false);
                    }}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    เปิด
                  </button>
                </div>

                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpened(false);
                  }}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Logout
                </button>
              </div>

              <div style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
            </div>

            <style>{`
              @keyframes sheetUp {
                from { transform: translateY(100%); }
                to   { transform: translateY(0%); }
              }
            `}</style>
          </>
        )}
      </OutsideClickHandler>

      {/* Report Modal */}
      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Header;
