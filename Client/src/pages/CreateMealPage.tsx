import React, { useState, useEffect } from "react";
import TopBar from "../components/layout/TopBar";
import Toast from "../components/layout/Toast";
import LoadingGuard from "../components/layout/LoadingGuard";
import ProductLibrary from "../components/meal/ProductLibrary";
import MealNutritionSummary from "../components/meal/MealNutritionSummary";
import MealDetailsForm from "../components/meal/MealDetailsForm";
import MealIngredientsList from "../components/meal/MealIngredientsList";
import { useToast } from "../hooks/useToast";
import { useAllergenNames } from "../hooks/useAllergenNames";
import { useFilteredProducts } from "../hooks/useFilteredProducts";
import { useMealNutritionTotals } from "../hooks/useMealNutritionTotals";
import { buildMacros } from "../utils/mealMacros";
import type { ProductData, RestrictionsData, TexturesData, DietData } from "../types";

interface CreateMealPageProps {
  /** Controls the sidebar open/close state from the parent layout. */
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateMealPage: React.FC<CreateMealPageProps> = ({ setIsSideMenuOpen }) => {
  // ── Remote data ───────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductData[]>([]);
  const [restrictionsData, setRestrictionsData] = useState<RestrictionsData[]>([]);
  const [texturesData, setTexturesData] = useState<TexturesData[]>([]);
  const [diets, setDiets] = useState<DietData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filter state ──────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<number[]>([]);
  const [showMayContain, setShowMayContain] = useState(false);

  // ── Meal builder state ────────────────────────────────────────────────────────
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [selectedDietId, setSelectedDietId] = useState<number | "">("");
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, dismissToast } = useToast();

  // ── Data fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/products`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/texture`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/diets`).then((r) => r.json()),
    ])
      .then(([pd, sd, td, dd]) => {
        setProducts(pd); setRestrictionsData(sd); setTexturesData(td); setDiets(dd);
        setLoading(false);
      })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  // ── Hooks: filtering + totals ─────────────────────────────────────────────────
  const activeAllergenNames = useAllergenNames(selectedRestrictions, restrictionsData);
  const availableProducts = useFilteredProducts(products, {
    searchTerm,
    allergenNames: activeAllergenNames,
    showMayContain,
    selectedTextures,
    texturesData,
  });
  const totals = useMealNutritionTotals(selectedProducts);
  const macros = buildMacros(totals);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const addProductToMeal = (p: ProductData) => setSelectedProducts((prev) => [...prev, p]);
  const removeProduct = (i: number) =>
    setSelectedProducts((prev) => prev.filter((_, idx) => idx !== i));
  const toggleRestriction = (id: number) =>
    setSelectedRestrictions((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleTexture = (id: number) =>
    setSelectedTextures((prev) => (prev.includes(id) ? [] : [id]));

  /** Sends the composed meal to the backend and resets the builder on success. */
  const handleSave = async () => {
    if (!mealName.trim() || selectedProducts.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: mealName.trim(),
          description: mealDescription.trim(),
          diet_id: selectedDietId || null,
          product_ids: selectedProducts.map((p) => Number(p.id)),
          nutrition: totals,
          filters: {
            restriction_ids: selectedRestrictions,
            texture_ids: selectedTextures,
            show_may_contain: showMayContain,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "שגיאה לא ידועה");
      showToast(`הארוחה "\u202A${mealName.trim()}\u202C" נשמרה בהצלחה!`, "success");
      setMealName(""); setMealDescription(""); setSelectedDietId(""); setSelectedProducts([]);
    } catch (err: any) {
      showToast(`שגיאה בשמירה: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <LoadingGuard loading={loading} error={error} loadingText="טוען נתונים...">
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans" dir="rtl">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}
        <div className="w-full mx-auto space-y-6">
          <TopBar title="הרכבת ארוחה חדשה" setIsSideMenuOpen={setIsSideMenuOpen} />

          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Pane A — nutrition summary + ingredients list */}
            <div className="flex-1 flex flex-col gap-6 w-full xl:sticky xl:top-6 xl:h-[1000px] min-h-0">
              <div className="shrink-0">
                <MealNutritionSummary totalCalories={totals.calories} macros={macros} />
              </div>
              <div className="flex-1 min-h-0">
                <MealIngredientsList
                  selectedProducts={selectedProducts}
                  saving={saving}
                  canSave={selectedProducts.length > 0 && mealName.trim().length > 0}
                  onRemove={removeProduct}
                  onClearAll={() => setSelectedProducts([])}
                  onSave={handleSave}
                />
              </div>
            </div>

            {/* Pane B — meal details form + product library */}
            <div className="w-full xl:w-[46%] flex flex-col gap-6 xl:sticky xl:top-6 xl:h-[1000px] min-h-0">
              <div className="shrink-0">
                <MealDetailsForm
                  mealName={mealName}
                  mealDescription={mealDescription}
                  selectedDietId={selectedDietId}
                  diets={diets}
                  onMealNameChange={setMealName}
                  onMealDescriptionChange={setMealDescription}
                  onDietChange={setSelectedDietId}
                />
              </div>
              <div className="flex-1 min-h-0">
                <ProductLibrary
                  availableProducts={availableProducts}
                  restrictionsData={restrictionsData}
                  texturesData={texturesData}
                  searchTerm={searchTerm}
                  selectedRestrictions={selectedRestrictions}
                  selectedTextures={selectedTextures}
                  showMayContain={showMayContain}
                  onSearchChange={setSearchTerm}
                  onToggleRestriction={toggleRestriction}
                  onToggleTexture={toggleTexture}
                  onToggleMayContain={() => setShowMayContain((v) => !v)}
                  onAddProduct={addProductToMeal}
                />
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 5px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        `}</style>
      </div>
    </LoadingGuard>
  );
};

export default CreateMealPage;
