import { BiMenuAltRight } from "react-icons/bi"
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import Logo from "../../../assets/picture/Direct_Energy_logo.svg.png"
import "./header.css"
import { useState, CSSProperties } from "react"
import OutsideClickHandler from "react-outside-click-handler";
import ReportModal from "./report/index"; // import modal report form ที่จะสร้าง

type HeaderProps = {
  scrollToValue: () => void;
  scrollToNew: () => void;
};

const Header = ({ scrollToValue, scrollToNew }: HeaderProps) => {
  const [menuOpened, setMenuOpened] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);  // state เปิดปิด modal

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
            {/* แก้ตรงนี้ */}
            <a onClick={openReportModal} style={{ cursor: "pointer" }}>Report</a>
            <button className="button" onClick={handleLogout}>
              <a href="">Logout</a>
            </button>
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
