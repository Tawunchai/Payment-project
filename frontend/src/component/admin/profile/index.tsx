import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { UpdateEmployeeProfile } from "../../../services/index";
import { EmployeeInterface } from "../../../interface/IEmployee";

interface EditEmployeeModalProps {
  show: boolean;
  onClose: () => void;
  onSaveSuccess: () => void;
  initialData: EmployeeInterface;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  show,
  onClose,
  onSaveSuccess,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      form.setFieldsValue({
        bio: initialData?.Bio,
        experience: initialData?.Experience,
        education: initialData?.Education,
        salary: initialData?.Salary,
      });
    }
  }, [show, initialData, form]);

  const onFinish = async (values: any) => {
    setLoading(true);

    const formData = new FormData();
    formData.append("bio", values.bio || "");
    formData.append("experience", values.experience || "");
    formData.append("education", values.education || "");
    formData.append("salary", values.salary || "");

    const res = await UpdateEmployeeProfile(initialData.ID!, formData);
    setLoading(false);

    if (res) {
      message.success("อัปเดตข้อมูลพนักงานสำเร็จ");
      onSaveSuccess();
      onClose();
    } else {
      message.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    }
  };

  if (!show) return null;

  return (
    <Modal
      open={show}
      onCancel={onClose}
      footer={null}
      centered
      destroyOnClose
      closable={false}
      width={520}
      className="max-w-full md:max-w-[520px]"

    >
      {/* 🟧 Header ไล่สีส้ม */}
      <div
        className="text-center text-lg font-bold text-white py-4 rounded-t-2xl flex items-center justify-center gap-2"
        style={{
          background: "linear-gradient(90deg, #f97316 0%, #f59e0b 100%)",
        }}
      >
        <EditOutlined className="text-2xl" />
        <span>แก้ไขประวัติส่วนตัว</span>
      </div>

      {/* 🧾 ฟอร์มข้อมูล */}
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="px-6 md:px-8 pt-3 pb-6"
        style={{ maxHeight: "80vh", overflowY: "auto" }} // ป้องกันล้นจอมือถือ
      >
        <Form.Item
          label={
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>
              ประวัติ (Bio)
            </span>
          }
          name="bio"
        >
          <Input.TextArea
            rows={3}
            placeholder="เขียนประวัติย่อของคุณ"
            className="rounded-md text-[15px]"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>
              ประสบการณ์ (Experience)
            </span>
          }
          name="experience"
        >
          <Input
            placeholder="ระบุประสบการณ์การทำงาน"
            className="rounded-md text-[15px]"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>
              การศึกษา (Education)
            </span>
          }
          name="education"
        >
          <Input
            placeholder="ระบุวุฒิการศึกษา"
            className="rounded-md text-[15px]"
          />
        </Form.Item>

        <Form.Item
          label={
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#555" }}>
              เงินเดือน (Salary)
            </span>
          }
          name="salary"
        >
          <Input
            type="number"
            placeholder="กรอกเงินเดือน"
            className="rounded-md text-[15px]"
          />
        </Form.Item>

        {/* ปุ่ม action */}
        <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 mt-8">
          <Button
            onClick={onClose}
            block={window.innerWidth < 768}
            style={{
              borderColor: "#fb923c",
              color: "#fb923c",
              fontWeight: 500,
            }}
          >
            ยกเลิก
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block={window.innerWidth < 768}
            style={{
              background: "linear-gradient(to right, #f97316, #f59e0b)",
              border: "none",
              fontWeight: 500,
            }}
          >
            บันทึก
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EditEmployeeModal;
