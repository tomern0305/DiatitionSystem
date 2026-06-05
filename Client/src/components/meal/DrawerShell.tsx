import React from "react";

interface DrawerShellProps {
  title: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
}

/** Shared full-screen drawer wrapper: overlay, header, animation, scrollbar styles. */
const DrawerShell: React.FC<DrawerShellProps> = ({ title, onClose, children }) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-slide-in-down" dir="rtl">
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <h2 className="font-bold text-gray-800 text-xl">{title}</h2>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="סגור"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col xl:flex-row gap-0 overflow-hidden">
        {children}
      </div>
    </div>

    <style>{`
      .custom-scrollbar::-webkit-scrollbar { width: 5px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      @keyframes slide-in-down {
        from { opacity: 0; transform: translateY(24px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .animate-slide-in-down { animation: slide-in-down 0.22s cubic-bezier(0.25,0.8,0.25,1); }
    `}</style>
  </>
);

export default DrawerShell;
