import React from "react";
import type { DietData, MealData } from "../../types";

interface MealCatalogFiltersProps {
  meals: MealData[];
  diets: DietData[];
  filterDietId: number | null;
  sortAZ: boolean;
  displayedCount: number;
  onFilterDiet: (id: number | null) => void;
  onToggleSort: () => void;
}

/** Diet filter chips, A-Z sort toggle, and meal count — rendered inside TopBar. */
const MealCatalogFilters: React.FC<MealCatalogFiltersProps> = ({
  meals, diets, filterDietId, sortAZ, displayedCount, onFilterDiet, onToggleSort,
}) => (
  <>
    <button
      onClick={() => onFilterDiet(null)}
      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
        filterDietId === null
          ? "bg-blue-500 hover:bg-blue-700 text-white border-blue-500 shadow-md shadow-blue-500/20"
          : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      הכל
    </button>

    {diets
      .filter((d) => meals.some((m) => m.diet_id === d.id))
      .map((d) => (
        <button
          key={d.id}
          onClick={() => onFilterDiet(filterDietId === d.id ? null : d.id)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
            filterDietId === d.id
              ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
              : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
          }`}
        >
          {d.name}
        </button>
      ))}

    <div className="w-px h-6 bg-gray-200" />

    <button
      onClick={onToggleSort}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
        sortAZ
          ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
      </svg>
      א-ב
    </button>

    <span className="text-sm text-gray-400 font-medium">{displayedCount} ארוחות</span>
  </>
);

export default MealCatalogFilters;
