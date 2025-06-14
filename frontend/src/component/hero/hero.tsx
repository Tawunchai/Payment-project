import "./hero.css"
import Header from "../header/header"

const hero = () => {
  return (
    <div className='hero'>
        <div className="left-h"><Header/></div>
        <div className="right-h">right side</div>
    </div>
  )
}

export default hero