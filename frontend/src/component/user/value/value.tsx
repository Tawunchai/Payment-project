import "./value.css";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";
import "react-accessible-accordion/dist/fancy-example.css";
import { MdOutlineArrowDropDown } from "react-icons/md";
import { useEffect, useState } from "react";
import { ListGetStarted } from "../../../services/index";
import { GetstartedInterface } from "../../../interface/IGetstarted";
import Value1 from "../../../assets/picture/getStart_car_logo.jpg";
import defaultData from "../../../utils/accordion"; 

const Value = () => {
  const [getStartedData, setGetStartedData] = useState<GetstartedInterface[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await ListGetStarted();
      if (res) {
        setGetStartedData(res);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="v-wrapper">
      <div className="paddings innerWidth flexCenter v-container">
        <div className="v-left">
          <div className="image-container">
            <img src={Value1} alt="value" />
          </div>
        </div>

        <div className="flexColStart v-right">
          <span className="orangeText">Our Value</span>
          <span className="primaryText">Value We Give to You</span>
          <span className="secondaryText">
            We always ready to help by providing the best services for you. <br />
            We believe a good place to live can make your life better.
          </span>

          <Accordion
            className="accordion"
            allowMultipleExpanded={false}
            preExpanded={[0]}
            style={{ border: "none" }}
          >
            {getStartedData.map((item, i) => (
              <AccordionItem className="accordionItem" key={item.ID} uuid={i}>
                <AccordionItemHeading>
                  <AccordionItemButton className="flexCenter accordionButton">
                    <AccordionItemState>
                      {({ expanded }) => (
                        <>
                          <div className={`flexCenter icon ${expanded ? "expanded" : "collapsed"}`}>
                            {/* ใช้ icon เดิมตาม index */}
                            {defaultData[i % defaultData.length].icon}
                          </div>
                          <span className="primaryText">{item.Title}</span>
                          <div className="flexCenter icon">
                            <MdOutlineArrowDropDown size={20} />
                          </div>
                        </>
                      )}
                    </AccordionItemState>
                  </AccordionItemButton>
                </AccordionItemHeading>

                <AccordionItemPanel>
                  <p className="secondaryText">{item.Description}</p>
                </AccordionItemPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default Value;
