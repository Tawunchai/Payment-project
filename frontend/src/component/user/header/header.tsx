import { BiMenuAltRight } from "react-icons/bi"
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import Logo from "../../../assets/picture/Direct_Energy_logo.svg.png"
import "./header.css"
import { useState, CSSProperties, useEffect } from "react"
import OutsideClickHandler from "react-outside-click-handler";
import ReportModal from "./report/index"; // import modal report form ที่จะสร้าง
import { TooltipComponent } from '@syncfusion/ej2-react-popups';
import { getUserByID } from "../../../services";  
import {UsersInterface} from "../../../interface/IUser"

type HeaderProps = {
  scrollToValue: () => void;
  scrollToNew: () => void;
};

const Header = ({ scrollToValue, scrollToNew }: HeaderProps) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);  // state เปิดปิด modal
  const [profile, setProfile] = useState<UsersInterface | null>(null);

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
        right: menuOpened ? "1.5rem" : "-100%"
      }
    }
    return undefined
  }

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userRole");
    localStorage.clear();

    message.success("ออกจากระบบ");

    setTimeout(() => {
      navigate("/login");
    }, 3500);
  };

  // ฟังก์ชันเปิด modal report
  const openReportModal = () => {
    setModalOpen(true);
    setMenuOpened(false); // ปิดเมนูหลังเลือก
  };

  // ปิด modal
  const closeReportModal = () => {
    setModalOpen(false);
  };

  return (
    <section className='h-wrapper'>
      <div className='flexCenter paddings innerWidth h-container'>
        <img src={Logo} alt="logo" width={180} />

        <OutsideClickHandler onOutsideClick={() => {
          setMenuOpened(false)
        }}>

          <div className="flexCenter h-menu" style={getMenuStyles(menuOpened)}>
            <a onClick={scrollToValue}>Getting Started</a>
            <a onClick={scrollToNew}>Announcement</a>
            <a onClick={openReportModal} style={{ cursor: "pointer" }}>Report</a>
            <button className="button" onClick={handleLogout}>
              <a href="">Logout</a>
            </button>
            <TooltipComponent position="BottomCenter">
              <div
                className="flex items-center gap-2 cursor-pointer p-1 rounded-lg"
                onClick={() => navigate("/user/profile")} // เพิ่มตรงนี้
              >
                <img
                  className="rounded-full w-10 h-10"
                  src={`http://localhost:8000/${profile?.Profile}`}
                  alt="user-profile"
                />
              </div>
            </TooltipComponent>
          </div>

        </OutsideClickHandler>

        <div className="menu-icon" onClick={() => setMenuOpened(prev => !prev)}>
          <BiMenuAltRight size={30} />
        </div>
      </div>

      {/* ใส่ Modal Report */}
      <ReportModal open={modalOpen} onClose={closeReportModal} />
    </section>
  )
}

export default Header
