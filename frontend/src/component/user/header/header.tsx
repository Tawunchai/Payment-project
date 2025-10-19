import { useEffect, useState } from "react";
import { BiMenuAltRight } from "react-icons/bi";
import { GiTwoCoins } from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import OutsideClickHandler from "react-outside-click-handler";
import ReportModal from "./report/index";
import { getUserByID, apiUrlPicture } from "../../../services";
import { UsersInterface } from "../../../interface/IUser";

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

  useEffect(() => {
    const uid = Number(localStorage.getItem("userid") || 0);
    if (!uid) return;
    getUserByID(uid)
      .then((res) => res && setUser(res))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    messageApi.success("ออกจากระบบ");
    setTimeout(() => navigate("/login"), 1200);
  };

  const openReportModal = () => {
    setModalOpen(true);
    setMenuOpened(false);
  };

  return (
    <>
      {contextHolder}

      {/* HEADER: blue, minimal, sticky */}
      <header
        className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3">
          {/* Left: Brand text (show on mobile too) */}
          <button
            className="flex items-center gap-2"
            onClick={() => navigate("/user")}
            aria-label="หน้าหลัก"
          >
            <span className="text-sm font-semibold tracking-wide">EV Station</span>
          </button>

          {/* Right: Desktop menu */}
          <nav className="hidden items-center gap-3 md:flex">

            <button
              onClick={openReportModal}
              className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
            >
              Report
            </button>

            {user && (
              <button
                onClick={() => navigate("/user/my-coins")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                title="ดู Coins"
              >
                <GiTwoCoins className="text-blue-600" />
                <span className="leading-none">
                  My Coins: <b className="text-blue-700">{user.Coin}</b>
                </span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="rounded-xl bg-white px-3 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Logout
            </button>

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
