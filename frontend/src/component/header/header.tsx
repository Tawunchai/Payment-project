
import "./header.css"
import Logo from "../../assets/picture/Logo EV.png"
const herder = () => {
  return (
    <div className='header'>
      <img src={Logo} alt="" className="logo" />

      <ul className="header-menu">
        <li>Home</li>
        <li>Program</li>
        <li>Why us</li>
        <li>Plans</li>
        <li>Testimonials</li>
      </ul>
    </div>
  )
}

export default herder