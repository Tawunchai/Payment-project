import "./new.css";
import { motion } from "framer-motion";
import { SlideUp } from "./animation";
import Pictuer1 from "../../assets/Real/r1.png";
import Pictuer2 from "../../assets/Real/r2.png";

const NewData = [
    {
        image: Pictuer1,
        tag: "CUSTOMER WITH YOUR SCHEDULE",
        title: "Personalized Profession Online Tutor on Your Schedule",
        subtitle:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus atque voluptas labore nemo ipsam voluptatum maxime facere hic, eum illo, nobis inventore asperiores eaque exercitationem maiores laboriosam accusantium nihil quaerat.",
        link: "#",
    },
    {
        image: Pictuer2,
        tag: "CUSTOMER WITH YOUR SCHEDULE",
        title: "Personalized Profession Online Tutor on Your Schedule",
        subtitle:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Necessitatibus atque voluptas labore nemo ipsam voluptatum maxime facere hic, eum illo, nobis inventore asperiores eaque exercitationem maiores laboriosam accusantium nihil quaerat.",
        link: "#",
    },
];

const New = () => {
    return (
        <>      <h1 className="text-xl lg:text-2xl font-semibold capitalize flex justify-center pb-8">
            Announcement
        </h1>
            <div className="bg-white flex justify-center">
                <div className="container space-y-10">
                    {NewData.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-2 space-y-6 md:space-y-0"
                        >
                            <div
                                className={`flex justify-start items-center ${index % 2 !== 0 && "md:order-last md:justify-end"
                                    }`}
                            >
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                    src={item.image}
                                    alt=""
                                    className="image w-[400px] h-full object-cover"
                                />
                            </div>
                            <div className="tag flex flex-col justify-center text-center md:text-left space-y-4 lg:max-w-[500px]">
                                <motion.p
                                    variants={SlideUp(0.5)}
                                    initial="hidden"
                                    whileInView={"visible"}
                                    className="text-sm text-orange-600 font-semibold capitalize"
                                >
                                    {item.tag}
                                </motion.p>
                                <motion.p
                                    variants={SlideUp(0.7)}
                                    initial="hidden"
                                    whileInView={"visible"}
                                    className="title text-xl lg:text-xl font-semibold capitalize"
                                >
                                    {item.title}
                                </motion.p>
                                <motion.p
                                    variants={SlideUp(0.9)}
                                    initial="hidden"
                                    whileInView={"visible"}
                                    className="subtitle text-sm text-slate-500"
                                >
                                    {item.subtitle}
                                </motion.p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default New;
