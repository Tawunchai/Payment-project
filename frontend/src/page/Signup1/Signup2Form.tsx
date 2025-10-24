import React, { useEffect, useState } from "react";
import { Button, Form, Input, Select, message, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { FaBolt } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { ListGenders, CreateUser } from "../../services";
import { SendOTP } from "../../services/httpLogin"; 
import OTPModal from "./otp/index"; 
import { currentYear } from "./data";
import Background from "../../assets/woman-charging-electro-car-by-her-house.jpg";

const Signup2Form: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [genderOptions, setGenderOptions] = useState<{ ID: number; Name: string }[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // โหลดข้อมูลเพศ
  useEffect(() => {
    const fetchGenders = async () => {
      const res = await ListGenders();
      if (res) {
        const mapped = res.map((g: any) => ({ ID: g.ID ?? 0, Name: g.Gender ?? "" }));
        setGenderOptions(mapped);
      }
    };
    fetchGenders();
  }, []);

  const onChange = ({ fileList: newFileList }: any) => setFileList(newFileList);

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src as string);
    imgWindow?.document.write(`<img src="${src}" style="max-width:100%;" />`);
  };

  // ========================= ส่ง OTP ก่อนสมัคร =========================
  const onFinish = async (values: any) => {
    if (fileList.length === 0) {
      messageApi.error("กรุณาอัปโหลดรูปภาพก่อนสมัคร");
      return;
    }

    try {
      setLoading(true);
      await SendOTP(values.email);
      setPendingValues(values);
      setOtpModalOpen(true);
      messageApi.info("รหัส OTP ถูกส่งไปยังอีเมลของคุณแล้ว");
    } catch (err) {
      messageApi.error("ส่ง OTP ไม่สำเร็จ โปรดลองอีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  // ========================= สมัครจริงหลังยืนยัน OTP =========================
  const handleOTPVerified = async () => {
    const values = pendingValues;
    if (!values) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("firstname", values.firstname || "");
    formData.append("lastname", values.lastname || "");
    formData.append("phone", values.phone || "");
    formData.append("gender", values.gender);
    formData.append("userRoleID", "3");
    formData.append("profile", fileList[0].originFileObj);

    try {
      const res = await CreateUser(formData);
      if (res) {
        messageApi.success("สมัครสมาชิกสำเร็จ!");
        navigate("/auth/login-2");
      } else {
        messageApi.error("สมัครไม่สำเร็จ");
      }
    } catch {
      messageApi.error("เกิดข้อผิดพลาดในการสมัคร");
    } finally {
      setLoading(false);
      setOtpModalOpen(false);
    }
  };

  // ======================================================================
  return (
    <>
      {contextHolder}

      <div className="relative min-h-dvh flex items-start justify-center px-4 py-6 md:py-5 overflow-hidden">
        {/* BG */}
        <div className="absolute inset-0 -z-10">
          <img src={Background} alt="" className="w-full h-full object-cover" loading="eager" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-900/60 via-slate-900/35 to-blue-950/60" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] mix-blend-overlay"
          style={{
            backgroundImage:
              "linear-gradient(#0b12261a 1px, transparent 1px), linear-gradient(90deg, #0b12261a 1px, transparent 1px)",
            backgroundSize: "36px 36px, 36px 36px",
          }}
        />

        {/* Card */}
        <div className="relative w-full max-w-[900px] md:-mt-2">
          <div
            className="rounded-[24px] p-[1px]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(37,99,235,0.30), rgba(56,189,248,0.18), rgba(99,102,241,0.24), rgba(37,99,235,0.30))",
            }}
          >
            <div className="rounded-[22px] bg-white border border-gray-200 shadow-[0_16px_44px_rgba(2,6,23,0.16)] p-6 md:p-7">
              {/* Header */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow">
                  <FaBolt className="text-lg" />
                </span>
                <div className="leading-tight text-center">
                  <h1
                    className="text-xl md:text-2xl font-extrabold tracking-tight"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, #1e40af, #2563eb, #06b6d4, #22c55e, #2563eb)",
                      backgroundSize: "220% 100%",
                      backgroundPosition: "0% 50%",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                      animation: "evTextShine 6s ease-in-out infinite",
                    }}
                  >
                    EV Station
                  </h1>
                  <p className="text-[12px] text-blue-700/70 font-medium">
                    Drive • Charge • Future
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="h-[2px] w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full w-1/3 bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-400 animate-barSlide rounded-full" />
                </div>
              </div>

              {/* FORM */}
              <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                encType="multipart/form-data"
                disabled={loading}
                className="form-compact"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* LEFT */}
                  <div className="md:col-span-4">
                    <Form.Item
                      label={<span className="text-sm text-gray-700">Profile Picture</span>}
                      name="profile"
                      valuePropName="fileList"
                      getValueFromEvent={({ fileList }: any) => fileList}
                      className="mb-2 ml-24"
                      rules={[
                        {
                          validator: () =>
                            fileList.length > 0
                              ? Promise.resolve()
                              : Promise.reject(new Error("กรุณาอัปโหลดรูป")),
                        },
                      ]}
                    >
                      <ImgCrop rotationSlider>
                        <Upload
                          fileList={fileList}
                          onChange={onChange}
                          onPreview={onPreview}
                          beforeUpload={(file) => {
                            const isImage = file.type.startsWith("image/");
                            if (!isImage) {
                              messageApi.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                              return Upload.LIST_IGNORE;
                            }
                            setFileList([file]);
                            return false;
                          }}
                          maxCount={1}
                          listType="picture-card"
                          className="w-full signup-upload-balanced"
                        >
                          {fileList.length < 1 && (
                            <div className="text-center">
                              <PlusOutlined style={{ fontSize: 26 }} />
                              <div className="mt-1 text-sm">Upload</div>
                            </div>
                          )}
                        </Upload>
                      </ImgCrop>
                    </Form.Item>

                    <Form.Item
                      name="gender"
                      label={<span className="text-sm text-gray-700">Gender</span>}
                      rules={[{ required: true, message: "กรุณาเลือกเพศ" }]}
                      className="mb-5 md:mt-[39px]"
                    >
                      <Select placeholder="Select Gender" size="middle" className="!rounded-xl">
                        {genderOptions.map((g) => (
                          <Select.Option key={g.ID} value={g.ID}>
                            {g.Name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <div className="text-[11px] text-gray-500 leading-tight">
                      แนะนำ: ใช้รูปหน้าตรง เห็นใบหน้าชัดเจน
                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="md:col-span-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <Form.Item
                        name="username"
                        label={<span className="text-sm text-gray-700">Username</span>}
                        rules={[{ required: true, message: "กรุณากรอกชื่อผู้ใช้" }]}
                        className="md:col-span-6"
                      >
                        <Input placeholder="Username" size="middle" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="email"
                        label={<span className="text-sm text-gray-700">Email</span>}
                        rules={[
                          { required: true, message: "กรุณากรอกอีเมล" },
                          { type: "email", message: "กรุณาใส่อีเมลที่ถูกต้อง" },
                        ]}
                        className="md:col-span-6"
                      >
                        <Input placeholder="Email" size="middle" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="password"
                        label={<span className="text-sm text-gray-700">Password</span>}
                        rules={[{ required: true, message: "กรุณากรอกรหัสผ่าน" }]}
                        className="md:col-span-6"
                      >
                        <Input.Password placeholder="Password" size="middle" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="phone"
                        label={<span className="text-sm text-gray-700">Phone</span>}
                        rules={[
                          { required: true, message: "กรุณากรอกเบอร์โทรศัพท์" },
                          { pattern: /^0\d{9}$/, message: "เบอร์โทรต้องเป็นเลข 10 ตัว" },
                        ]}
                        className="md:col-span-6"
                      >
                        <Input placeholder="0XXXXXXXXX" size="middle" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="firstname"
                        label={<span className="text-sm text-gray-700">First Name</span>}
                        rules={[{ required: true, message: "กรุณากรอกชื่อ" }]}
                        className="md:col-span-6"
                      >
                        <Input placeholder="First Name" size="middle" className="rounded-xl" />
                      </Form.Item>

                      <Form.Item
                        name="lastname"
                        label={<span className="text-sm text-gray-700">Last Name</span>}
                        rules={[{ required: true, message: "กรุณากรอกนามสกุล" }]}
                        className="md:col-span-6"
                      >
                        <Input placeholder="Last Name" size="middle" className="rounded-xl" />
                      </Form.Item>
                    </div>

                    <Form.Item className="mt-1">
                      <Button
                        block
                        type="primary"
                        htmlType="submit"
                        size="middle"
                        loading={loading}
                        disabled={loading}
                        className="!h-11 !rounded-xl !bg-blue-600 hover:!bg-blue-700 font-medium"
                      >
                        {loading ? "กำลังสมัคร..." : "Sign up"}
                      </Button>
                    </Form.Item>

                    <div className="mt-1 text-sm text-center text-gray-600">
                      มีบัญชีอยู่แล้ว?{" "}
                      <Link to="/auth/login-2" className="text-blue-600 hover:underline">
                        เข้าสู่ระบบ
                      </Link>
                    </div>

                    <p className="mt-4 text-center text-[11px] text-gray-500">
                      © EV Station {currentYear}
                    </p>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ เรียก Modal OTP */}
      <OTPModal
        open={otpModalOpen}
        email={pendingValues?.email || ""}
        onSuccess={handleOTPVerified}
        onCancel={() => setOtpModalOpen(false)}
      />

      {/* Animations */}
      <style>{`
        @keyframes evTextShine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes barSlide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(30%); }
          100% { transform: translateX(110%); }
        }
        .animate-barSlide { animation: barSlide 2.4s ease-in-out infinite; }
        .form-compact .ant-form-item { margin-bottom: 12px; }
        .form-compact .ant-form-item-label > label { font-size: 12px; }
        .signup-upload-balanced .ant-upload-select-picture-card {
          width: 220px !important;
          height: 220px !important;
          border-radius: 14px;
        }
      `}</style>
    </>
  );
};

export default Signup2Form;
