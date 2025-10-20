import React from "react";

// EV bolt icon (minimal)
const BoltIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path d="M13.5 2 4 13h6l-1.5 9L20 11h-6l1.5-9Z" fill="currentColor" />
  </svg>
);

const Header: React.FC<{ title?: string }> = ({ title = "EV" }) => {
  return (
    <header
      className="sticky top-0 z-20 bg-blue-600 text-white rounded-b-2xl shadow-md overflow-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto max-w-screen-sm px-4 py-3 flex items-center gap-2">
        <button
          onClick={() => window.history.back()}
          aria-label="ย้อนกลับ"
          className="h-9 w-9 flex items-center justify-center rounded-xl active:bg-white/15 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/15">
            <BoltIcon className="h-5 w-5 text-white" />
          </span>
          <span className="text-sm font-semibold tracking-wide">{title}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
