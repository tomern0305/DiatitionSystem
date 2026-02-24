import React, { useState } from "react";

interface AddCategoryFormProps {
  onAdd: (name: string) => Promise<void>;
}

const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onAdd }) => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(newCategoryName);
      setNewCategoryName("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-end gap-4 animate-fade-in-up"
    >
      <div className="flex-1 w-full">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          שם הקטגוריה החדשה
        </label>
        <input
          type="text"
          autoFocus
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-800 disabled:opacity-50"
          placeholder="לדוגמא: קינוחים..."
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(34,197,94,0.3)] transition-all shrink-0"
      >
        {isSubmitting ? "שומר..." : "שמור"}
      </button>
    </form>
  );
};

export default AddCategoryForm;
