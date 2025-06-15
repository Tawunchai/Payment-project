import "./type.css"
import oil1 from "../../assets/Real/prologis.png"
import oil2 from "../../assets/Real/tower.png"
import oil3 from "../../assets/Real/equinix.png"
import oil4 from "../../assets/Real/realty.png"

const type = () => {
  return (
    <div className='c-wrapper'>
        <div className='paddings innerWidth flexCenter c-container'>
            <img src={oil1} alt="" />
            <img src={oil2} alt="" />
            <img src={oil3} alt="" />
            <img src={oil4} alt="" />
        </div>
    </div>
  )
}

export default type