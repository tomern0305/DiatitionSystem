import RoleSelect from "./RoleSelect";

export interface UserData {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

interface UserTableProps {
  users: UserData[];
  onResetPassword: (user: UserData) => void;
  onRoleChange: (userId: number, newRole: string) => void;
  onDelete: (userId: number) => void;
}

// Table displaying all system users with role management and password reset
const UserTable = ({ users, onResetPassword, onRoleChange, onDelete }: UserTableProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full text-right border-collapse">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 font-semibold text-gray-600">שם מלא</th>
            <th className="p-4 font-semibold text-gray-600">שם משתמש</th>
            <th className="p-4 font-semibold text-gray-600">תפקיד</th>
            <th className="p-4 font-semibold text-gray-600">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-500 text-lg">
                אין משתמשים במערכת.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{user.fullName}</td>
                <td className="p-4 text-gray-500">{user.username}</td>
                <td className="p-4">
                  <RoleSelect
                    value={user.role}
                    onChange={(role) => onRoleChange(user.id, role)}
                  />
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onResetPassword(user)}
                      className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      אפס סיסמה
                    </button>
                    <button
                      onClick={() => onDelete(user.id)}
                      className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-xl text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      מחק
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserTable;
