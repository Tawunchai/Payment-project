import { SlideLeft } from "./SlideLeft"
import { GrYoga } from "react-icons/gr"
import { FaDumbbell } from "react-icons/fa6"
import { GiGymBag } from "react-icons/gi"
import { motion } from "framer-motion"

const NewData = [
  {
    id: 1,
    title: "One-on-One Teach 1",
    des: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero sed inventore voluptas numquam, nihil similique vero beatae",
    icon: <GrYoga />,
    bgColor: "#0063ff",
    delay: 0.3,
  },
  {
    id: 2,
    title: "One-on-One Teach 2",
    des: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero sed inventore voluptas numquam, nihil similique vero beatae",
    icon: <FaDumbbell />,
    bgColor: "#73bc00",
    delay: 0.6,
  },
  {
    id: 3,
    title: "One-on-One Teach 3",
    des: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero sed inventore voluptas numquam, nihil similique vero beatae",
    icon: <GiGymBag />,
    bgColor: "#fa6400",
    delay: 0.9,
  },
  {
    id: 4,
    title: "One-on-One Teach 4",
    des: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Libero sed inventore voluptas numquam, nihil similique vero beatae",
    icon: <GiGymBag />,
    bgColor: "#fe6baa",
    delay: 0.9,
  },
]

const New = () => {
  return (
    <div className='bg-[#f9f9f9]'>
      <div className='ContainerExtra py-24 paddings'>
        <div className='space-y-4 p-6 text-center max-w-[500px] mx-auto mb-5'>
          <h1 className='uppercase font-semibold text-black text-[32px]'>Total News Management</h1>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
          {
            NewData.map((item) => {
              return (
                <motion.div
                  variants={SlideLeft(item.delay)}
                  initial="hidden"
                  whileInView={"visible"}
                  className='space-y-2 p-6 rounded-xl shadow-[0_0_22px_0_rgba(0,0,0,0.15)]'>
                  <div style={{ backgroundColor: item.bgColor }} className='w-10 h-10 rounded-lg flex justify-center items-center text-white'>
                    <div className='text-2xl'>{item.icon}</div>
                  </div>
                  <p className='font-semibold'>{item.title}</p>
                  <p className='text-sm text-gray-500'>{item.des}</p>
                </motion.div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}

export default New