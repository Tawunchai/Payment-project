import React, { useState, useEffect } from "react";
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
} from "../../../services"; // ✅ เพิ่ม ListGenders
import { EmployeeInterface } from "../../../interface/IEmployee";
import { GendersInterface } from "../../../interface/IGender"; // ✅ interface ของ gender

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
    const [genders, setGenders] = useState<GendersInterface[]>([]); // ✅ state เก็บ gender ทั้งหมด

    // 📌 โหลดเพศทั้งหมดจาก backend
    useEffect(() => {
        const fetchGenders = async () => {
            const res = await ListGenders();
            if (res) setGenders(res);
        };
        fetchGenders();
    }, []);

    // 📌 ตั้งค่าเริ่มต้นของฟอร์ม
    useEffect(() => {
        if (show) {
            form.setFieldsValue({
                username: initialData?.User?.Username,
                email: initialData?.User?.Email,
                firstname: initialData?.User?.FirstName,
                lastname: initialData?.User?.LastName,
                phone: initialData?.User?.PhoneNumber,
                gender: initialData?.User?.Gender?.ID,
            });

            if (initialData?.User?.Profile) {
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
        }
    }, [show, initialData, form]);

    const onChange = ({ fileList: newFileList }: any) => setFileList(newFileList);

    // 📤 ส่งข้อมูลไป backend
    // 📤 ส่งข้อมูลไป backend
    const onFinish = async (values: any) => {
        setLoading(true);

        const formData = new FormData();
        formData.append("username", values.username || "");
        formData.append("email", values.email || "");
        formData.append("firstname", values.firstname || "");
        formData.append("lastname", values.lastname || "");
        formData.append("phone", values.phone || "");
        formData.append("gender", values.gender || ""); // ✅ ส่ง gender ID

        if (fileList.length > 0 && fileList[0].originFileObj) {
            formData.append("profile", fileList[0].originFileObj);
        }

        // ✅ ดึง userID จาก localStorage แทนการใช้ initialData.ID
        const userID = localStorage.getItem("userid");
        if (!userID) {
            message.error("ไม่พบข้อมูลผู้ใช้ในระบบ กรุณาเข้าสู่ระบบใหม่อีกครั้ง");
            setLoading(false);
            return;
        }

        // ✅ เรียก service ด้วย userID จาก localStorage
        const res = await UpdateUserProfileByID(Number(userID), formData);
        setLoading(false);

        if (res) {
            message.success("อัปเดตข้อมูลผู้ใช้สำเร็จ");
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
            width={600}
            className="max-w-full md:max-w-[600px]"
        >
            {/* 🟧 Header ไล่สีส้ม */}
            <div
                className="text-center text-lg font-bold text-white py-4 rounded-t-2xl flex items-center justify-center gap-2"
                style={{
                    background: "linear-gradient(90deg, #f97316 0%, #f59e0b 100%)",
                }}
            >
                <EditOutlined className="text-2xl" />
                <span>แก้ไขโปรไฟล์ผู้ใช้</span>
            </div>

            {/* 🧾 ฟอร์มข้อมูล */}
            <Form
                layout="vertical"
                form={form}
                onFinish={onFinish}
                className="px-6 md:px-8 pt-3 pb-6"
                style={{ maxHeight: "80vh", overflowY: "auto" }}
            >
                {/* อัปโหลดรูป */}
                <div className="flex justify-center mb-5">
                    <ImgCrop rotationSlider>
                        <Upload
                            listType="picture-circle"
                            fileList={fileList}
                            onChange={onChange}
                            beforeUpload={(file) => {
                                const isImage = file.type.startsWith("image/");
                                if (!isImage) {
                                    message.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
                                    return Upload.LIST_IGNORE;
                                }
                                setFileList([file]);
                                return false;
                            }}
                            maxCount={1}
                            showUploadList={{
                                showPreviewIcon: true,
                                showRemoveIcon: true,
                            }}
                        >
                            {fileList.length < 1 && (
                                <div className="flex flex-col items-center text-orange-500">
                                    <PlusOutlined style={{ fontSize: 30 }} />
                                    <div>อัปโหลดรูป</div>
                                </div>
                            )}
                        </Upload>
                    </ImgCrop>
                </div>

                {/* ✅ 2 คอลัมน์ Username / Email */}
                <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                        <Form.Item label="ชื่อผู้ใช้ (Username)" name="username">
                            <Input placeholder="กรอกชื่อผู้ใช้" className="rounded-md" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="อีเมล (Email)" name="email">
                            <Input
                                type="email"
                                placeholder="กรอกอีเมล"
                                className="rounded-md"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* ✅ 2 คอลัมน์ Firstname / Lastname */}
                <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                        <Form.Item label="ชื่อจริง (Firstname)" name="firstname">
                            <Input placeholder="กรอกชื่อจริง" className="rounded-md" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="นามสกุล (Lastname)" name="lastname">
                            <Input placeholder="กรอกนามสกุล" className="rounded-md" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* ✅ 2 คอลัมน์ Phone / Gender */}
                <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                        <Form.Item label="เบอร์โทรศัพท์ (Phone)" name="phone">
                            <Input placeholder="กรอกเบอร์โทรศัพท์" className="rounded-md" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item label="เพศ (Gender)" name="gender">
                            <Select placeholder="เลือกเพศ">
                                {genders.map((g) => (
                                    <Option key={g.ID} value={g.ID}>
                                        {g.Gender}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* ปุ่ม action */}
                <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 mt-6">
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

export default EditUserModal;
