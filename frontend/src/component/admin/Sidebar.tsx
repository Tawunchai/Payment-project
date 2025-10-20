import { Link, NavLink } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { links } from "../../assets/admin/dummy";
import { useStateContext } from "../../contexts/ContextProvider";

const Sidebar: React.FC = () => {
  const { currentColor, activeMenu, setActiveMenu, screenSize } =
    useStateContext();

  const handleCloseSideBar = () => {
    if (activeMenu && screenSize && screenSize <= 900) setActiveMenu(false);
  };

  const activeLink =
    "flex items-center gap-4 px-3 py-2.5 rounded-xl text-white text-[14px] font-semibold shadow-sm ring-1 ring-white/20 bg-white/15";
  const normalLink =
    "flex items-center gap-4 px-3 py-2.5 rounded-xl text-[14px] text-white/90 hover:text-white hover:bg-white/10 transition-colors";

  if (!activeMenu) return null;

  return (
    <aside
      className="
        fixed md:static inset-y-0 left-0 z-40
        w-[88vw] max-w-[320px] md:w-72
        h-screen
        bg-gradient-to-b from-sky-600 via-blue-600 to-indigo-700
        text-white
        shadow-2xl md:shadow-none
        border-r border-white/10
      "
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <Link
          to="/admin"
          onClick={handleCloseSideBar}
          className="flex items-center gap-2 select-none"
          aria-label="Go to dashboard"
        >
          {/* Text logo: EV Station */}
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold tracking-wide">EV</span>
            <span className="text-lg font-semibold opacity-90">Station</span>
          </div>
          <span className="ml-2 inline-flex items-center rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide">
            Admin
          </span>
        </Link>

        <TooltipComponent content="Close menu" position="BottomCenter">
          <button
            type="button"
            onClick={() => setActiveMenu(false)}
            className="
              md:hidden rounded-xl p-2
              text-white hover:bg-white/15 active:bg-white/25
              transition-colors
            "
            aria-label="Close sidebar"
            style={{ color: currentColor || "#fff" }}
          >
            <MdOutlineCancel className="text-xl" />
          </button>
        </TooltipComponent>
      </div>

      {/* Body */}
      <nav className="px-3 pb-6 overflow-y-auto h-[calc(100vh-64px)]">
        {links.map((section) => (
          <div key={section.title} className="mb-4">
            <p className="px-2 py-2 text-[11px] tracking-wide uppercase text-white/70">
              {section.title}
            </p>

            <div className="space-y-1">
              {section.links.map((link) => (
                <NavLink
                  to={`/admin/${link.name}`}
                  key={link.name}
                  onClick={handleCloseSideBar}
                  className={({ isActive }) => (isActive ? activeLink : normalLink)}
                >
                  <span
                    className="
                      inline-grid place-items-center
                      h-9 w-9 rounded-lg
                      bg-white/10 text-white text-lg
                    "
                  >
                    {link.icon}
                  </span>
                  <span className="capitalize truncate">{link.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
