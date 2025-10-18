import React from "react";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <div className="p-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="ย้อนกลับ"
          className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 active:scale-[0.98] transition"
        >
          {/* Arrow Left (SVG) */}
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-gray-900"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Big circular illustration */}
        <div className="relative h-48 w-48 sm:h-56 sm:w-56 rounded-full flex items-center justify-center">
          {/* outer soft ring */}
          <div className="absolute inset-0 rounded-full bg-gray-100" />
          {/* inner circle */}
          <div className="relative z-10 h-28 w-28 sm:h-32 sm:w-32 rounded-full bg-white shadow-sm flex items-center justify-center">
            {/* ===== Inline SVG Illustration (รถ + ฉากหลัง + ป้าย +) ===== */}
            <svg viewBox="0 0 160 160" className="h-24 w-24" aria-hidden="true">
              <g opacity="0.25">
                <rect x="10" y="70" width="50" height="28" rx="4" fill="#9CA3AF" />
                <rect x="100" y="74" width="22" height="12" rx="2" fill="#9CA3AF" />
                <circle cx="22" cy="100" r="6" fill="#9CA3AF" />
                <circle cx="50" cy="100" r="6" fill="#9CA3AF" />
                <circle cx="110" cy="92" r="4" fill="#9CA3AF" />
              </g>

              {/* main car */}
              <g transform="translate(20,78)">
                <path
                  d="M20 28h80c4 0 7-3 7-7v-4c0-5-4-9-9-10l-22-4c-2-.4-4 .7-5 2.7l-2.5 5.3H45.5l-2.5-5.3C42.9 3.7 41 .6 39 1l-22 4C12 6 8 10 8 15v6c0 4 3 7 7 7z"
                  fill="#3B82F6"
                />
                <rect x="38" y="10" width="44" height="10" rx="2" fill="#BFDBFE" />
                <rect x="48" y="22" width="24" height="4" rx="2" fill="#93C5FD" />
                <circle cx="38" cy="34" r="7" fill="#111827" />
                <circle cx="82" cy="34" r="7" fill="#111827" />
                <circle cx="38" cy="34" r="3" fill="#6B7280" />
                <circle cx="82" cy="34" r="3" fill="#6B7280" />
                <rect x="24" y="24" width="8" height="6" rx="1" fill="#F59E0B" />
                <rect x="88" y="24" width="8" height="6" rx="1" fill="#F59E0B" />
              </g>

              {/* plus badge */}
              <g transform="translate(112,16)">
                <circle cx="20" cy="20" r="18" fill="#10B981" />
                <path d="M20 12v16M12 20h16" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </g>
            </svg>
            {/* ===== end illustration ===== */}
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="mt-8 text-2xl sm:text-3xl font-bold text-gray-900">เพิ่มข้อมูลพาหนะ</h1>
        <p className="mt-2 text-gray-500">เพื่อความพร้อมในการใช้บริการ</p>
      </main>

      {/* Bottom button */}
      <div className="sticky bottom-0 left-0 right-0 px-4 pb-6 pt-2 bg-gradient-to-t from-white via-white/90 to-transparent">
        <button
          onClick={() => navigate("/user/add-cars")}
          className="w-full h-14 rounded-2xl bg-blue-600 text-white font-medium shadow-lg active:scale-[0.99] transition inline-flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
          เพิ่มพาหนะ
        </button>
      </div>
    </div>
  );
};

export default Index;
