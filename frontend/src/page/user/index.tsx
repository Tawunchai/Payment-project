import Hero from "../../component/user/hero/hero";
import Value from "../../component/user/value/value";
import Header from "../../component/user/header/header";
import New from "../../component/user/new/new";
import NewMobile from "../../component/user/new/newmoblie";
import Review from "../../component/user/review/review";
import FooterMobile from "../../component/user/footer/footer"; 
import FooterDesktop from "../../component/user/footer/com/index";
import Car from "../../component/user/car/index";
import { useEffect, useRef, useState } from "react";
import "./user.css";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [breakpoint]);

  return isMobile;
}

const Index = () => {
  const valueRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  return (
    <div
      className="user"
      style={{
        paddingBottom: isMobile ? "calc(84px + env(safe-area-inset-bottom))" : 0,
      }}
    >
      <div>
        <Header
          scrollToValue={() => valueRef.current?.scrollIntoView({ behavior: "smooth" })}
          scrollToNew={() => newRef.current?.scrollIntoView({ behavior: "smooth" })}
        />
        <Hero scrollToValue={() => valueRef.current?.scrollIntoView({ behavior: "smooth" })} />
        <div className="white-gradient" />
      </div>

      {isMobile && <Car />}

      <div ref={valueRef}>
        <Value />
      </div>

      <div ref={newRef}>
        {isMobile ? <NewMobile /> : <New />}
      </div>

      <Review />
      <br />

      {/* ✅ เงื่อนไขการแสดงผล Footer */}
      {isMobile ? <FooterMobile /> : <FooterDesktop />}
    </div>
  );
};

export default Index;
