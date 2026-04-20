import React, { useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import UserTable from "../components/admin/UserTable";
import type { UserData } from "../components/admin/UserTable";
import ResetPasswordModal from "../components/admin/ResetPasswordModal";
import AddUserModal from "../components/admin/AddUserModal";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

interface AdminPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

// Generates a random 8-character alphanumeric temp password
const generateTempPassword = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 6);

const AdminPage = ({ setIsSideMenuOpen }: AdminPageProps) => {
  const { token, authFetch } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [resetTarget, setResetTarget] = useState<{ user: UserData; tempPassword: string } | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [error, setError] = useState("");

  const [backupLoading, setBackupLoading] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Load users once token is available; re-runs if token changes
  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/api/users`)
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError("שגיאה בטעינת המשתמשים"));
  }, [token]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    const res = await authFetch(`${API}/api/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  // Generate temp password, call API, then open modal to display it
  const handleResetPassword = async (user: UserData) => {
    const tempPassword = generateTempPassword();
    const res = await authFetch(`${API}/api/users/${user.id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ tempPassword }),
    });
    if (res.ok) {
      setResetTarget({ user, tempPassword });
    }
  };

  const handleDelete = async (userId: number) => {
    const res = await authFetch(`${API}/api/users/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const handleExport = async () => {
    setBackupLoading(true);
    setBackupStatus(null);
    try {
      const res = await authFetch(`${API}/api/system/export`);
      if (!res.ok) throw new Error("ייצוא נכשל");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database_backup.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setBackupStatus({ text: "גיבוי יוצא בהצלחה!", type: "success" });
    } catch (err: any) {
      setBackupStatus({ text: `שגיאה בייצוא: ${err.message}`, type: "error" });
    } finally {
      setBackupLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setBackupLoading(true);
    setBackupStatus(null);
    try {
      const res = await fetch(`${API}/api/system/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "ייבוא נכשל");
      setBackupStatus({ text: data.message, type: "success" });
    } catch (err: any) {
      setBackupStatus({ text: `שגיאה בייבוא: ${err.message}`, type: "error" });
    } finally {
      setBackupLoading(false);
      e.target.value = "";
    }
  };

  const handleAddUser = async (username: string, tempPassword: string) => {
    const res = await authFetch(`${API}/api/users`, {
      method: "POST",
      body: JSON.stringify({ username, tempPassword, role: "lineworker" }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsers((prev) => [...prev, { id: data.id, username: data.username, role: data.role }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 relative" dir="rtl">
      <div className="w-full mx-auto space-y-8">
        <TopBar title="ניהול" setIsSideMenuOpen={setIsSideMenuOpen}>
          <button
            onClick={() => setIsAddUserOpen(true)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            הוסף עובד
          </button>
        </TopBar>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <UserTable
          users={users}
          onResetPassword={handleResetPassword}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
        />

        {/* Backup & Restore */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-800 text-lg mb-1">גיבוי ושחזור מערכת</h2>
          <p className="text-sm text-gray-400 mb-4">מייצא קובץ Excel אחד עם כל הטבלאות ותיקיית תמונות בתוך ZIP</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              disabled={backupLoading}
              className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              {backupLoading ? "מעבד..." : "ייצוא גיבוי"}
            </button>

            <div className="relative">
              <input
                type="file"
                accept=".zip"
                onChange={handleImport}
                disabled={backupLoading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className={`flex items-center gap-2 bg-blue-100 text-blue-700 font-semibold py-2.5 px-4 rounded-xl shadow-sm pointer-events-none ${backupLoading ? "opacity-50" : "hover:bg-blue-200"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clipRule="evenodd" />
                </svg>
                ייבוא גיבוי
              </div>
            </div>
          </div>
          {backupStatus && (
            <p className={`mt-3 text-sm font-medium ${backupStatus.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {backupStatus.text}
            </p>
          )}
        </div>
      </div>

      {resetTarget && (
        <ResetPasswordModal
          username={resetTarget.user.username}
          tempPassword={resetTarget.tempPassword}
          onClose={() => setResetTarget(null)}
        />
      )}

      {isAddUserOpen && (
        <AddUserModal
          onClose={() => setIsAddUserOpen(false)}
          onAdd={handleAddUser}
          generatePassword={generateTempPassword}
        />
      )}
    </div>
  );
};

export default AdminPage;
