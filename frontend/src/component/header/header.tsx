import { BiMenuAltRight } from "react-icons/bi"
import Logo from "../../assets/Real/logo.png"
import "./header.css"
import { useState, CSSProperties } from "react"
import OutsideClickHandler from "react-outside-click-handler";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false)

  const getMenuStyles = (menuOpened: boolean): CSSProperties | undefined => {
    if (document.documentElement.clientWidth <= 800) {
      return {
        right: menuOpened ? "1.5rem" : "-100%"
      }
    }
    return undefined
  }

  return (
    <section className='h-wrapper'>
      <div className='flexCenter paddings innerWidth h-container'>
        <img src={Logo} alt="logo" width={135} />

        <OutsideClickHandler onOutsideClick={() => {
          setMenuOpened(false)
        }}>

          <div className="flexCenter h-menu" style={getMenuStyles(menuOpened)}>
            <a href="">Getting Started</a>
            <a href="">New</a>
            <a href="">Report</a>
            <a href="">Change Language</a>
            <button className="button">
              <a href="">Contact</a></button>
          </div>

        </OutsideClickHandler>

        <div className="menu-icon" onClick={() => setMenuOpened(prev => !prev)}>
          <BiMenuAltRight size={30} />
        </div>
      </div>
    </section>
  )
}

export default Header
