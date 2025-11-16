import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Row,
  Col,
} from "antd";
import ImgCrop from "antd-img-crop";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import {
  UpdateUserProfileByID,
  apiUrlPicture,
  ListGenders,
  ListUsers, // ✅ เพิ่มมาใช้งาน
} from "../../../services";
import { EmployeeInterface } from "../../../interface/IEmployee";
import { GendersInterface } from "../../../interface/IGender";
import { getCurrentUser, initUserProfile } from "../../../services/httpLogin";

const { Option } = Select;

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialData: EmployeeInterface;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  show,
  onClose,
  onSaveSuccess,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);
  const [genders, setGenders] = useState<GendersInterface[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]); // ✅ users ทั้งระบบ

  // Detect mobile
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 768px)").matches,
    []
  );

  // Load genders + users
  useEffect(() => {
    const loadData = async () => {
      const g = await ListGenders();
      if (g) setGenders(g);

      const u = await ListUsers();
      if (u) setUsers(u);
    };
    loadData();
  }, []);

  // Load userId from token
  useEffect(() => {
    const loadUser = async () => {
      try {
        await initUserProfile();
        const current = getCurrentUser();
        if (!current || !current.id) {
          message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
          return;
        }
        setUserId(current.id);
      } catch (err) {
        message.error("เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้");
      }
    };
    loadUser();
  }, []);

  // Pre-fill form
  useEffect(() => {
    if (!show || !initialData) return;

    form.setFieldsValue({
      username: initialData?.User?.Username,
      email: initialData?.User?.Email,
      firstname: initialData?.User?.FirstName,
      lastname: initialData?.User?.LastName,
      phone: initialData?.User?.PhoneNumber,
      gender: initialData?.User?.Gender?.ID,
    });

    if (initialData.User?.Profile) {
      setFileList([
        {
          uid: "-1",
          name: "profile.png",
          status: "done",
          url: `${apiUrlPicture}${initialData.User.Profile}`,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [show, initialData, form]);

  // Upload
  const onChangeUpload = ({ fileList: newList }: any) =>
    setFileList(newList);

  // ============================================================
  // 🔥 ตรวจสอบค่าซ้ำ (username / email / phone)
  // ============================================================
  const isDuplicate = (field: string, value: string) => {
    if (!value) return false;

    return users.some(
      (u) =>
        u.ID !== userId && // ❗ ต้องไม่เทียบกับ user คนปัจจุบัน
        String(u[field]).trim().toLowerCase() ===
        value.trim().toLowerCase()
    );
  };

  // Submit update
  const onFinish = async (values: any) => {
    if (!userId) {
      message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      return;
    }

    // ตรวจสอบค่าซ้ำ
    const errors: any = {};

    if (isDuplicate("Username", values.username))
      errors.username = "ชื่อผู้ใช้นี้ถูกใช้แล้ว";

    if (isDuplicate("Email", values.email))
      errors.email = "อีเมลนี้ถูกใช้แล้ว";

    if (isDuplicate("PhoneNumber", values.phone))
      errors.phone = "เบอร์โทรนี้ถูกใช้แล้ว";

    if (Object.keys(errors).length > 0) {
      form.setFields(
        Object.entries(errors).map(([name, err]) => ({
          name,
          errors: [err as string],
        }))
      );
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("username", values.username || "");
    formData.append("email", values.email || "");
    formData.append("firstname", values.firstname || "");
    formData.append("lastname", values.lastname || "");
    formData.append("phone", values.phone || "");
    formData.append("gender", values.gender || "");

    if (fileList.length > 0 && fileList[0].originFileObj) {
      formData.append("profile", fileList[0].originFileObj);
    }

    const res = await UpdateUserProfileByID(userId, formData);
    setLoading(false);

    if (res) {
      message.success("อัปเดตข้อมูลสำเร็จ");
      onSaveSuccess();
      onClose();
    } else {
      message.error("อัปเดตข้อมูลไม่สำเร็จ");
    }
  };

  if (!show) return null;

  return (
    <Modal
      open={show}
      onCancel={onClose}
      footer={null}
      centered={!isMobile}
      style={isMobile ? { top: 24 } : {}}
      destroyOnClose
      closable={false}
      width={600}
      className="max-w-full md:max-w-[600px]"
      styles={{
        content: {
          borderRadius: 16,
          padding: 0,
          overflow: "hidden",
          marginTop: isMobile ? 60 : undefined,
        },
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center gap-2 text-white"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
          paddingTop: "calc(env(safe-area-inset-top) + 8px)",
          height: 56,
        }}
      >
        <EditOutlined style={{ fontSize: 20 }} />
        <span style={{ fontWeight: 700, fontSize: 16 }}>
          แก้ไขโปรไฟล์ผู้ใช้
        </span>
      </div>

      {/* Form */}
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="px-5 md:px-7 pt-4 pb-6"
        style={{
          maxHeight: isMobile ? "70vh" : "75vh",
          overflowY: "auto",
        }}
      >
        {/* Upload */}
        <div className="flex justify-center mb-6">
          <ImgCrop rotationSlider>
            <Upload
              listType="picture-circle"
              fileList={fileList}
              onChange={onChangeUpload}
              beforeUpload={(file) => {
                if (!file.type.startsWith("image/")) {
                  message.error("กรุณาอัปโหลดรูปภาพเท่านั้น");
                  return Upload.LIST_IGNORE;
                }
                setFileList([file]);
                return false;
              }}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div className="flex flex-col items-center text-blue-600">
                  <PlusOutlined style={{ fontSize: 28 }} />
                  <div className="mt-1 text-xs">อัปโหลดรูป</div>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </div>

        {/* Fields */}
        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <Form.Item label="ชื่อผู้ใช้ (Username)" name="username">
              <Input size="large" className="rounded-lg" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="อีเมล (Email)" name="email">
              <Input size="large" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <Form.Item label="ชื่อจริง (Firstname)" name="firstname">
              <Input size="large" className="rounded-lg" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="นามสกุล (Lastname)" name="lastname">
              <Input size="large" className="rounded-lg" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <Form.Item label="เบอร์โทรศัพท์ (Phone)" name="phone">
              <Input size="large" className="rounded-lg" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item label="เพศ (Gender)" name="gender">
              <Select placeholder="เลือกเพศ" size="large" className="rounded-lg">
                {genders.map((g) => (
                  <Option key={g.ID} value={g.ID}>
                    {g.Gender}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Buttons */}
        <div className="mt-6 flex flex-col md:flex-row justify-end gap-3">
          <Button
            onClick={onClose}
            block={isMobile}
            style={{
              borderColor: "#2563eb",
              color: "#2563eb",
              height: 40,
              borderRadius: 10,
              fontWeight: 600,
            }}
          >
            ยกเลิก
          </Button>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block={isMobile}
            style={{
              background:
                "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(29,78,216,1) 100%)",
              border: "none",
              height: 40,
              borderRadius: 10,
              fontWeight: 700,
            }}
          >
            บันทึก
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditUserModal;