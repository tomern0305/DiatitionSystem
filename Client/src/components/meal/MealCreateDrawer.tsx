import React, { useState } from "react";
import MealDetailsForm from "./MealDetailsForm";
import MealNutritionSummary from "./MealNutritionSummary";
import MealIngredientsList from "./MealIngredientsList";
import ProductLibrary from "./ProductLibrary";
import { buildMacros } from "../../utils/mealMacros";
import { useAllergenNames } from "../../hooks/useAllergenNames";
import { useFilteredProducts } from "../../hooks/useFilteredProducts";
import { useMealNutritionTotals } from "../../hooks/useMealNutritionTotals";
import { useAuth } from "../../context/AuthContext";
import type { MealData, ProductData, DietData, RestrictionsData, TexturesData } from "../../types";

interface MealCreateDrawerProps {
  diets: DietData[];
  products: ProductData[];
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  onClose: () => void;
  onCreated: (meal: MealData) => void;
}

/** Full-screen two-pane drawer for creating a new meal. Manages its own state. */
const MealCreateDrawer: React.FC<MealCreateDrawerProps> = ({
  diets, products, restrictionsData, texturesData, onClose, onCreated,
}) => {
  const [mealName, setMealName] = useState("");
  const [mealDesc, setMealDesc] = useState("");
  const [dietId, setDietId] = useState<number | "">("");
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [saving, setSaving] = useState(false);

  const [libSearch, setLibSearch] = useState("");
  const [libRestrictions, setLibRestrictions] = useState<number[]>([]);
  const [libTextures, setLibTextures] = useState<number[]>([]);
  const [libShowMayContain, setLibShowMayContain] = useState(false);

  const allergenNames = useAllergenNames(libRestrictions, restrictionsData);
  const availableProducts = useFilteredProducts(products, {
    searchTerm: libSearch,
    allergenNames,
    showMayContain: libShowMayContain,
    selectedTextures: libTextures,
    texturesData,
  });
  const totals = useMealNutritionTotals(selectedProducts);
  const { authFetch } = useAuth();

  const handleSave = async () => {
    if (!mealName.trim() || selectedProducts.length === 0) return;
    setSaving(true);
    try {
      const res = await authFetch(`${import.meta.env.VITE_API_URL}/api/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mealName.trim(),
          description: mealDesc.trim(),
          diet_id: dietId || null,
          product_ids: selectedProducts.map((p) => Number(p.id)),
          nutrition: totals,
          filters: {
            restriction_ids: libRestrictions,
            texture_ids: libTextures,
            show_may_contain: libShowMayContain,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "שגיאה לא ידועה");
      const mealRes = await authFetch(`${import.meta.env.VITE_API_URL}/api/meals/${json.id}`);
      const meal = await mealRes.json();
      onCreated(meal);
      onClose();
    } catch (err: any) {
      alert(`שגיאה בשמירה: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-slide-in-down" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
          <h2 className="font-bold text-gray-800 text-xl">הרכבת ארוחה חדשה</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="סגור"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nutrition summary — full width */}
        <div className="shrink-0 px-6 pt-5 pb-0">
          <MealNutritionSummary totalCalories={totals.calories} macros={buildMacros(totals)} />
        </div>

        {/* Two-pane body */}
        <div className="flex-1 flex flex-col xl:flex-row gap-0 overflow-hidden">
          {/* Right pane: details + ingredients */}
          <div className="flex-1 flex flex-col p-6 gap-5 overflow-hidden">
            <div className="shrink-0">
              <MealDetailsForm
                mealName={mealName}
                mealDescription={mealDesc}
                selectedDietId={dietId}
                diets={diets}
                onMealNameChange={setMealName}
                onMealDescriptionChange={setMealDesc}
                onDietChange={setDietId}
              />
            </div>
            <div className="flex-1 min-h-0">
              <MealIngredientsList
                selectedProducts={selectedProducts}
                saving={saving}
                canSave={selectedProducts.length > 0 && mealName.trim().length > 0}
                onRemove={(i) => setSelectedProducts((prev) => prev.filter((_, idx) => idx !== i))}
                onClearAll={() => setSelectedProducts([])}
                onSave={handleSave}
              />
            </div>
          </div>

          {/* Left pane: product library */}
          <div className="xl:w-[60%] flex flex-col border-r border-gray-100 overflow-hidden h-full pt-6 pb-6 pl-6">
            <ProductLibrary
              availableProducts={availableProducts}
              restrictionsData={restrictionsData}
              texturesData={texturesData}
              searchTerm={libSearch}
              selectedRestrictions={libRestrictions}
              selectedTextures={libTextures}
              showMayContain={libShowMayContain}
              onSearchChange={setLibSearch}
              onToggleRestriction={(id) =>
                setLibRestrictions((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              onToggleTexture={(id) => setLibTextures((prev) => (prev.includes(id) ? [] : [id]))}
              onToggleMayContain={() => setLibShowMayContain((v) => !v)}
              onAddProduct={(p) => setSelectedProducts((prev) => [...prev, p])}
            />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        @keyframes slide-in-down {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-down { animation: slide-in-down 0.22s cubic-bezier(0.25,0.8,0.25,1); }
      `}</style>
    </>
  );
};

export default MealCreateDrawer;
