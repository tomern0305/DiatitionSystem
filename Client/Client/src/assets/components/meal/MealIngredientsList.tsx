import React from "react";
import type { ProductData } from "../../types";

interface MealIngredientsListProps {
  /** Ordered list of products added to the current meal. */
  selectedProducts: ProductData[];
  /** Set to true while the save API call is in-flight. */
  saving: boolean;
  /** Whether the save button should be considered valid and enabled. */
  canSave: boolean;
  /** Called when the user clicks a product's remove (×) button. */
  onRemove: (index: number) => void;
  /** Clears the entire ingredient list in one click. */
  onClearAll: () => void;
  /** Triggers the meal save flow in the parent. */
  onSave: () => void;
}

const MealIngredientsList: React.FC<MealIngredientsListProps> = ({
  selectedProducts,
  saving,
  canSave,
  onRemove,
  onClearAll,
  onSave,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 shrink-0">
        <h3 className="text-gray-800 font-bold text-lg">מרכיבי הארוחה</h3>
        <div className="flex items-center gap-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
            >
              נקה הכל
            </button>
          )}
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {selectedProducts.length} נבחרו
          </span>
        </div>
      </div>

      {/* ── Scrollable list ─────────────────────────────────────────────── */}
      <div className="divide-y divide-gray-100 flex-1 overflow-y-auto custom-scrollbar">
        {selectedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400 gap-3 py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p className="font-medium text-gray-500">טרם נבחרו מרכיבים</p>
            <p className="text-sm">לחץ על מוצרים מהמאגר להוספה</p>
          </div>
        ) : (
          selectedProducts.map((p, idx) => (
            <div
              key={`${p.id}-${idx}`}
              className="flex items-center gap-4 px-6 py-4 group hover:bg-gray-50 transition-colors"
            >
              {/* Thumbnail or initials */}
              {p.image ? (
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-11 h-11 shrink-0 rounded-xl object-cover border border-gray-100"
                />
              ) : (
                <div className="w-11 h-11 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 font-bold text-base">
                  {p.name.trim().substring(0, 2)}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-base mb-1 truncate">
                  {p.name}
                </h4>
                <div className="grid grid-cols-3 gap-x-4 text-sm text-gray-500">
                  <span>
                    חלבון{" "}
                    <strong className="text-gray-700 font-semibold">
                      {p.protein?.toFixed(1) ?? 0}ג'
                    </strong>
                  </span>
                  <span>
                    פחמימה{" "}
                    <strong className="text-gray-700 font-semibold">
                      {p.carbs?.toFixed(1) ?? 0}ג'
                    </strong>
                  </span>
                  <span>
                    שומן{" "}
                    <strong className="text-gray-700 font-semibold">
                      {p.fat?.toFixed(1) ?? 0}ג'
                    </strong>
                  </span>
                  <span>
                    סוכרים{" "}
                    <strong className="text-gray-700 font-semibold">
                      {p.sugares?.toFixed(1) ?? 0}ג'
                    </strong>
                  </span>
                  <span>
                    נתרן{" "}
                    <strong className="text-gray-700 font-semibold">
                      {p.sodium?.toFixed(1) ?? 0}מ"ג
                    </strong>
                  </span>
                  <span className="font-bold text-blue-600">
                    {p.calories?.toFixed(0)}{" "}
                    <span className="font-normal text-gray-400">קל'</span>
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => onRemove(idx)}
                aria-label="הסר מרכיב"
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Save button ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-t border-gray-100 shrink-0">
        <button
          onClick={onSave}
          disabled={saving || !canSave}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 text-base shadow-md shadow-blue-500/20 disabled:shadow-none"
        >
          {saving ? "שומר..." : "שמור ארוחה"}
        </button>
      </div>
    </div>
  );
};

export default MealIngredientsList;
