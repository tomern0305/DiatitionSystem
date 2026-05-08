import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PasswordInput from "../components/login/PasswordInput";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

// Role-based redirect after successful login
const roleHome = (role: string) => {
  // if (role === "admin") return "/";
  if (role === "lineworker") return "/lineworker";
  return "/";
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "שגיאה בכניסה");
        return;
      }
      login(data.user, data.token);
      // If must_change_password, redirect to change-password; else to role home
      navigate(data.user.must_change_password ? "/change-password" : roleHome(data.user.role), { replace: true });
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
          {/* <h1 className="text-2xl font-bold text-gray-900">NutriCheck</h1> */}
          <p className="mt-1 text-sm text-gray-500">התחבר לחשבונך</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">שם משתמש</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="שם משתמש"
              autoComplete="username"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Password with toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">סיסמה</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="סיסמה"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {loading ? "מתחבר..." : "כניסה"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
