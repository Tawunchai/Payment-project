import { message } from "antd";
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

    return (
        <div>   
            <p>admin page</p>
            <button onClick={handleLogout}>logout</button>
        </div>
    )
}

export default index