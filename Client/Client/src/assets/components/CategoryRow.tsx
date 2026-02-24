import React, { useState } from "react";
import type { CategoryData } from "../pages/CategorySettingsPage";

interface CategoryRowProps {
  category: CategoryData;
  onEdit: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onEdit,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(category.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onEdit(category.id, editName);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors group">
      <td className="p-4 sm:p-5 text-gray-400 font-mono text-sm">
        #{category.id}
      </td>
      <td className="p-4 sm:p-5">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="flex items-center gap-3">
            <input
              type="text"
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              disabled={isSubmitting}
              className="flex-1 px-3 py-1.5 bg-white border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-800 shadow-sm disabled:opacity-50"
              required
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              שמור
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsEditing(false);
                setEditName(category.name);
              }}
              className="text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              בטל
            </button>
          </form>
        ) : (
          <span className="font-semibold text-gray-800 text-lg">
            {category.name}
          </span>
        )}
      </td>
      <td className="p-4 sm:p-5 text-center">
        {!isEditing && (
          <div className="flex items-center justify-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
              title="ערוך"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
                />
              </svg>
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="מחק"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default CategoryRow;
