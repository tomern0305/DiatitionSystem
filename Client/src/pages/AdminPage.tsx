import { useState, useEffect } from "react";
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
  const { token } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [resetTarget, setResetTarget] = useState<{ user: UserData; tempPassword: string } | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [error, setError] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Load users from API on mount
  useEffect(() => {
    fetch(`${API}/api/users`, { headers: authHeaders })
      .then((r) => r.json())
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => setError("שגיאה בטעינת המשתמשים"));
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    const res = await fetch(`${API}/api/users/${userId}/role`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  // Generate temp password, call API, then open modal to display it
  const handleResetPassword = async (user: UserData) => {
    const tempPassword = generateTempPassword();
    const res = await fetch(`${API}/api/users/${user.id}/reset-password`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ tempPassword }),
    });
    if (res.ok) {
      setResetTarget({ user, tempPassword });
    }
  };

  const handleDelete = async (userId: number) => {
    const res = await fetch(`${API}/api/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  const handleAddUser = async (username: string, tempPassword: string) => {
    const res = await fetch(`${API}/api/users`, {
      method: "POST",
      headers: authHeaders,
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
        <TopBar title="ניהול משתמשים" setIsSideMenuOpen={setIsSideMenuOpen}>
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
