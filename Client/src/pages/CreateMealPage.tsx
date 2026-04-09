import React, { useState, useEffect, useMemo } from "react";
import TopBar from "../components/layout/TopBar";
import Loader from "../components/layout/Loader";
import Toast from "../components/layout/Toast";
import type { ToastType } from "../components/layout/Toast";
import ProductLibrary from "../components/meal/ProductLibrary";
import MealNutritionSummary from "../components/meal/MealNutritionSummary";
import MealDetailsForm from "../components/meal/MealDetailsForm";
import MealIngredientsList from "../components/meal/MealIngredientsList";
import type {
  ProductData,
  RestrictionsData,
  TexturesData,
  DietData,
} from "../types";
import type { AnnotatedProduct } from "../components/meal/ProductLibrary";

interface CreateMealPageProps {
  /** Controls the sidebar open/close state from the parent layout. */
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateMealPage: React.FC<CreateMealPageProps> = ({
  setIsSideMenuOpen,
}) => {
  // ── Remote data ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductData[]>([]);
  const [restrictionsData, setRestrictionsData] = useState<RestrictionsData[]>(
    [],
  );
  const [texturesData, setTexturesData] = useState<TexturesData[]>([]);
  const [diets, setDiets] = useState<DietData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>(
    [],
  );
  const [selectedTextures, setSelectedTextures] = useState<number[]>([]);
  /** When true, products that "may contain" filtered allergens are shown but flagged. */
  const [showMayContain, setShowMayContain] = useState(false);

  // ── Meal builder state ────────────────────────────────────────────────────────
  const [mealName, setMealName] = useState("");
  const [mealDescription, setMealDescription] = useState("");
  const [selectedDietId, setSelectedDietId] = useState<number | "">("");
  const [selectedProducts, setSelectedProducts] = useState<ProductData[]>([]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // ── Data fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/products`).then((r) =>
        r.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`).then((r) =>
        r.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/texture`).then((r) =>
        r.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/diets`).then((r) => r.json()),
    ])
      .then(([pd, sd, td, dd]) => {
        setProducts(pd);
        setRestrictionsData(sd);
        setTexturesData(td);
        setDiets(dd);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ── Derived: active allergen names ───────────────────────────────────────────
  const activeAllergenNames = useMemo(
    () =>
      selectedRestrictions
        .map((id) => restrictionsData.find((r) => r.id === id)?.name)
        .filter((n): n is string => !!n),
    [selectedRestrictions, restrictionsData],
  );

  // ── Derived: filtered + annotated product list ───────────────────────────────
  const availableProducts = useMemo((): AnnotatedProduct[] => {
    return products
      .map((p) => ({
        ...p,
        _warnings: activeAllergenNames.filter((a) => p.mayContain?.includes(a)),
      }))
      .filter((p) => {
        if (searchTerm && !p.name.includes(searchTerm)) return false;
        if (
          activeAllergenNames.length > 0 &&
          p.contains?.some((a) => activeAllergenNames.includes(a))
        )
          return false;
        if (!showMayContain && p._warnings.length > 0) return false;
        if (selectedTextures.length > 0) {
          const texName = texturesData.find(
            (t) => t.id === selectedTextures[0],
          )?.name;
          if (texName && p.texture !== texName) return false;
        }
        return true;
      });
  }, [
    products,
    searchTerm,
    activeAllergenNames,
    showMayContain,
    selectedTextures,
    texturesData,
  ]);

  // ── Derived: nutrition totals ────────────────────────────────────────────────
  const totals = useMemo(
    () =>
      selectedProducts.reduce(
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
    [selectedProducts],
  );

  /** Macro descriptor array passed to MealNutritionSummary. */
  const macros = [
    { label: "חלבון", value: totals.protein, unit: "ג'", color: "#3b82f6" },
    { label: "פחמימה", value: totals.carbs, unit: "ג'", color: "#10b981" },
    { label: "שומן", value: totals.fat, unit: "ג'", color: "#f59e0b" },
    { label: "סוכרים", value: totals.sugares, unit: "ג'", color: "#ec4899" },
    { label: "נתרן", value: totals.sodium, unit: 'מ"ג', color: "#8b5cf6" },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const addProductToMeal = (p: ProductData) =>
    setSelectedProducts((prev) => [...prev, p]);
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
          nutrition: {
            calories: totals.calories,
            protein: totals.protein,
            carbs: totals.carbs,
            fat: totals.fat,
            sugares: totals.sugares,
            sodium: totals.sodium,
          },
          filters: {
            restriction_ids: selectedRestrictions,
            texture_ids: selectedTextures,
            show_may_contain: showMayContain,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "שגיאה לא ידועה");
      setToast({
        message: `הארוחה "‪${mealName.trim()}‬" נשמרה בהצלחה!`,
        type: "success",
      });
      setMealName("");
      setMealDescription("");
      setSelectedDietId("");
      setSelectedProducts([]);
    } catch (err: any) {
      setToast({ message: `שגיאה בשמירה: ${err.message}`, type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────────
  if (loading)
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50"
        dir="rtl"
      >
        <Loader text="טוען נתונים..." />
      </div>
    );
  if (error)
    return (
      <div
        className="min-h-screen flex items-center justify-center text-red-500"
        dir="rtl"
      >
        <p className="text-xl">שגיאה: {error}</p>
      </div>
    );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans"
      dir="rtl"
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      <div className="w-full mx-auto space-y-6">
        <TopBar
          title="הרכבת ארוחה חדשה"
          setIsSideMenuOpen={setIsSideMenuOpen}
        />

        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* Pane A — builder: summary (short) + ingredients (flex-1) */}
          <div className="flex-1 flex flex-col gap-6 w-full xl:sticky xl:top-6 xl:h-[1000px] min-h-0">
            <div className="shrink-0">
              <MealNutritionSummary
                totalCalories={totals.calories}
                macros={macros}
              />
            </div>
            <div className="flex-1 min-h-0">
              <MealIngredientsList
                selectedProducts={selectedProducts}
                saving={saving}
                canSave={
                  selectedProducts.length > 0 && mealName.trim().length > 0
                }
                onRemove={removeProduct}
                onClearAll={() => setSelectedProducts([])}
                onSave={handleSave}
              />
            </div>
          </div>

          {/* Pane B — library: form (short) + product library (flex-1) */}
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
  );
};

export default CreateMealPage;
