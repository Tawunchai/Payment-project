import "./hero.css"
import Header from "../header/header"
import hero_img from "../../assets/picture/EV.jpg"
import hero_img_back from "../../assets/picture/hero_image_back.png"
import Calories from "../../assets/picture/calories.png"

const hero = () => {
  return (
    <div className='hero'>
      <div className="left-h">
        <Header />
        <div className="the-best-ad">
          <div></div>
          <span>the best fitness club in the town</span>
        </div>

        <div className="hero-text">
          <div>
            <span className="stroke-text">Shape </span>
            <span>Your</span>
          </div>
          <div>
            <span>Ideal body</span>
          </div>
          <div>
            <span>
              In here we will help you to shape and build your ideal body and live up your life to fullest
            </span>
          </div>
        </div>

        <div className="figures">
          <div>
            <span>250$</span>
            <span>DC Charging</span>
          </div>
          <div>
            <span>100$</span>
            <span>AC Charging</span>
          </div>
          <div>
            <span>+978</span>
            <span>Members joined</span>
          </div>
        </div>

        <div className="hero-buttons">
          <button className="btn">Charge now</button>
          <button className="btn">Learn More</button>
        </div>
      </div>
      <div className="right-h">
        <button className="btn">Join Now</button>

        <img src={hero_img} alt="" className="hero-img" />
        <img src={hero_img_back} alt="" className="hero-img-back" />

        <div className="calories">
          <img src={Calories} alt="" />
          <div>
            <span>Calories Burned</span>
            <span>200 kcal</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default hero