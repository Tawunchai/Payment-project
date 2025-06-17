import { useState, useEffect } from "react";
import { message } from "antd";
import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetEmployeeByUserID } from "../../services/httpLogin";
import Logo_Login from "../../assets/car_login.svg";
import Logo_Regis from "../../assets/signup.svg";
import "./login.css";

function Login() {
  const [messageApi, contextHolder] = message.useMessage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  const clickLoginbt = async (datalogin: LoginInterface) => {
    const res = await AddLogin(datalogin);

    if (res.status === 200) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("token_type", res.data.token_type);
      localStorage.setItem("isLogin", "true");
      localStorage.setItem("roleName", res.data.UserRole.RoleName);
      localStorage.setItem("userid", res.data.UserID);
      localStorage.setItem("firstnameuser", res.data.FirstNameUser);
      localStorage.setItem("lastnameuser", res.data.LastNameUser);

      const RoleName = localStorage.getItem("roleName");
      const userID = localStorage.getItem("userid");

      if (userID && RoleName !== "User") {
        try {
          const employeeID = await GetEmployeeByUserID(Number(userID));
          if (employeeID != null) {
            localStorage.setItem("employeeid", employeeID.toString());
          }
        } catch (error) {
          console.error("Failed to fetch EmployeeID:", error);
        }
      }

      messageApi.success(`ท่านได้ทำการ เข้าสู่ระบบ ${RoleName} สำเร็จ`);

      setTimeout(() => {
        if (RoleName === "Admin") window.location.href = "/admin";
        else if (RoleName === "User") window.location.href = "/user";
      }, 100);
    } else {
      messageApi.open({
        type: "warning",
        content: "รหัสผ่านหรือข้อมูลผู้ใช้ไม่ถูกต้อง!! กรุณากรอกข้อมูลใหม่",
      });
    }
  };

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      messageApi.warning("กรุณากรอก Username และ Password ให้ครบ");
      return;
    }

    const datalogin: LoginInterface = {
      username: username.trim(),
      password,
    };

    await clickLoginbt(datalogin);
  };

  // Toggle SignUp mode
  useEffect(() => {
    // No longer use direct DOM event listeners
    // Just control mode with React state below
  }, []);

  return (
    <div className={`custom-container ${isSignUpMode ? "custom-sign-up-mode" : ""}`}>
      {contextHolder}

      <div className="custom-forms-container">
        <div className="custom-signin-signup">
          {/* Sign In Form */}
          <form onSubmit={handleSubmitSignIn} className="custom-sign-in-form">
            <h2 className="custom-title">Sign in</h2>

            <div className="custom-input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="custom-btn">
              Login
            </button>
            <p className="custom-social-text">Welcome To My Website</p>
          </form>

          {/* Sign Up Form (ยังไม่ทำงานจริง) */}
          <form className="custom-sign-up-form">
            <h2 className="custom-title">Sign up</h2>

            <div className="custom-input-field">
              <i className="fas fa-user"></i>
              <input type="text" placeholder="Username" />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-envelope"></i>
              <input type="email" placeholder="Email" />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-lock"></i>
              <input type="password" placeholder="Password" />
            </div>

            <button type="submit" className="custom-btn">
              Sign up
            </button>
            <p className="custom-social-text">Welcome To My Website</p>
          </form>
        </div>
      </div>

      <div className="custom-panels-container">
        <div className="custom-panel custom-left-panel">
          <div className="custom-content">
            <h3>New here ?</h3>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Debitis,
              ex ratione. Aliquid!
            </p>
            <button
              className="custom-btn transparent"
              onClick={() => setIsSignUpMode(true)}
              id="sign-up-btn"
              type="button"
            >
              Sign up
            </button>
          </div>
          <img src={Logo_Login} className="custom-image" alt="login img" />
        </div>

        <div className="custom-panel custom-right-panel">
          <div className="custom-content">
            <h3>One of us ?</h3>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
              laboriosam ad deleniti.
            </p>
            <button
              className="custom-btn transparent"
              onClick={() => setIsSignUpMode(false)}
              id="sign-in-btn"
              type="button"
            >
              Sign in
            </button>
          </div>
          <img src={Logo_Regis} className="custom-image" alt="register img" />
        </div>
      </div>
    </div>
  );
}

export default Login;
