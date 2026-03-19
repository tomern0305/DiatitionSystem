import { useState } from "react";
import TopBar from "../components/ui/TopBar";
import UserTable from "../components/admin/UserTable";
import type { UserData } from "../components/admin/UserTable";
import ResetPasswordModal from "../components/admin/ResetPasswordModal";
import AddUserModal from "../components/admin/AddUserModal";

interface AdminPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

// Generates a random 8-character alphanumeric temp password
const generateTempPassword = () =>
  Math.random().toString(36).slice(2, 6).toUpperCase() +
  Math.random().toString(36).slice(2, 6);

const MOCK_USERS: UserData[] = [
  { id: 1, username: "admin1", fullName: "יוסי כהן", role: "admin" },
  { id: 2, username: "diet_sara", fullName: "שרה לוי", role: "dietitian" },
  { id: 3, username: "diet_ron", fullName: "רון אברהם", role: "dietitian" },
  { id: 4, username: "line_worker1", fullName: "מיכל גולן", role: "lineworker" },
  { id: 5, username: "line_worker2", fullName: "אבי שפירא", role: "lineworker" },
];

const AdminPage = ({ setIsSideMenuOpen }: AdminPageProps) => {
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [resetTarget, setResetTarget] = useState<{ user: UserData; tempPassword: string } | null>(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Replace user's role in state
  const handleRoleChange = (userId: number, newRole: string) => {
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
  };

  // Generate temp password and open modal
  const handleResetPassword = (user: UserData) => {
    setResetTarget({ user, tempPassword: generateTempPassword() });
  };

  // Remove user from state
  const handleDelete = (userId: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Add new user with generated password
  const handleAddUser = (username: string) => {
    const newUser: UserData = {
      id: Date.now(),
      username,
      fullName: username,
      role: "lineworker",
    };
    setUsers((prev) => [...prev, newUser]);
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
