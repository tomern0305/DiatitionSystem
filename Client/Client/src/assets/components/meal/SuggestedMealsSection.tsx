import React from "react";
import type { MealData, ProductData, RestrictionsData, TexturesData } from "../../types";
import MealSummeryLineCard from "./MealSummeryLineCard";

interface SuggestedMealsSectionProps {
  meals: MealData[];
  products: ProductData[];
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
}

/** Displays a list of pre-filtered suggested meals matching the active restrictions. */
const SuggestedMealsSection: React.FC<SuggestedMealsSectionProps> = ({
  meals,
  products,
  restrictionsData,
  texturesData,
}) => {
  if (meals.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-emerald-100 bg-emerald-50/60">
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="font-bold text-emerald-800 text-sm leading-tight">
            ארוחות מוצעות
          </p>
          <p className="text-xs text-emerald-600">
            {meals.length} ארוחות תואמות להגבלות שנבחרו
          </p>
        </div>
      </div>

      {/* Meal cards list */}
      <div className="flex flex-col divide-y divide-gray-50 px-4 py-3 gap-2">
        {meals.map((meal) => (
          <div key={meal.id} className="pt-2 first:pt-0">
            <MealSummeryLineCard
              meal={meal}
              products={products}
              restrictionsData={restrictionsData}
              texturesData={texturesData}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedMealsSection;
