import { X } from "react-feather";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="paddings fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-lg bg-white p-8 shadow-xl
                   transform transition-transform duration-300 scale-100"
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute right-4 top-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
