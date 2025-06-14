import React, {useState} from 'react'
import './bottom.css'

import Chart from "react-apexcharts";
// Imported Images
import img from '../../../../assets/picture/laptop.png'
import img1 from '../../../../assets/picture/dimensions.png'
import img2 from '../../../../assets/picture/animation.png'

const Bottom = () => {
  
  const [state, setState] = useState({
    options: {
      colors:['#01565B', '#5ABA8A'],
      chart: {
        id: "basic-bar",
        toolbar:{
          show: true,
          tools: {
            download: true,
            selection: false,
            zoom: false,
            zoomin: false,
            zoomout: false,
            pan: false,
            reset: true | '<img src="/static/icons/reset.png" width="10">',
            customIcons: []
          },
        },
        
      },
      
      xaxis: {
        categories: ['Sub','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      }
    },
    series: [
      {
        name: "Updates",
        data: [25, 44, 12, 89, 23, 20, 30]
      },
      {
        name: "New Tasks",
        data: [70, 47, 72, 45, 12, 59, 38]
      }
    ]
  })

  return (
    <div className='bottom flex'>
      <div className="graphDiv">
      <span className="title">Upcoming Activity</span>
      <Chart
        options={state.options}
        series={state.series}
        type="area"
        width="500"
      />
      </div>

      <div className="scheduleDiv">
      <span className="title">Upcoming Schedule</span>

        <div className="singleTask flex">
          <div className="imgDiv flex">
            <img src={img} alt="Task Image" />
          </div>
          <div className="taskInfo">
            <span className="task">Desk Time Redesign</span>
             <span className="status">Working On</span>
          </div>
          <span className="time">09:30 AM</span>
        </div>

        <div className="singleTask flex">
          <div className="imgDiv flex">
            <img src={img1} alt="Task Image" />
          </div>
          <div className="taskInfo">
            <span className="task">New Landing Page</span>
             <span className="status">Working On</span>
          </div>
          <span className="time">10:30 AM</span>
        </div>

        <div className="singleTask flex">
          <div className="imgDiv flex">
            <img src={img2} alt="Task Image" />
          </div>
          <div className="taskInfo">
            <span className="task">Create Animation</span>
             <span className="status">Working On</span>
          </div>
          <span className="time">11:50 AM</span>
        </div>

      <div className="btn">
        See All Activity
      </div>
      </div>
    </div>
  )
}

export default Bottom