import "./footer.css"
import Logo2 from "../../../assets/Real/logo2.png"

const footer = () => {
    return (
        <div className="f-wrapper">
            <div className="paddings innerWidth flexCenter f-container">
                <div className="flexColStart f-left">
                    <img src={Logo2} alt="" width={120} />
                    <span className="secondaryText">Our vision is to make all people <br />
                        the best place to live for them.</span>
                </div>

                <div className="flexColStart f-right">
                    <span className="primaryText">Information</span>
                    <span className="secondaryText">145 New York, FL 5467, USA</span>
                </div>
            </div>
        </div>
    )
}

export default footer