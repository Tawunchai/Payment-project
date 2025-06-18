import { useState } from "react";
import { message } from "antd";
import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetEmployeeByUserID } from "../../services/httpLogin";
import { CreateUser } from "../../services/index";  
import { UsersInterface } from "../../interface/IUser";
import Logo_Login from "../../assets/car_login.svg";
import Logo_Regis from "../../assets/signup.svg";
import "./login.css";

function Login() {
  const [messageApi, contextHolder] = message.useMessage();

  // Sign in state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Sign up states
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpFirstName, setSignUpFirstName] = useState("");
  const [signUpLastName, setSignUpLastName] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
  const [signUpGenderID, setSignUpGenderID] = useState<number | undefined>(undefined);

  // Toggle between sign in and sign up mode
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // --- Sign In Logic ---

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

  // --- Sign Up Logic ---

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !signUpUsername ||
      !signUpEmail ||
      !signUpPassword ||
      signUpGenderID === undefined
    ) {
      messageApi.warning("กรุณากรอกข้อมูลให้ครบทุกช่องที่จำเป็น");
      return;
    }

    // เตรียมข้อมูลตาม UsersInterface
    const newUser: UsersInterface = {
      Username: signUpUsername.trim(),
      Email: signUpEmail.trim(),
      Password: signUpPassword,
      FirstName: signUpFirstName,
      LastName: signUpLastName,
      Phonenumber: signUpPhoneNumber,
      GenderID: { ID: signUpGenderID },  // ตามที่ backend ต้องการ
      UserRoleID: { ID: 2, RoleName: "User" }, // กำหนด role เริ่มต้น
      Profile: "", // สามารถเพิ่มฟีลด์อัพโหลดภาพภายหลัง
    };

    const res = await CreateUser(newUser);

    if (res) {
      messageApi.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      setIsSignUpMode(false);
      // เคลียร์ฟอร์ม
      setSignUpUsername("");
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpFirstName("");
      setSignUpLastName("");
      setSignUpPhoneNumber("");
      setSignUpGenderID(undefined);
    } else {
      messageApi.error("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  };

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

          {/* Sign Up Form */}
          <form onSubmit={handleSubmitSignUp} className="custom-sign-up-form">
            <h2 className="custom-title">Sign up</h2>

            <div className="custom-input-field">
              <i className="fas fa-user"></i>
              <input
                type="text"
                placeholder="Username"
                value={signUpUsername}
                onChange={(e) => setSignUpUsername(e.target.value)}
                required
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                placeholder="Email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                required
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                placeholder="Password"
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                required
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-id-card"></i>
              <input
                type="text"
                placeholder="First Name"
                value={signUpFirstName}
                onChange={(e) => setSignUpFirstName(e.target.value)}
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-id-card"></i>
              <input
                type="text"
                placeholder="Last Name"
                value={signUpLastName}
                onChange={(e) => setSignUpLastName(e.target.value)}
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-phone"></i>
              <input
                type="text"
                placeholder="Phone Number"
                value={signUpPhoneNumber}
                onChange={(e) => setSignUpPhoneNumber(e.target.value)}
              />
            </div>

            <div className="custom-input-field">
              <i className="fas fa-venus-mars"></i>
              <select
                value={signUpGenderID || ""}
                onChange={(e) => setSignUpGenderID(Number(e.target.value))}
                required
              >
                <option value="" disabled>
                  Select Gender
                </option>
                <option value={1}>Male</option>
                <option value={2}>Female</option>
                {/* เพิ่มตามฐานข้อมูล Gender */}
              </select>
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
