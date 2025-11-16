import { useState } from "react";
import { message } from "antd";
import { LoginInterface } from "../../interface/Login";
import { AddLogin, GetProfile } from "../../services/httpLogin";
import { CreateUser } from "../../services/index";
import { UsersInterface } from "../../interface/IUser";
import Logo_Login from "../../assets/car_login.svg";
import Logo_Regis from "../../assets/signup.svg";
import "./login.css";

function Login() {
  const [messageApi, contextHolder] = message.useMessage();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // sign up
  const [signUpUsername, setSignUpUsername] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpFirstName, setSignUpFirstName] = useState("");
  const [signUpLastName, setSignUpLastName] = useState("");
  const [signUpPhoneNumber, setSignUpPhoneNumber] = useState("");
  const [signUpGenderID, setSignUpGenderID] = useState<number | undefined>(undefined);

  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // ===========================
  // LOGIN
  // ===========================
  const clickLoginbt = async (datalogin: LoginInterface) => {
    const res = await AddLogin(datalogin);

    if (res.status !== 200) {
      return messageApi.warning("รหัสผ่านหรือข้อมูลผู้ใช้ไม่ถูกต้อง!! กรุณากรอกข้อมูลใหม่");
    }

    messageApi.success("เข้าสู่ระบบสำเร็จ");

    // โหลดข้อมูลโปรไฟล์จาก cookie โดยตรง
    const profile = await GetProfile();
    if (!profile || !profile.data) {
      messageApi.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
      return;
    }

    const role = profile.data.role;

    // 🔥 ส่ง event ไปให้ ConfigRoutes โหลด role ใหม่ทันที (แก้ปัญหาต้อง refresh)
    window.dispatchEvent(new Event("roleChange"));

    // Redirect ตาม role
    setTimeout(() => {
      if (role === "Admin") window.location.href = "/admin";
      else if (role === "User") window.location.href = "/user";
      else window.location.href = "/";
    }, 200);
  };

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      return messageApi.warning("กรุณากรอก Username และ Password ให้ครบ");
    }

    const data: LoginInterface = {
      username: username.trim(),
      password,
    };

    await clickLoginbt(data);
  };

  // ===========================
  // SIGN UP
  // ===========================
  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signUpUsername || !signUpEmail || !signUpPassword || signUpGenderID === undefined) {
      return messageApi.warning("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }

    const newUser: UsersInterface = {
      Username: signUpUsername.trim(),
      Email: signUpEmail.trim(),
      Password: signUpPassword,
      FirstName: signUpFirstName,
      LastName: signUpLastName,
      PhoneNumber: signUpPhoneNumber,
      Gender: { ID: signUpGenderID },
      UserRole: { ID: 2, RoleName: "User" },
      Profile: "",
    };

    const res = await CreateUser(newUser);

    if (res) {
      messageApi.success("สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ");
      setIsSignUpMode(false);

      setSignUpUsername("");
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpFirstName("");
      setSignUpLastName("");
      setSignUpPhoneNumber("");
      setSignUpGenderID(undefined);
    } else {
      messageApi.error("สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className={`custom-container ${isSignUpMode ? "custom-sign-up-mode" : ""}`}>
      {contextHolder}

      <div className="custom-forms-container">
        <div className="custom-signin-signup">
          {/* LOGIN */}
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

            <button type="submit" className="custom-btn">Login</button>
          </form>

          {/* SIGN UP */}
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
                <option value="" disabled>Select Gender</option>
                <option value={1}>Male</option>
                <option value={2}>Female</option>
              </select>
            </div>

            <button type="submit" className="custom-btn">Sign up</button>
          </form>
        </div>
      </div>

      <div className="custom-panels-container">
        <div className="custom-panel custom-left-panel">
          <div className="custom-content">
            <h3>New here?</h3>
            <p>Welcome to our EV Station</p>
            <button className="custom-btn transparent" onClick={() => setIsSignUpMode(true)}>
              Sign up
            </button>
          </div>
          <img src={Logo_Login} className="custom-image" alt="login" />
        </div>

        <div className="custom-panel custom-right-panel">
          <div className="custom-content">
            <h3>Already a member?</h3>
            <button className="custom-btn transparent" onClick={() => setIsSignUpMode(false)}>
              Sign in
            </button>
          </div>
          <img src={Logo_Regis} className="custom-image" alt="register" />
        </div>
      </div>
    </div>
  );
}

export default Login;
