import React, { useState } from "react";

interface AddSensitivityFormProps {
  onAdd: (name: string) => Promise<void>;
}

const AddSensitivityForm: React.FC<AddSensitivityFormProps> = ({ onAdd }) => {
  const [newSensitivityName, setNewSensitivityName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSensitivityName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAdd(newSensitivityName);
      setNewSensitivityName("");
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
          שם הרגישות / אלרגיה החדשה
        </label>
        <input
          type="text"
          value={newSensitivityName}
          onChange={(e) => setNewSensitivityName(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white outline-none transition-all text-gray-800 disabled:opacity-50"
          placeholder="לדוגמא: ללא גלוטן..."
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

export default AddSensitivityForm;
