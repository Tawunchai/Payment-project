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
            <div className="bg-white flex justify-center ml-8 mr-8">
                <div className="container space-y-6">
                    {NewData.map((item, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 md:grid-cols-2 gap-10 justify-items-center"
                        >
                            <div
                                className={`flex justify-center items-center w-full ${index % 2 !== 0 ? "md:order-last" : ""
                                    }`}
                            >
                                <motion.img
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                                    src={item.image}
                                    alt=""
                                    className={`image h-full object-cover w-[400px]`}
                                />
                            </div>

                            <div
                                className={`tag flex flex-col justify-center space-y-4 lg:max-w-[500px] ${index % 2 !== 0 ? "text-right md:text-right" : "text-left md:text-left"
                                    }`}
                            >
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
