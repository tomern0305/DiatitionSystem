import { useState } from "react";
import PasswordInput from "../components/login/PasswordInput";

// Login page — username + password with toggle, front-end only for now
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up authentication
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

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            כניסה
          </button>

        </form>
      </div>
    </div>
  );
};

export default LoginPage;
