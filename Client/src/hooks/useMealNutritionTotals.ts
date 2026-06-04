import { useMemo } from "react";
import type { ProductData } from "../types";

/** Sums nutrition values across a list of products. */
export function useMealNutritionTotals(products: ProductData[]) {
  return useMemo(
    () =>
      products.reduce(
        (acc, p) => ({
          calories: acc.calories + (p.calories || 0),
          protein: acc.protein + (p.protein || 0),
          carbs: acc.carbs + (p.carbs || 0),
          fat: acc.fat + (p.fat || 0),
          sugares: acc.sugares + (p.sugares || 0),
          sodium: acc.sodium + (p.sodium || 0),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0, sugares: 0, sodium: 0 },
      ),
    [products],
  );
}
