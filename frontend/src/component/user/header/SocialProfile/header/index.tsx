import { useState, useEffect, CSSProperties } from "react";
import { BiMenuAltRight } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import Logo from "../../../../../assets/LogoEV2.png";
import "./extra.css";
import OutsideClickHandler from "react-outside-click-handler";
import ReportModal from "../../report/index";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { getUserByID } from "../../../../../services";  
import {UsersInterface} from "../../../../../interface/IUser"

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [profile, setProfile] = useState<UsersInterface | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
  const userIDString = localStorage.getItem("userid");
  if (userIDString) {
    const userID = Number(userIDString);
    getUserByID(userID)
      .then((user) => {
        if (user) {
          console.log("ข้อมูลผู้ใช้ที่ได้จาก getUserByID:", user); // <== ตรงนี้
          setProfile(user);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch user profile:", error);
      });
  }
}, []);


  const getMenuStyles = (menuOpened: boolean): CSSProperties | undefined => {
    if (document.documentElement.clientWidth <= 800) {
      return {
        right: menuOpened ? "1.5rem" : "-100%",
      };
    }
    return undefined;
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userID"); // ถ้ามีเก็บ
    localStorage.clear();

    message.success("ออกจากระบบ");

    setTimeout(() => {
      navigate("/login");
    }, 3500);
  };

  const closeReportModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="ex-h-wrapper">
      <div className="ex-h-container flex justify-between items-center w-full">
        <img
          src={Logo}
          alt="logo"
          width={180}
          onClick={() => navigate("/user")}
          style={{ cursor: "pointer" }}
        />

        <OutsideClickHandler onOutsideClick={() => setMenuOpened(false)}>
          <div className="ex-h-menu flex items-center" style={getMenuStyles(menuOpened)}>
            <button className="button" onClick={handleLogout}>
              <a href="">Logout</a>
            </button>

            <TooltipComponent position="BottomCenter">
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-lg"
                onClick={() => navigate("/user/profile")}
              >
                {profile ? (
                  <img
                    className="rounded-full w-10 h-10"
                    src={`http://localhost:8000/${profile.Profile}`}
                    alt="user-profile"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300" />
                )}
              </div>
            </TooltipComponent>
          </div>
        </OutsideClickHandler>

        <div className="ex-menu-icon" onClick={() => setMenuOpened((prev) => !prev)}>
          <BiMenuAltRight size={30} />
        </div>
      </div>

      <ReportModal open={modalOpen} onClose={closeReportModal} />
    </section>
  );
};

export default Header;
