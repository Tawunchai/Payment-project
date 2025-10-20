import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { UpdateGettingStartedByID } from "../../../services";

const EditGettingStarted: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // รับค่าเริ่มต้นจากหน้าเดิม
  const {
    id,
    initialTitle = "",
    initialDescription = "",
  } = (location.state || {}) as {
    id?: number;
    initialTitle?: string;
    initialDescription?: string;
  };

  // ถ้าไม่มี id ให้เด้งกลับ
  useEffect(() => {
    if (!id) {
      message.warning("ไม่พบข้อมูลที่จะอัปเดต");
      navigate("/admin/editor");
    }
  }, [id, navigate]);

  const [title, setTitle] = useState<string>(initialTitle);
  const [description, setDescription] = useState<string>(initialDescription);
  const [employeeID, setEmployeeID] = useState<number>(Number(localStorage.getItem("employeeid")) || 0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmployeeID(Number(localStorage.getItem("employeeid")) || 0);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    if (!title.trim() || !description.trim()) {
      message.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("employeeID", String(employeeID));

    try {
      setLoading(true);
      const ok = await UpdateGettingStartedByID(id, formData);
      if (ok) {
        message.success("อัปเดตข้อมูลสำเร็จ");
        setTimeout(() => navigate("/admin/editor"), 700);
      } else {
        message.error("อัปเดตข้อมูลล้มเหลว");
      }
    } catch {
      message.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  // พรีวิวข้อความ (memo ไม่จำเป็นมาก แต่เผื่อป้องกัน re-render หนัก ๆ หากต่อยอด)
  const preview = useMemo(
    () => ({
      title: title || "หัวข้อของคุณจะปรากฏที่นี่",
      description: description || "พิมพ์รายละเอียดเพื่อดูตัวอย่างข้อความ…",
    }),
    [title, description]
  );

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(180deg,#eaf2ff_0%,#f5f8ff_50%,#ffffff_100%)]">
      {/* Header แบบ News */}
      <header
        className="sticky top-0 z-10 bg-blue-600 text-white shadow-sm w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-semibold tracking-wide">
            Edit Getting Started
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
              <p className="text-xs text-gray-500">Docs Management</p>
              <h2 className="text-xl font-bold text-blue-700">
                EV Station • Edit Getting Started
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อ (Title)
                </label>
                <input
                  className="w-full rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm outline-none ring-0 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition"
                  name="Title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น วิธีเริ่มต้นใช้งานระบบ EV Station"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด (Description)
                </label>
                <textarea
                  name="Description"
                  className="w-full min-h-[160px] rounded-xl border border-blue-100 bg-white px-3 py-3 text-sm outline-none ring-0 focus:border-blue-300 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)] transition"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายขั้นตอน / คำแนะนำ / ข้อมูลสำคัญสำหรับผู้ใช้ใหม่…"
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
                  onClick={() => navigate("/admin/editor")}
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
              <p className="text-xs text-gray-500">ดูตัวอย่างเนื้อหาที่กำลังแก้ไข</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-gray-900">
                {preview.title}
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {preview.description}
              </p>

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

export default EditGettingStarted;
