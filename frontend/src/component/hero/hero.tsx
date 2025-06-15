import "./hero.css"
import Hero_Image from "../../assets/Real/hero-image.png"
import CountUp from "react-countup"
const hero = () => {
  return (
    <section className="hero-wrapper">
      <div className="flexCenter paddings innerWidth hero-container">
        <div className="flexColStart hero-left">
          <div className="hero-title">
            <div className="orange-circle"/>
            <h1>
              Discover <br />
              Most Suitable <br />
              Property
            </h1>
          </div>

          <div className="flexColStart hero-des">
            <span className="secondaryText">Find a variety of properties that suit you very easilty</span>
            <span className="secondaryText">Forget all difficulties in finding a residence for you</span>
          </div>

          <div className="flexCenter search-bar">
            <button className="button">Power Charg</button>
            <button className="button">Learn More</button>
          </div>

          <div className="flexCenter stats">
            <div className="flexColCenter stat">
              <span>
                <CountUp start={8800} end={9000} duration={4}/>
                <span>$</span>
              </span>
              <span className="secondaryText">AC Charging</span>
            </div>

            <div className="flexColCenter stat">
              <span>
                <CountUp start={1950} end={2000} duration={4}/>
                <span>$</span>
              </span>
              <span className="secondaryText">DC Charging</span>
            </div>

            <div className="flexColCenter stat">
              <span>
                <CountUp end={28}/>
                <span>+</span>
              </span>
              <span className="secondaryText">Members</span>
            </div>
          </div>
        </div>

        <div className="flexCenter hero-right">
          <div className="image-container">
            <img src={Hero_Image} alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}

export default hero