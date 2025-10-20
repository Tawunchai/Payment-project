import React, { useEffect, useMemo, useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { UpdateEmployeeProfile } from "../../../services";
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

  // ตรวจหน้าจอมือถือ เพื่อปรับตำแหน่งโมดอลไม่ให้ชิดบน
  const isMobile = useMemo(
    () => (typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false),
    []
  );

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
      destroyOnClose
      closable={false}
      centered={!isMobile}                   // เดสก์ท็อป centered, มือถือไม่ centered
      style={isMobile ? { top: 80 } : {}}    // มือถือยกลงจากขอบบน
      width={520}
      className="max-w-full md:max-w-[520px]"
      styles={{
        content: {
          borderRadius: 16,
          padding: 0,
          overflow: "hidden",
        },
        body: { padding: 0 },
      }}
    >
      {/* Header — EV blue minimal + safe-area */}
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
        <span style={{ fontWeight: 700, fontSize: 16 }}>แก้ไขประวัติส่วนตัว</span>
      </div>

      {/* Body */}
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
        <Form.Item
          label={<span className="text-[14px] font-semibold text-gray-700">ประวัติ (Bio)</span>}
          name="bio"
        >
          <Input.TextArea
            rows={3}
            placeholder="เขียนประวัติย่อของคุณ"
            className="rounded-lg text-[15px]"
          />
        </Form.Item>

        <Form.Item
          label={<span className="text-[14px] font-semibold text-gray-700">ประสบการณ์ (Experience)</span>}
          name="experience"
        >
          <Input placeholder="ระบุประสบการณ์การทำงาน" className="rounded-lg text-[15px]" />
        </Form.Item>

        <Form.Item
          label={<span className="text-[14px] font-semibold text-gray-700">การศึกษา (Education)</span>}
          name="education"
        >
          <Input placeholder="ระบุวุฒิการศึกษา" className="rounded-lg text-[15px]" />
        </Form.Item>

        <Form.Item
          label={<span className="text-[14px] font-semibold text-gray-700">เงินเดือน (Salary)</span>}
          name="salary"
        >
          <Input type="number" placeholder="กรอกเงินเดือน" className="rounded-lg text-[15px]" />
        </Form.Item>

        {/* Actions */}
        <div className="flex flex-col md:flex-row justify-end gap-3 mt-6">
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

export default EditEmployeeModal;
