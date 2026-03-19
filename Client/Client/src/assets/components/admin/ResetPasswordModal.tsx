import { useState } from "react";

interface ResetPasswordModalProps {
  username: string;
  tempPassword: string;
  onClose: () => void;
}

// Floating modal that displays a newly generated temp password for a user
const ResetPasswordModal = ({ username, tempPassword, onClose }: ResetPasswordModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative z-50 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-5">
        <h2 className="text-xl font-bold text-gray-900 text-center">איפוס סיסמה</h2>

        <p className="text-sm text-gray-500 text-center">
          סיסמה זמנית נוצרה עבור המשתמש
        </p>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">שם משתמש</span>
          <span className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium">
            {username}
          </span>
        </div>

        {/* Temp password + copy */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-500">סיסמה זמנית</span>
          <div className="flex items-center gap-2">
            <span className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono tracking-widest">
              {tempPassword}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition-colors cursor-pointer shrink-0"
            >
              {copied ? "✓ הועתק" : "העתק"}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          יש להעביר את הסיסמה למשתמש ולבקש ממנו לשנות אותה בכניסה הבאה.
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
        >
          סגור
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;
