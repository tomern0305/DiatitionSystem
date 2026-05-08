import React from "react";

export interface MacroItem {
  label: string;
  value: number;
  unit: string;
  color: string;
}

interface MealNutritionSummaryProps {
  totalCalories: number;
  macros: MacroItem[];
}

/** Horizontal stat bar — calories + macros as clean labeled columns. */
const MealNutritionSummary: React.FC<MealNutritionSummaryProps> = ({ totalCalories, macros }) => (
  <div className="flex items-stretch bg-white border border-gray-200 rounded-xl overflow-hidden">
    {/* Title */}
    <div className="flex items-center gap-2 justify-center px-4 py-3 shrink-0 bg-gray-50 border-l border-gray-200">
      <span className="w-1.5 h-5 rounded-full bg-blue-500 shrink-0" />
      <span className="text-sm font-bold text-gray-700 tracking-wide whitespace-nowrap">ערכים תזונתיים</span>
    </div>

    {/* Calories */}
    <div className="flex flex-col items-center justify-center px-6 py-3 shrink-0 bg-blue-50 border-l border-blue-100">
      <span className="text-2xl font-black text-blue-600 tabular-nums leading-none">{totalCalories.toFixed(0)}</span>
      <span className="text-[11px] font-semibold text-blue-400 mt-1">קלוריות</span>
    </div>

    {/* Macros */}
    {macros.map((m) => (
      <div key={m.label} className="flex flex-col items-center justify-center px-5 py-3 flex-1 min-w-0 border-l border-gray-200">
        <span className="text-base font-bold text-gray-800 tabular-nums leading-none">
          {m.value.toFixed(1)}
          <span className="text-[10px] font-medium text-gray-400 mr-0.5">{m.unit}</span>
        </span>
        <span className="text-[11px] font-medium text-gray-400 mt-1 truncate">{m.label}</span>
      </div>
    ))}
  </div>
);

export default MealNutritionSummary;
