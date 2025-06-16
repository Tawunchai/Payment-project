import Hero from "../../component/hero/hero"
import Value from "../../component/value/value"
import Header from "../../component/header/header"
import New from "../../component/new/new"
import Review from "../../component/review/review"
import Type from "../../component/type/type"
import Footer from "../../component/footer/footer"
import { useRef } from "react";
import "../../App.css"


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