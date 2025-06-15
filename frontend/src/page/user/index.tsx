import React from 'react'
import { Avatar, Button, Card, Col, Divider, message, Modal, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import Hero from "../../component/hero/hero"
import Header from "../../component/header/header"
import Review from "../../component/review/review"
import Type from "../../component/type/type"
import Footer from "../../component/footer/footer"


const index = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("userRole");
        localStorage.clear();

        message.success("ออกจากระบบ");

        setTimeout(() => {
            navigate("/login");
        }, 3500);
    };

    return (
        <div className='App'>
            <div>
                <Header />
                <Hero />
                <div className='white-gradient'/>
            </div>
            <Type/>
            <Review/>
            <Footer/>
        </div>
    )
}

export default index