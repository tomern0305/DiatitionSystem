import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/login/PasswordInput";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

const roleHome = (role: string) => {
  if (role === "admin") return "/admin";
  if (role === "lineworker") return "/lineworker";
  return "/";
};

const ChangePasswordPage = () => {
  const { token, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות החדשות אינן תואמות");
      return;
    }
    if (newPassword.length < 4) {
      setError("הסיסמה החדשה חייבת להכיל לפחות 4 תווים");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה בעדכון הסיסמה");
        return;
      }
      updateUser(data.user, data.token);
      navigate(roleHome(data.user.role), { replace: true });
    } catch {
      setError("שגיאת חיבור לשרת");
    } finally {
      setLoading(false);
    }
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

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {loading ? "מעדכן..." : "עדכן סיסמה"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
