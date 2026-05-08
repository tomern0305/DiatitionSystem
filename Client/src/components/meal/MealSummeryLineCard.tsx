import React from "react";
import type { MealData, ProductData, RestrictionsData, TexturesData } from "../../types";

interface MealSummeryLineCardProps {
  meal: MealData;
  products: ProductData[];
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  onScrollToProduct: (id: number) => void;
}

/** A compact single-row meal card for fast-paced tray/line work. */
const MealSummeryLineCard: React.FC<MealSummeryLineCardProps> = ({
  meal,
  products,
  restrictionsData,
  texturesData,
  onScrollToProduct,
}) => {
  const restrictions = meal.filters.restriction_ids
    .map((id) => restrictionsData.find((r) => r.id === id)?.name)
    .filter((n): n is string => !!n);

  const textures = meal.filters.texture_ids
    .map((id) => texturesData.find((t) => t.id === id)?.name)
    .filter((n): n is string => !!n);

  const productMap = new Map(products.map((p) => [Number(p.id), p.name]));
  const ingredients = meal.product_ids
    .map((id) => ({ id, name: productMap.get(id) }))
    .filter((i): i is { id: number; name: string } => !!i.name);

  const scrollToProduct = (id: number) => {
    const el = document.getElementById(`product-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    onScrollToProduct(id);
  };

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors duration-150">

      {/* Meal name + diet */}
      <div className="w-44 shrink-0">
        <p className="font-semibold text-gray-800 text-sm truncate">{meal.name}</p>
        {meal.diet_name && (
          <p className="text-xs text-blue-400 mt-0.5">{meal.diet_name}</p>
        )}
      </div>

      <div className="w-px h-6 bg-gray-100 shrink-0" />

      {/* Restrictions + textures */}
      <div className="flex flex-wrap gap-1 w-44 shrink-0">
        {restrictions.length === 0 && textures.length === 0 ? (
          <span className="text-xs text-gray-300">ללא הגבלות</span>
        ) : (
          <>
            {restrictions.map((r) => (
              <span key={r} className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                {r}
              </span>
            ))}
            {textures.map((t) => (
              <span key={t} className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {t}
              </span>
            ))}
          </>
        )}
      </div>

      <div className="w-px h-6 bg-gray-100 shrink-0" />

      {/* Ingredients */}
      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
        {ingredients.map(({ id, name }) => (
          <span
            key={id}
            onClick={() => scrollToProduct(id)}
            className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            {name}
          </span>
        ))}
      </div>

      {/* Calories */}
      <div className="shrink-0 text-left">
        <span className="text-sm font-bold text-gray-700">{meal.nutrition.calories.toFixed(0)}</span>
        <span className="text-xs text-gray-400 mr-0.5">קל'</span>
      </div>
    </div>
  );
};

export default MealSummeryLineCard;
