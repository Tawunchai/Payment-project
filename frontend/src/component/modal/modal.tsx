import React from 'react'

type propTypes = {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
};

const Modal: React.FC<propTypes> = ({ open, onClose, children }) => {
    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-center transition-colors ${
                open ? "visible bg-black/40" : "invisible"
            }`}
            onClick={onClose}
        >
            <div
                className={`relative bg-white rounded-xl shadow-lg transition-all transform p-6 
                    ${open ? "scale-100 opacity-100" : "scale-110 opacity-0"}
                    w-[80%] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl
                    max-h-[50vh] overflow-y-auto
                `}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute top-2 right-2 px-2 py-1 border border-neutral-200 rounded-md text-gray-400 bg-white hover:bg-gray-50 hover:text-gray-600"
                    onClick={onClose}
                >
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
