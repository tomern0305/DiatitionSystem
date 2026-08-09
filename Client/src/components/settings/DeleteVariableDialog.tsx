import React from "react";
import type { VariableUsage } from "../../types";

interface DeleteVariableDialogProps {
  /** Display name of the item being deleted, e.g. "חלב". */
  itemName: string;
  /** Singular noun for the variable type, e.g. "רגישות". */
  kindLabel: string;
  /** null means the usage counts could not be loaded — never assume "unused". */
  usage: VariableUsage | null;
  isSubmitting: boolean;
  /** Delete error, rendered inside the card so the modal never hides it. */
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirmation modal for deleting a settings variable, blocked while it is in use. */
const DeleteVariableDialog: React.FC<DeleteVariableDialogProps> = ({
  itemName,
  kindLabel,
  usage,
  isSubmitting,
  error,
  onCancel,
  onConfirm,
}) => {
  // Anything still pointing at this variable blocks deletion outright.
  const inUse = !!usage && (usage.products > 0 || usage.meals > 0);

  const references = () => {
    if (!usage) return "";
    const parts: string[] = [];
    if (usage.products > 0) parts.push(`${usage.products} מוצרים`);
    if (usage.meals > 0) parts.push(`${usage.meals} ארוחות שמורות`);
    return parts.join(" ול-");
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4"
      onClick={isSubmitting ? undefined : onCancel}
    >
      <div
        dir="rtl"
        className="bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-800">
          מחיקת {kindLabel}: {itemName}
        </h3>

        {!usage ? (
          <p className="text-sm text-gray-700">
            לא ניתן לבדוק כרגע כמה פריטים משתמשים ב{kindLabel} הזו. אפשר לנסות
            למחוק — השרת יחסום את הפעולה אם היא בשימוש.
          </p>
        ) : inUse ? (
          <div className="space-y-2 text-sm text-gray-700">
            <p className="font-semibold text-red-600">לא ניתן למחוק.</p>
            <p>
              ה{kindLabel} משויכת ל-<b>{references()}</b>.
            </p>
            <p className="text-gray-500">
              הסירו את השיוך מהפריטים האלו קודם, ואז אפשר יהיה למחוק. שום מוצר
              או ארוחה לא ישונו על ידי הפעולה הזו.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-700">
            ה{kindLabel} אינה בשימוש. למחוק אותה לצמיתות?
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {inUse ? "סגור" : "ביטול"}
          </button>
          {!inUse && (
            <button
              onClick={onConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300 transition-colors"
            >
              {isSubmitting ? "מוחק..." : "מחק"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteVariableDialog;
