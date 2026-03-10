import React, { useEffect } from "react";

type ToastType = "success" | "error";

interface ToastProps {
  /** The message to display inside the toast. */
  message: string;
  type: ToastType;
  /** Call this to dismiss the toast from the parent. */
  onDismiss: () => void;
}

/** Auto-dismissing in-app toast notification that slides in from the top. */
const Toast: React.FC<ToastProps> = ({ message, type, onDismiss }) => {
  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg border text-sm font-medium animate-slide-down ${
        isSuccess
          ? "bg-white border-green-200 text-green-800"
          : "bg-white border-red-200 text-red-800"
      }`}
      style={{ minWidth: "280px", maxWidth: "90vw" }}
      dir="rtl"
    >
      {/* Icon */}
      {isSuccess ? (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
      )}

      <span className="flex-1">{message}</span>

      {/* Manual dismiss */}
      <button
        onClick={onDismiss}
        className="text-gray-300 hover:text-gray-500 transition-colors shrink-0"
        aria-label="סגור"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-slide-down { animation: slide-down 0.25s ease-out; }
      `}</style>
    </div>
  );
};

export default Toast;
export type { ToastType };
