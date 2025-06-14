import './account.css'

// Imported Images =========>
import img from '../../../assets/picture/image.png'

// Imported Icons =========>
import {BiChevronRight} from 'react-icons/bi'
import {BsThreeDots} from 'react-icons/bs'
import {BiEdit} from 'react-icons/bi'

const Account = () => {
  return (
    <div className='account'>
      <div className="icons flex">
         <BiChevronRight className="icon"/>
         <BsThreeDots className="icon"/>
      </div>
      <div className="accountDetails">
        <div className="imageDiv">
          <img src={img} alt="Account User Image" />
          <span className="name">Jack Charmaine</span>
          <span className="position">Private Sector Employee</span>
          <button className='btn flex'>
            <BiEdit className="icon"/>
            Edit Profile
            </button>
        </div>

        <div className="hoursDiv">
          <span className="title">Working Hours</span>
          <div className="hoursCard flex">
            <div className="right bg">
              <span>Work Starts</span>
              <h6>09:00 am</h6>
            </div>
            <div className="left noBg">
              <span>Work Ends</span>
              <h6>05:00 pm</h6>
            </div>
          </div>
        </div>

        <h1>Ntungamo City</h1>
         <span className='region'>Western Uganda, GMT+8</span>
      </div>
    </div>
  )
}

export default Account