import "./hero.css";
import Hero_Image from "../../../assets/picture/car_charging.jpg";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { ListEVCharging } from "../../../services/index";
import { ListUsers } from "../../../services/index";
import { EVchargingInterface } from "../../../interface/IEV";
import { UsersInterface } from "../../../interface/IUser";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  scrollToValue: () => void;
};

const Hero = ({ scrollToValue }: HeaderProps) => {
  const [evList, setEVList] = useState<EVchargingInterface[]>([]);
  const [userList, setUserList] = useState<UsersInterface[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const evs = await ListEVCharging();
      console.log(evs)
      const users = await ListUsers();

      if (evs) setEVList(evs);
      if (users) setUserList(users);
    };

    fetchData();
  }, []);

  const namePriceSums = evList.reduce((acc: Record<string, number>, ev) => {
    const name = ev.Name || "Unknown";
    acc[name] = (acc[name] || 0) + ev.Price;
    return acc;
  }, {});


  return (
    <section className="hero-wrapper">
      <div className="flexCenter paddings innerWidth hero-container">
        <div className="flexColStart hero-left">
          <div className="hero-title">
            <div className="orange-circle" />
            <h1>
              Discover <br />
              Best EV <br />
              Charging Spot
            </h1>
          </div>

          <div className="flexColStart hero-des">
            <span className="secondaryText">Find EV charging stations that fit your needs effortlessly</span>
            <span className="secondaryText">Say goodbye to the hassle of finding a place to recharge</span>
          </div>

          <div className="flexCenter search-bar">
            <button className="button" onClick={() => navigate("/user/payment")}>Power Charg</button>
            <button className="button" onClick={scrollToValue}>Learn More</button>
          </div>

          <div className="flexCenter stats">
            {Object.entries(namePriceSums).map(([name, totalPrice]) => (
              <div key={name} className="flexColCenter stat">
                <span>
                  <CountUp start={0} end={parseFloat(totalPrice.toFixed(2))} duration={2} decimals={2} />
                  <span>$</span>
                </span>
                <span className="secondaryText">{name}</span>
              </div>
            ))}

            <div className="flexColCenter stat">
              <span>
                <CountUp start={0} end={userList.length} duration={2} />
                <span>+</span>
              </span>
              <span className="secondaryText">Members</span>
            </div>
          </div>
        </div>

        <div className="flexCenter hero-right">
          <div className="image-container">
            <img src={Hero_Image} alt="EV Charging" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
