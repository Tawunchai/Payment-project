import { useEffect, useMemo, useState } from "react";
import { message, Upload } from "antd";
import ImgCrop from "antd-img-crop";
import { PlusOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateNewsByID, apiUrlPicture } from "../../../../services";

const EditNews: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // รับค่าเริ่มต้นจากหน้าเดิม
  const {
    newsId,
    initialTitle = "",
    initialDescription = "",
    initialPicture = "",
  } = (location.state || {}) as {
    newsId?: number;
    initialTitle?: string;
    initialDescription?: string;
    initialPicture?: string;
  };

  // ถ้าไม่มี newsId ให้เด้งกลับ (กันเข้าตรง)
  useEffect(() => {
    if (!newsId) navigate("/admin/New");
  }, [newsId, navigate]);

  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [fileList, setFileList] = useState<any[]>(
    initialPicture
      ? [
          {
            uid: "-1",
            name: "current.jpg",
            status: "done",
            url: `${apiUrlPicture}${initialPicture}`,
          },
        ]
      : []
  );
  const [loading, setLoading] = useState(false);

  // preview url (รองรับทั้งรูปเดิมและรูปที่เพิ่งเลือก)
  const previewUrl = useMemo(() => {
    const f = fileList[0];
    if (!f) return "";
    if (f.url) return f.url;
    if (f.originFileObj) return URL.createObjectURL(f.originFileObj);
    return "";
  }, [fileList]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch {}
      }
    };
  }, [previewUrl]);

  const onChange = ({ fileList: newFileList }: any) => setFileList(newFileList);

  const onPreview = async (file: any) => {
    let src = file.url;
    if (!src && file.originFileObj) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    const imgWindow = window.open(src);
    imgWindow?.document.write(`<img src="${src}" style="max-width: 100%;" />`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsId) return;

    if (!title.trim() || !description.trim()) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());

    const hasNewImage = fileList.length > 0 && fileList[0].originFileObj;
    if (hasNewImage) {
      formData.append("picture", fileList[0].originFileObj);
    }

    try {
      setLoading(true);
      const ok = await UpdateNewsByID(newsId, formData);
      if (ok) {
        message.success("อัปเดตข่าวสำเร็จ");
        setTimeout(() => navigate("/admin/New"), 700);
      } else {
        message.error("อัปเดตข่าวล้มเหลว");
      }
    } catch {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f5f8ff_50%,#ffffff_100%)]">
      {/* Header */}
      <header
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-semibold tracking-wide">
            Edit News
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="h-9 px-3 rounded-lg bg-white/15 hover:bg-white/25 transition text-white text-sm font-medium"
          >
            กลับ
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left: Form */}
          <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 sm:p-6">
            <div className="mb-4">
              <p className="text-xs text-gray-500">News Management</p>
              <h2 className="text-xl font-bold text-blue-700">
                EV Station • Edit Post
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพข่าว
                </label>
                <ImgCrop rotationSlider>
                  <Upload
                    fileList={fileList}
                    onChange={onChange}
                    onPreview={onPreview}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        message.error("กรุณาอัปโหลดไฟล์รูปภาพ");
                        return Upload.LIST_IGNORE;
                      }
                      return false; // ไม่อัปโหลดอัตโนมัติ
                    }}
                    maxCount={1}
                    multiple={false}
                    listType="picture-card"
                  >
                    {fileList.length < 1 && (
                      <div>
                        <PlusOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    )}
                  </Upload>
                </ImgCrop>
                <p className="mt-2 text-[12px] text-gray-500">
                  รองรับไฟล์รูปภาพ .jpg .png .webp
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อข่าว
                </label>
                <input
                  className="w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm outline-none ring-0 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition"
                  name="Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="หัวข้อข่าวของคุณ…"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด
                </label>
                <textarea
                  name="Description"
                  className="w-full min-h-[160px] rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm outline-none ring-0 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="รายละเอียดข่าว/กิจกรรมของคุณ…"
                  required
                />
                <div className="mt-1 text-[12px] text-gray-400">
                  ผู้แก้ไข: admin@gmail.com
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 transition"
                >
                  {loading ? "กำลังบันทึก…" : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/admin/New")}
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 text-sm font-semibold transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>

          {/* Right: Live Preview */}
          <div className="rounded-2xl bg-white border border-blue-100 shadow-sm p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Live Preview</h3>
              <p className="text-xs text-gray-500">ดูตัวอย่างข่าวที่กำลังแก้ไข</p>
            </div>

            <div className="space-y-4">
              <div className="w-full aspect-[16/9] bg-blue-50/60 border border-blue-100 rounded-xl overflow-hidden grid place-items-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-blue-400 text-sm">ยังไม่มีรูปภาพ</span>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-bold text-gray-900">
                  {title || "หัวข้อข่าวของคุณจะปรากฏที่นี่"}
                </h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">
                  {description || "พิมพ์รายละเอียดเพื่อดูตัวอย่างข้อความ…"}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex items-center h-7 px-3 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  EV Station
                </span>
                <span className="text-[12px] text-gray-400">Preview mode</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-gray-500 text-center mt-6">
          พื้นหลังโทนฟ้า • มินิมอล • มือถือสวย • Desktop 2 คอลัมน์พร้อมพรีวิว
        </p>
      </main>
    </div>
  );
};

export default EditNews;
