import React from 'react'
import { Avatar, Button, Card, Col, Divider, message, Modal, Row, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";


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

    return (<>
        <div>User Page</div>
        <button onClick={handleLogout}>logout</button></>
    )
}

export default index