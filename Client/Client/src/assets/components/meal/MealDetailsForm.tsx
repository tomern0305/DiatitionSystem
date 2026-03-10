import React from "react";
import type { DietData } from "../../types";

interface MealDetailsFormProps {
  /** Current meal name controlled by the parent. */
  mealName: string;
  /** Current free-text description / notes. */
  mealDescription: string;
  /** Currently selected diet ID, or empty string for no diet. */
  selectedDietId: number | "";
  /** List of available diets fetched from the API. */
  diets: DietData[];
  onMealNameChange: (v: string) => void;
  onMealDescriptionChange: (v: string) => void;
  onDietChange: (id: number | "") => void;
}

const MealDetailsForm: React.FC<MealDetailsFormProps> = ({
  mealName,
  mealDescription,
  selectedDietId,
  diets,
  onMealNameChange,
  onMealDescriptionChange,
  onDietChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-gray-800 font-bold text-lg mb-5">פרטי הארוחה</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Meal name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            שם הארוחה
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => onMealNameChange(e.target.value)}
            placeholder="הזן שם לארוחה..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
          />
        </div>

        {/* Diet selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            דיאטה
          </label>
          <select
            value={selectedDietId}
            onChange={(e) =>
              onDietChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer text-sm font-medium text-gray-700"
          >
            <option value="">-- ללא שיוך --</option>
            {diets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Notes textarea */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            הערות (אופציונלי)
          </label>
          <textarea
            value={mealDescription}
            onChange={(e) => onMealDescriptionChange(e.target.value)}
            rows={2}
            placeholder="הערות לצוות או פירוט..."
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all resize-none text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MealDetailsForm;
