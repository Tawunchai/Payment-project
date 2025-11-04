import { useEffect, useRef, useState } from "react";
import { BiMenuAltRight } from "react-icons/bi";
import { GiTwoCoins } from "react-icons/gi";
import { FaCarSide } from "react-icons/fa";
import { MdOutlineReport, MdMap } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import OutsideClickHandler from "react-outside-click-handler";
import ReportModal from "./report/index";
import { getUserByID, apiUrlPicture, GetReportByID } from "../../../services";
import {
  clearCachedUser,
  getCurrentUser,
  initUserProfile,
  Logout,
} from "../../../services/httpLogin";
import { UsersInterface } from "../../../interface/IUser";
import { ReportInterface } from "../../../interface/IReport";

/* === Leaflet map === */
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const SUT_STATION = {
  name: "มหาวิทยาลัยเทคโนโลยีสุรนารี (SUT)",
  address: "111 ถ.มหาวิทยาลัย ต.สุรนารี อ.เมืองนครราชสีมา",
  lat: 14.8819,
  lng: 102.017,
};

// ✅ เพิ่มส่วนนี้
interface HeaderProps {
  scrollToValue?: () => void;
  scrollToNew?: () => void;
}

const Header: React.FC<HeaderProps> = ({}) => {
  const navigate = useNavigate();
  const [menuOpened, setMenuOpened] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState<UsersInterface | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const mapWrapRef = useRef<HTMLDivElement | null>(null);
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<L.Map | null>(null);

  // ✅ โหลดข้อมูลผู้ใช้จาก cookie (memory)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        let current = getCurrentUser();
        if (!current) current = await initUserProfile();
        const uid = current?.id;
        if (!uid) return;

        const res = await getUserByID(uid);
        if (res) setUser(res);
      } catch (err) {
        console.error("❌ Error fetching user:", err);
      }
    };
    fetchUser();
  }, []);

  // ✅ ปิดแผนที่เมื่อคลิกนอก
  useEffect(() => {
    if (!mapOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!mapWrapRef.current?.contains(e.target as Node)) setMapOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMapOpen(false);
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [mapOpen]);

  // ✅ แสดงแผนที่
  useEffect(() => {
    if (!mapOpen || !mapElRef.current) return;
    if (!mapInstance.current) {
      const map = L.map(mapElRef.current, {
        center: [SUT_STATION.lat, SUT_STATION.lng],
        zoom: 16,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
      L.marker([SUT_STATION.lat, SUT_STATION.lng])
        .addTo(map)
        .bindPopup(`<b>${SUT_STATION.name}</b><br/>${SUT_STATION.address}`)
        .openPopup();
      mapInstance.current = map;
    } else {
      mapInstance.current.invalidateSize();
    }
  }, [mapOpen]);

  // ✅ ตรวจสอบว่ารายงานภายใน 7 วันหรือยัง
  const handleOpenReport = async () => {
    try {
      let current = getCurrentUser();
      if (!current) current = await initUserProfile();
      const uid = current?.id ?? 0;

      if (!uid) {
        messageApi.error("กรุณาเข้าสู่ระบบก่อนทำรายการ");
        return;
      }

      const report: ReportInterface | null = await GetReportByID(uid);
      if (!report) {
        setModalOpen(true);
        setMenuOpened(false);
        return;
      }

      const now = new Date();
      const lastReport = new Date(report.CreatedAt ?? "");
      const diffDays = (now.getTime() - lastReport.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 7) {
        messageApi.warning("คุณได้รายงานไปแล้วภายในสัปดาห์นี้ กรุณาติดต่อฝ่ายจัดการ");
      } else {
        setModalOpen(true);
        setMenuOpened(false);
      }
    } catch {
      messageApi.error("ไม่สามารถตรวจสอบสถานะการรายงานได้");
    }
  };

  // ✅ Logout (แก้ไขแล้ว)
  const handleLogout = async () => {
    try {
      const ok = await Logout();
      if (ok) {
        messageApi.success("ออกจากระบบแล้ว");

        // ✅ รอ 1 วิ เพื่อให้ข้อความขึ้นก่อน redirect
        setTimeout(() => {
          clearCachedUser();
          localStorage.removeItem("role");
          window.dispatchEvent(new Event("roleChange")); // ✅ แจ้ง ConfigRoutes ให้อัปเดตทันที
          navigate("/login", { replace: true });
        }, 1000);
      } else {
        messageApi.error("ไม่สามารถออกจากระบบได้");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดระหว่าง Logout");
    }
  };

  const openGmapsNavigate = () => {
    const { lat, lng } = SUT_STATION;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`,
      "_blank"
    );
  };

  const btnEqual =
    "inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50";

  return (
    <>
      {contextHolder}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate("/user")} className="font-semibold">
            EV Station
          </button>

          {/* ✅ Desktop Menu */}
          <nav className="hidden md:flex items-center gap-3">
            <button onClick={handleOpenReport} className={btnEqual}>
              <MdOutlineReport className="text-blue-600" /> Report
            </button>

            {/* Map */}
            <div className="relative" ref={mapWrapRef}>
              <button onClick={() => setMapOpen((s) => !s)} className={btnEqual}>
                <MdMap className="text-blue-600" /> Map
              </button>
              {mapOpen && (
                <div className="absolute right-0 mt-2 w-[560px] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
                  <div className="px-4 py-3 flex justify-between items-center border-b">
                    <span className="font-semibold text-sm text-gray-900">{SUT_STATION.name}</span>
                    <button
                      onClick={() => setMapOpen(false)}
                      className="text-xs px-2 py-1 rounded-lg hover:bg-gray-100"
                    >
                      ปิด
                    </button>
                  </div>
                  <div ref={mapElRef} style={{ width: "100%", height: 320 }} />
                  <div className="bg-gray-50 text-xs flex justify-between items-center px-4 py-2 text-gray-700">
                    <span>{SUT_STATION.address}</span>
                    <button
                      onClick={openGmapsNavigate}
                      className="text-blue-700 hover:bg-blue-100 px-2 py-1 rounded-md"
                    >
                      เปิดใน Google Maps
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => navigate("/user/add-cars")} className={btnEqual}>
              <FaCarSide className="text-blue-600" /> ADD CAR
            </button>

            {user && (
              <button onClick={() => navigate("/user/my-coins")} className={btnEqual}>
                <GiTwoCoins className="text-blue-600" />
                My Coins: <b className="text-blue-700">{user.Coin}</b>
              </button>
            )}

            <button onClick={handleLogout} className={btnEqual}>
              Logout
            </button>

            <button onClick={() => navigate("/user/profile")} className="ml-2">
              <img
                src={user?.Profile ? `${apiUrlPicture}${user.Profile}` : undefined}
                alt="profile"
                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/30"
              />
            </button>
          </nav>

          {/* ✅ Mobile Hamburger */}
          <button
            className="md:hidden h-10 w-10 flex items-center justify-center rounded-xl hover:bg-white/10"
            onClick={() => setMenuOpened((s) => !s)}
          >
            <BiMenuAltRight size={26} />
          </button>
        </div>
      </header>

      {/* ✅ Mobile Menu */}
      <OutsideClickHandler onOutsideClick={() => setMenuOpened(false)}>
        {menuOpened && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMenuOpened(false)}
            />
            <div className="fixed inset-x-0 bottom-0 z-50 bg-white p-4 rounded-t-3xl shadow-2xl animate-[sheetUp_180ms_ease-out]">
              <div className="h-1.5 w-12 bg-gray-300 rounded-full mx-auto mb-2" />
              <div className="flex flex-col gap-2">
                <div className="px-1 pb-1 font-semibold text-gray-900">EV Station</div>

                <button
                  onClick={handleOpenReport}
                  className="w-full rounded-xl px-4 py-3 text-left text-gray-800 hover:bg-gray-50"
                >
                  รายงานปัญหา (Report)
                </button>

                {user && (
                  <button
                    onClick={() => {
                      navigate("/user/my-coins");
                      setMenuOpened(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <GiTwoCoins className="text-lg" />
                    <span>
                      My Coins: <b>{user.Coin}</b>
                    </span>
                  </button>
                )}

                {/* ✅ โปรไฟล์ */}
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
            </div>

            <style>{`
              @keyframes sheetUp {
                from { transform: translateY(100%); opacity: 0.3; }
                to { transform: translateY(0%); opacity: 1; }
              }
            `}</style>
          </>
        )}
      </OutsideClickHandler>

      {/* ✅ Modal Report */}
      <ReportModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Header;
