import { ReactNode } from "react";
import { X } from "react-feather";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

const Modal = ({ open, onClose, children, title }: ModalProps) => {
  if (!open) return null;

  return (
    <div
      aria-modal
      role="dialog"
      tabIndex={-1}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-colors"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-lg p-8 min-w-[320px] animate-fadeIn"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={22} />
        </button>
        {title && (
          <div className="mb-4 text-lg font-semibold text-gray-900">{title}</div>
        )}
        <div>{children}</div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(1.1);}
            to { opacity: 1; transform: scale(1);}
          }
          .animate-fadeIn {
            animation: fadeIn 0.22s cubic-bezier(.4,0,.2,1);
          }
        `}
      </style>
    </div>
  );
};

export default Modal;
