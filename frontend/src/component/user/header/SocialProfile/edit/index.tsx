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
} from "../../../../../services";
import { UsersInterface } from "../../../../../interface/IUser";
import { GendersInterface } from "../../../../../interface/IGender";
import { getCurrentUser, initUserProfile } from "../../../../../services/httpLogin"; // ✅ เพิ่มบรรทัดนี้

const { Option } = Select;

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialData: UsersInterface;
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

  // ตรวจจับขนาดหน้าจอมือถือ
  const isMobile = useMemo(
    () => window.matchMedia("(max-width: 768px)").matches,
    []
  );

  // โหลดรายการเพศ
  useEffect(() => {
    const fetchGenders = async () => {
      const res = await ListGenders();
      if (res) setGenders(res);
    };
    fetchGenders();
  }, []);

  // ✅ ตั้งค่าข้อมูลเริ่มต้นจาก initialData
  useEffect(() => {
    if (!show || !initialData) return;

    form.setFieldsValue({
      username: initialData.Username,
      email: initialData.Email,
      firstname: initialData.FirstName,
      lastname: initialData.LastName,
      phone: initialData.PhoneNumber,
      gender: initialData.Gender?.ID,
    });

    if (initialData.Profile) {
      setFileList([
        {
          uid: "-1",
          name: "profile.png",
          status: "done",
          url: `${apiUrlPicture}${initialData.Profile}`,
        },
      ]);
    } else {
      setFileList([]);
    }
  }, [show, initialData, form]);

  // อัปโหลดรูป
  const onChangeUpload = ({ fileList: newList }: any) => setFileList(newList);

  // ✅ เมื่อบันทึก
  const onFinish = async (values: any) => {
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

    let current = getCurrentUser();
    if (!current) current = await initUserProfile();

    const userID = current?.id;
    if (!userID) {
      message.error("ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบใหม่");
      setLoading(false);
      return;
    }

    const res = await UpdateUserProfileByID(Number(userID), formData);
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
      style={
        isMobile
          ? { top: 24, paddingBottom: "env(safe-area-inset-bottom)" }
          : {}
      }
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
        body: {
          padding: 0,
        },
      }}
    >
      {/* Header EV blue gradient */}
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

      {/* ฟอร์มหลัก */}
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="px-5 md:px-7 pt-4 pb-6"
        style={{
          maxHeight: isMobile ? "70vh" : "75vh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
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
                  message.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
                  return Upload.LIST_IGNORE;
                }
                setFileList([file]);
                return false;
              }}
              maxCount={1}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: true }}
            >
              {fileList.length < 1 && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "#2563eb",
                  }}
                >
                  <PlusOutlined style={{ fontSize: 28 }} />
                  <div style={{ marginTop: 6, fontSize: 12 }}>อัปโหลดรูป</div>
                </div>
              )}
            </Upload>
          </ImgCrop>
        </div>

        {/* Fields */}
        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <Form.Item label="ชื่อผู้ใช้ (Username)" name="username">
              <Input
                placeholder="กรอกชื่อผู้ใช้"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="อีเมล (Email)" name="email">
              <Input
                type="email"
                placeholder="กรอกอีเมล"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <Form.Item label="ชื่อจริง (Firstname)" name="firstname">
              <Input
                placeholder="กรอกชื่อจริง"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="นามสกุล (Lastname)" name="lastname">
              <Input
                placeholder="กรอกนามสกุล"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[12, 8]}>
          <Col xs={24} md={12}>
            <Form.Item label="เบอร์โทรศัพท์ (Phone)" name="phone">
              <Input
                placeholder="กรอกเบอร์โทรศัพท์"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="เพศ (Gender)" name="gender">
              <Select
                placeholder="เลือกเพศ"
                size="large"
                className="rounded-lg"
              >
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
              boxShadow: "0 8px 20px rgba(37,99,235,0.25)",
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
