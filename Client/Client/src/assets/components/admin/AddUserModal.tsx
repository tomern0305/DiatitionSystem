import { useState } from "react";

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (username: string, tempPassword: string) => void;
  generatePassword: () => string;
}

// Modal for adding a new user — collects username and shows a generated password
const AddUserModal = ({ onClose, onAdd, generatePassword }: AddUserModalProps) => {
  const [username, setUsername] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = () => {
    if (!username.trim()) {
      setError("יש להזין שם משתמש");
      return;
    }
    setError("");
    setGeneratedPassword(generatePassword());
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = () => {
    onAdd(username.trim(), generatedPassword);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-50 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-lg p-8 flex flex-col gap-5">
        <h2 className="text-xl font-bold text-gray-900 text-center">הוספת משתמש חדש</h2>

        {/* Username input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">שם משתמש</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setGeneratedPassword(""); }}
              placeholder="הכנס שם משתמש"
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button
              type="button"
              onClick={handleGenerate}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              צור סיסמה
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </div>

        {/* Generated password */}
        {generatedPassword && (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">סיסמה זמנית</label>
            <div className="flex items-center gap-2">
              <span className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-mono tracking-widest">
                {generatedPassword}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm transition-colors cursor-pointer shrink-0"
              >
                {copied ? "✓ הועתק" : "העתק"}
              </button>
            </div>
            <p className="text-xs text-gray-400">יש להעביר את הסיסמה למשתמש ולבקש ממנו לשנות אותה בכניסה הבאה.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!generatedPassword}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            הוסף משתמש
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
