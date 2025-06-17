import Hero from "../../component/user/hero/hero"
import Value from "../../component/user/value/value"
import Header from "../../component/user/header/header"
import New from "../../component/user/new/new"
import Review from "../../component/user/review/review"
import Type from "../../component/user/type/type"
import Footer from "../../component/user/footer/footer"
import { useRef } from "react";
import "./user.css"


const index = () => {
    const valueRef = useRef<HTMLDivElement>(null);
    const newRef = useRef<HTMLDivElement>(null);

    return (
        <div className='user'>
            <div>
                <Header scrollToValue={() => valueRef.current?.scrollIntoView({ behavior: "smooth" })}
                    scrollToNew={() => newRef.current?.scrollIntoView({ behavior: "smooth" })} />
                <Hero scrollToValue={() => valueRef.current?.scrollIntoView({ behavior: "smooth" })} />
                <div className='white-gradient' />
            </div>
            <Type />
            <div ref={valueRef}>
                <Value />
            </div>
            <div ref={newRef}>
                <New />
            </div>
            <Review />
            <Footer />
        </div>
    )
}


export default index