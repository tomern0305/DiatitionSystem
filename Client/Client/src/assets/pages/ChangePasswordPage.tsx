import { useState } from "react";
import PasswordInput from "../components/login/PasswordInput";

// Change password page — front-end only, functionality wired up later
const ChangePasswordPage = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up change password logic
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Logo / title */}
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="NutriCheck" className="mx-auto mb-4 h-24 w-auto" />
          <p className="mt-1 text-sm text-gray-500">עדכן את הסיסמה שלך</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Current password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">סיסמה נוכחית</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="הכנס סיסמה נוכחית"
            />
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">סיסמה חדשה</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="הכנס סיסמה חדשה"
            />
          </div>

          {/* Confirm new password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">אימות סיסמה חדשה</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הכנס שוב את הסיסמה החדשה"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            עדכן סיסמה
          </button>

        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
