import Logo from "../../assets/Real/logo.png"
import "./header.css"
const header = () => {
  return (
    <section className='h-wrapper'>
      <div className='flexCenter paddings innerWidth h-container'>
        <img src={Logo} alt="logo" width={135} />

        <div className="flexCenter h-menu">
          <a href="">Getting Started</a>
          <a href="">New</a>
          <a href="">Report</a>
          <a href="">Change Language</a>
          <button className="button">            
            <a href="">Contact</a></button>
        </div>
      </div>
    </section>
  )
}

export default header