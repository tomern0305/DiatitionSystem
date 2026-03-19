// Inline role selector for the users table
const ROLES = [
  { value: "admin", label: "מנהל" },
  { value: "dietitian", label: "דיאטן" },
  { value: "lineworker", label: "עובד קו" },
];

interface RoleSelectProps {
  value: string;
  onChange: (role: string) => void;
}

const RoleSelect = ({ value, onChange }: RoleSelectProps) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
  >
    {ROLES.map((r) => (
      <option key={r.value} value={r.value}>{r.label}</option>
    ))}
  </select>
);

export default RoleSelect;
