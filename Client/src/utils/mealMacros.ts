import type { MealData } from "../types";

/** Builds the macro descriptor array used by MealNutritionSummary. */
export function buildMacros(nutrition: MealData["nutrition"]) {
  return [
    { label: "חלבון", value: nutrition.protein, unit: "ג'", color: "#3b82f6" },
    { label: "פחמימה", value: nutrition.carbs, unit: "ג'", color: "#10b981" },
    { label: "שומן", value: nutrition.fat, unit: "ג'", color: "#f59e0b" },
    { label: "סוכרים", value: nutrition.sugares, unit: "ג'", color: "#ec4899" },
    { label: "נתרן", value: nutrition.sodium, unit: 'מ"ג', color: "#8b5cf6" },
  ];
}
