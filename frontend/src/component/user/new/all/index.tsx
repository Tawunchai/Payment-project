// NewsListMobile.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiNewspaperLine } from "react-icons/ri";
import { ListNews, apiUrlPicture } from "../../../../services";
import { NewsInterface } from "../../../../interface/INews";

const NewsListMobile: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<NewsInterface[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await ListNews();
        if (Array.isArray(res)) setItems(res);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header
        className="sticky top-0 z-20 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden w-full"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            aria-label="ย้อนกลับ"
            className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
              <RiNewspaperLine className="text-white" />
            </span>
            <span className="text-sm font-semibold tracking-wide">ข่าวสารและกิจกรรม</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-screen-sm px-4 py-3">
        {loading ? (
          <ul className="divide-y divide-gray-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i} className="flex gap-3 py-4">
                <div className="h-16 w-28 rounded-lg bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200 animate-pulse" />
                  <div className="h-4 w-2/3 rounded bg-gray-100 animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-500">ไม่พบข่าวสารและกิจกรรม</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((n) => {
              const img = n?.Picture ? `${apiUrlPicture}${n.Picture}` : "";
              return (
                <li key={n.ID} className="py-2">
                  <button
                    type="button"
                    onClick={() => navigate("/user/one-news", { state: { news: n } })}
                    className="flex w-full gap-3 py-2 text-left"
                  >
                    {/* Thumbnail */}
                    <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg ring-1 ring-blue-100 bg-blue-50">
                      {img ? (
                        <img
                          src={img}
                          alt={n.Title}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : null}
                    </div>

                    {/* Texts */}
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[15px] font-semibold text-gray-900">{n.Title}</h3>
                      <p className="mt-1 line-clamp-2 text-[13px] text-gray-500">{n.Description}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default NewsListMobile;
