import React, { useEffect, useState } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { RiNotification3Line } from "react-icons/ri";
import { MdKeyboardArrowDown } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { Notification, UserProfile } from ".";
import { useStateContext } from "../../contexts/ContextProvider";
import { getEmployeeByID, apiUrlPicture } from "../../services";

/** ---------- Small, typed button (no JSX namespace) ---------- */
type NavBtnProps = {
  title: string;
  onClick: () => void;
  icon: React.ReactNode;
  dotColor?: string;
  "aria-label"?: string;
};

const NavButton: React.FC<NavBtnProps> = ({
  title,
  onClick,
  icon,
  dotColor,
  "aria-label": ariaLabel,
}) => (
  <TooltipComponent content={title} position="BottomCenter">
    <button
      type="button"
      aria-label={ariaLabel ?? title}
      onClick={onClick}
      className="
        relative rounded-xl p-2.5 text-[20px]
        text-blue-600 hover:bg-blue-50 active:bg-blue-100
        transition-colors
      "
    >
      {dotColor ? (
        <span
          style={{ background: dotColor }}
          className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full"
        />
      ) : null}
      {icon}
    </button>
  </TooltipComponent>
);

/** -------------------------- Navbar -------------------------- */
const Navbar: React.FC = () => {
  const { //@ts-ignore
    currentColor,
    activeMenu,
    setActiveMenu,
    handleClick,
    isClicked,
    setScreenSize,
    screenSize,
  } = useStateContext();

  const [firstnameUser, setFirstnameUser] = useState<string>("");
  const [profile, setProfile] = useState<string>("");

  useEffect(() => {
    const employeeID = localStorage.getItem("employeeid");
    if (employeeID) {
      getEmployeeByID(Number(employeeID))
        .then((employee) => {
          if (employee?.User) {
            setFirstnameUser(employee.User.FirstName || "");
            setProfile(employee.User.Profile || "");
          }
        })
        .catch(() => {});
    }

    const onResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [setScreenSize]);

  useEffect(() => {
    if (typeof screenSize === "number") {
      setActiveMenu(screenSize > 900);
    }
  }, [screenSize, setActiveMenu]);

  const handleActiveMenu = () => setActiveMenu(!activeMenu);

  const avatarSrc =
    profile && profile.trim()
      ? `${apiUrlPicture}${profile}`
      : "data:image/svg+xml;utf8," +
        encodeURIComponent(
          `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
            <rect width='100%' height='100%' rx='12' ry='12' fill='#eff6ff'/>
            <text x='50%' y='54%' text-anchor='middle' dominant-baseline='middle'
              font-size='20' font-family='Arial, Helvetica, sans-serif' fill='#2563eb'>EV</text>
          </svg>`
        );

  return (
    <header
      className="
        sticky top-0 z-30 w-full
        bg-white/80 backdrop-blur-md
        border-b border-blue-100
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div
        className="
          mx-auto max-w-screen-2xl
          px-3 sm:px-4 md:px-6
          h-14 sm:h-16
          flex items-center justify-between
        "
      >
        {/* Left: menu */}
        <div className="flex items-center gap-1">
          <NavButton
            title="Menu"
            aria-label="Open menu"
            onClick={handleActiveMenu}
            icon={<AiOutlineMenu />}
          />
        </div>

        {/* Center: brand (mobile-first minimal) */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white text-[14px] font-bold">
            EV
          </span>
          <span className="text-sm font-semibold tracking-wide text-blue-700">
            FastCharge Admin
          </span>
        </div>

        {/* Right: quick actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavButton
            title="Notifications"
            aria-label="Open notifications"
            dotColor="rgb(254, 201, 15)"
            onClick={() => handleClick("notification")}
            icon={<RiNotification3Line />}
          />

          <TooltipComponent content="Profile" position="BottomCenter">
            <button
              onClick={() => handleClick("userProfile")}
              className="
                group flex items-center gap-2 rounded-xl
                px-2 py-1
                hover:bg-blue-50 active:bg-blue-100
                transition-colors
                max-w-[56vw] sm:max-w-none
              "
              aria-label="Open profile"
            >
              <img
                src={avatarSrc}
                alt="user"
                className="h-8 w-8 rounded-xl object-cover ring-1 ring-blue-100"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = avatarSrc;
                }}
              />
              <span className="hidden sm:block text-[13px] font-semibold text-blue-700 truncate">
                {firstnameUser || "User"}
              </span>
              <MdKeyboardArrowDown className="hidden sm:block text-blue-500 group-hover:text-blue-700" />
            </button>
          </TooltipComponent>
        </div>
      </div>

      {/* slide-in panels */}
      {isClicked.notification && <Notification />}
      {isClicked.userProfile && <UserProfile />}
    </header>
  );
};

export default Navbar;
