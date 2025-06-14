import './top.css'


// Imported Icons====>
import { AiOutlineSearch } from 'react-icons/ai'

const Top = () => {
  return (
    <div className='top'>
      <div className="topDiv flex">
        <div className="titleText">
          <span className="title">Working Productivity</span>
          <p>Let's check your progress</p>
        </div>
        <div className="searchInput flex">
          <AiOutlineSearch className="icon" />
          <input type="text" placeholder='Search for anything...' />
        </div>
      </div>

      <div className="cardsDiv flex">
        <div className="cards">
          <div className="card yellowCard flex">

            <div className="date">
              <span>Mon</span>
              <h3>18</h3>
            </div>

            <div className="percentage">
              <span className="text">Productive</span>
              <div className='flex'>
                <span className="line"></span>
                <span className="pctg">86%</span>
              </div>
            </div>

            <div className="time">
              <span className="text">Productive Time</span>
              <h2>5h 12m</h2>
            </div>

            <div className="workTime">
              <span className="text">Time at Work</span>
              <h2>5h 45m</h2>
            </div>

          </div>

          <div className="card lightGreenCard flex">

            <div className="date">
              <span>Tue</span>
              <h3>19</h3>
            </div>

            <div className="percentage">
              <span className="text">Productive</span>
              <div className='flex'>
                <span className="line"></span>
                <span className="pctg">86%</span>
              </div>
            </div>

            <div className="time">
              <span className="text">Productive Time</span>
              <h2>7h 24m</h2>
            </div>

            <div className="workTime">
              <span className="text">Time at Work</span>
              <h2>4h 55m</h2>
            </div>

          </div>

          <div className="card darkGreenCard flex">

            <div className="date">
              <span>Wed</span>
              <h3>20</h3>
            </div>

            <div className="percentage">
              <span className="text">Productive</span>
              <div className='flex'>
                <span className="line"></span>
                <span className="pctg">69%</span>
              </div>
            </div>

            <div className="time">
              <span className="text">Productive Time</span>
              <h2>7h 18m</h2>
            </div>

            <div className="workTime">
              <span className="text">Time at Work</span>
              <h2>3h 15m</h2>
            </div>

          </div>
        </div>

        <div className="statDiv">
          <span className="title">
            Statistics on October
          </span>

          <div className="stat">

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Completed Works</span>
                <span className="percentage">40%</span>
              </div>
              <div className="line">
                <span className="range"></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Tasks</span>
                <span className="percentage">80%</span>
              </div>
              <div className="line">
                <span className="range"></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Upcoming</span>
                <span className="percentage">25%</span>
              </div>
              <div className="line">
                <span className="range"></span>
              </div>
            </div>

            <div className="singleStat">
              <div className="statInfo flex">
                <span className="status">Hours</span>
                <span className="percentage">63%</span>
              </div>
              <div className="line">
                <span className="range"></span>
              </div>
            </div>



          </div>


        </div>
      </div>
    </div>
  )
}

export default Top