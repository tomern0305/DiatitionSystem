import React, { useState, useEffect, useMemo } from "react";
import TopBar from "../components/ui/TopBar";
import Loader from "../components/ui/Loader";
import Toast from "../components/ui/Toast";
import MealDetailsForm from "../components/meal/MealDetailsForm";
import MealNutritionSummary from "../components/meal/MealNutritionSummary";
import MealIngredientsList from "../components/meal/MealIngredientsList";
import ProductLibrary from "../components/meal/ProductLibrary";
import type {
  MealData,
  ProductData,
  DietData,
  RestrictionsData,
  TexturesData,
} from "../types";
import type { AnnotatedProduct } from "../components/meal/ProductLibrary";
import type { ToastType } from "../components/ui/Toast";

interface MealsCatalogPageProps {
  /** Controls the sidebar open/close state from the parent layout. */
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

/** Computes macro descriptor array from a nutrition object — same shape used in CreateMealPage. */
function buildMacros(nutrition: MealData["nutrition"]) {
  return [
    { label: "חלבון", value: nutrition.protein, unit: "ג'", color: "#3b82f6" },
    { label: "פחמימה", value: nutrition.carbs, unit: "ג'", color: "#10b981" },
    { label: "שומן", value: nutrition.fat, unit: "ג'", color: "#f59e0b" },
    { label: "סוכרים", value: nutrition.sugares, unit: "ג'", color: "#ec4899" },
    { label: "נתרן", value: nutrition.sodium, unit: 'מ"ג', color: "#8b5cf6" },
  ];
}

const MealsCatalogPage: React.FC<MealsCatalogPageProps> = ({
  setIsSideMenuOpen,
}) => {
  // ── Remote data ───────────────────────────────────────────────────────────────
  const [meals, setMeals] = useState<MealData[]>([]);
  const [diets, setDiets] = useState<DietData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [restrictionsData, setRestrictionsData] = useState<RestrictionsData[]>(
    [],
  );
  const [texturesData, setTexturesData] = useState<TexturesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Feedback ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // ── Edit drawer: meal form state ──────────────────────────────────────────────
  const [editMeal, setEditMeal] = useState<MealData | null>(null);
  const [editProducts, setEditProducts] = useState<ProductData[]>([]);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDietId, setEditDietId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  // ── Edit drawer: product library filter state ─────────────────────────────────
  const [libSearch, setLibSearch] = useState("");
  const [libRestrictions, setLibRestrictions] = useState<number[]>([]);
  const [libTextures, setLibTextures] = useState<number[]>([]);
  const [libShowMayContain, setLibShowMayContain] = useState(false);

  // ── Catalog filter / sort state ──────────────────────────────────────────────
  /** null = show all diets; a number = show only that diet */
  const [filterDietId, setFilterDietId] = useState<number | null>(null);
  /** When true sort alphabetically by meal name */
  const [sortAZ, setSortAZ] = useState(false);

  // ── Derived: filtered + sorted meals for display ────────────────────────────
  const displayedMeals = useMemo(() => {
    let list =
      filterDietId === null
        ? meals
        : meals.filter((m) => m.diet_id === filterDietId);
    if (sortAZ)
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "he"));
    return list;
  }, [meals, filterDietId, sortAZ]);

  // ── Data fetch ───────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/meals`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/diets`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/products`).then((r) =>
        r.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`).then((r) =>
        r.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/texture`).then((r) =>
        r.json(),
      ),
    ])
      .then(([md, dd, pd, sd, td]) => {
        setMeals(md);
        setDiets(dd);
        setProducts(pd);
        setRestrictionsData(sd);
        setTexturesData(td);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // ── Product lookup map ───────────────────────────────────────────────────────
  /** Fast id→product lookup used to resolve meal product_ids to ProductData. */
  const productMap = useMemo(
    () => new Map(products.map((p) => [Number(p.id), p])),
    [products],
  );

  // ── Library: active allergen names ───────────────────────────────────────────
  const libAllergenNames = useMemo(
    () =>
      libRestrictions
        .map((id) => restrictionsData.find((r) => r.id === id)?.name)
        .filter((n): n is string => !!n),
    [libRestrictions, restrictionsData],
  );

  // ── Library: filtered + annotated products ───────────────────────────────────
  const availableProducts = useMemo((): AnnotatedProduct[] => {
    return products
      .map((p) => ({
        ...p,
        _warnings: libAllergenNames.filter((a) => p.mayContain?.includes(a)),
      }))
      .filter((p) => {
        if (libSearch && !p.name.includes(libSearch)) return false;
        if (
          libAllergenNames.length > 0 &&
          p.contains?.some((a) => libAllergenNames.includes(a))
        )
          return false;
        if (!libShowMayContain && p._warnings.length > 0) return false;
        if (libTextures.length > 0) {
          const texName = texturesData.find(
            (t) => t.id === libTextures[0],
          )?.name;
          if (texName && p.texture !== texName) return false;
        }
        return true;
      });
  }, [
    products,
    libSearch,
    libAllergenNames,
    libShowMayContain,
    libTextures,
    texturesData,
  ]);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("האם למחוק ארוחה זו לצמיתות?")) return;
    setDeleting(id);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/meals/${id}`,
        { method: "DELETE" },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      setToast({ message: "הארוחה נמחקה בהצלחה", type: "success" });
    } catch (e: any) {
      setToast({ message: `שגיאה במחיקה: ${e.message}`, type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  // ── Open / close edit drawer ─────────────────────────────────────────────────
  const openEdit = (meal: MealData) => {
    setEditMeal(meal);
    setEditName(meal.name);
    setEditDesc(meal.description ?? "");
    setEditDietId(meal.diet_id ?? "");
    setEditProducts(
      meal.product_ids
        .map((id) => productMap.get(id))
        .filter(Boolean) as ProductData[],
    );
    // Reset library filters on open
    setLibSearch("");
    setLibRestrictions([]);
    setLibTextures([]);
    setLibShowMayContain(false);
  };
  const closeEdit = () => setEditMeal(null);

  // ── Edit: live nutrition totals ──────────────────────────────────────────────
  const editTotals = useMemo(
    () =>
      editProducts.reduce(
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
    [editProducts],
  );

  // ── Save edit ────────────────────────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editMeal || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/meals/${editMeal.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName.trim(),
            description: editDesc,
            diet_id: editDietId || null,
            product_ids: editProducts.map((p) => Number(p.id)),
            nutrition: editTotals,
            filters: editMeal.filters,
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setMeals((prev) =>
        prev.map((m) =>
          m.id === editMeal.id
            ? {
                ...m,
                name: editName.trim(),
                description: editDesc,
                diet_id: editDietId as number | null,
                diet_name: diets.find((d) => d.id === editDietId)?.name ?? null,
                product_ids: editProducts.map((p) => Number(p.id)),
                nutrition: editTotals,
              }
            : m,
        ),
      );
      setToast({
        message: `הארוחה "${editName.trim()}" עודכנה בהצלחה!`,
        type: "success",
      });
      closeEdit();
    } catch (e: any) {
      setToast({ message: `שגיאה בשמירה: ${e.message}`, type: "error" });
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
        <Loader text="טוען ארוחות..." />
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
        <TopBar title="קטלוג ארוחות" setIsSideMenuOpen={setIsSideMenuOpen}>
          {meals.length > 0 && (
            <>
              {/* Diet chips */}
              <button
                onClick={() => setFilterDietId(null)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  filterDietId === null
                    ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
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
                    onClick={() =>
                      setFilterDietId(filterDietId === d.id ? null : d.id)
                    }
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      filterDietId === d.id
                        ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {d.name}
                  </button>
                ))}

              {/* Divider */}
              <div className="w-px h-6 bg-gray-200" />

              {/* Sort A-Z */}
              <button
                onClick={() => setSortAZ((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                  sortAZ
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-md shadow-indigo-500/20"
                    : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12"
                  />
                </svg>
                א-ב
              </button>

              {/* Count */}
              <span className="text-sm text-gray-400 font-medium">
                {displayedMeals.length} ארוחות
              </span>
            </>
          )}
        </TopBar>

        {/* ── Empty state ──────────────────────────────────────────────────── */}
        {meals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-xl font-semibold text-gray-500">
              טרם נוצרו ארוחות
            </p>
            <p className="text-sm">עבור ל"הרכבת ארוחה" כדי ליצור את הראשונה</p>
          </div>
        )}

        {/* ── Meal cards grid ──────────────────────────────────────────────── */}
        {displayedMeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {displayedMeals.map((meal) => {
              const macros = buildMacros(meal.nutrition);
              return (
                <div
                  key={meal.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  {/* Card header */}
                  <div className="px-5 py-4 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg leading-snug truncate">
                          {meal.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {meal.diet_name && (
                            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              {meal.diet_name}
                            </span>
                          )}
                          {meal.filters.restriction_ids.map((rid) => {
                            const rname = restrictionsData.find(
                              (r) => r.id === rid,
                            )?.name;
                            return rname ? (
                              <span
                                key={rid}
                                className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full"
                              >
                                ⚠ {rname}
                              </span>
                            ) : null;
                          })}
                          {meal.filters.texture_ids.map((tid) => {
                            const tname = texturesData.find(
                              (t) => t.id === tid,
                            )?.name;
                            return tname ? (
                              <span
                                key={tid}
                                className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full"
                              >
                                {tname}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(meal)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          aria-label="ערוך ארוחה"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          disabled={deleting === meal.id}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                          aria-label="מחק ארוחה"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    {meal.description && (
                      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">
                        {meal.description}
                      </p>
                    )}
                  </div>

                  {/* Nutrition mini-summary */}
                  <div className="px-5 py-4 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-black text-gray-800">
                        {meal.nutrition.calories.toFixed(0)}
                        <span className="text-sm font-normal text-gray-400 mr-1">
                          קל'
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {meal.product_ids.length} מרכיבים
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {macros.map((m) => (
                        <div
                          key={m.label}
                          className="bg-gray-50 rounded-lg px-2 py-1.5 border border-gray-100"
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <div
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: m.color }}
                            />
                            <span className="text-xs text-gray-500 truncate">
                              {m.label}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-gray-800">
                            {m.value.toFixed(1)}
                            <span className="text-gray-400 font-normal">
                              {" "}
                              {m.unit}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="px-5 py-2.5 border-t border-gray-50 bg-gray-50/50">
                    <span className="text-xs text-gray-400">
                      {new Date(meal.created_at).toLocaleDateString("he-IL", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          EDIT DRAWER — full-screen two-pane:
          Right pane: ProductLibrary (search + filters + products)
          Left pane:  MealNutritionSummary + MealDetailsForm + MealIngredientsList
      ══════════════════════════════════════════════════════════════════════ */}
      {editMeal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeEdit}
          />

          {/* Full-width drawer */}
          <div
            className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-slide-in-down"
            dir="rtl"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-gray-800 text-xl">
                עריכה: <span className="text-blue-600">{editMeal.name}</span>
              </h2>
              <button
                onClick={closeEdit}
                className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="סגור"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Two-pane body */}
            <div className="flex-1 flex flex-col xl:flex-row gap-0 overflow-hidden">
              {/* ── Right pane: builder cards ─────────────────────────────────── */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                <MealNutritionSummary
                  totalCalories={editTotals.calories}
                  macros={buildMacros(editTotals)}
                />
                <MealDetailsForm
                  mealName={editName}
                  mealDescription={editDesc}
                  selectedDietId={editDietId}
                  diets={diets}
                  onMealNameChange={setEditName}
                  onMealDescriptionChange={setEditDesc}
                  onDietChange={setEditDietId}
                />
                <MealIngredientsList
                  selectedProducts={editProducts}
                  saving={saving}
                  canSave={
                    editProducts.length > 0 && editName.trim().length > 0
                  }
                  onRemove={(i) =>
                    setEditProducts((prev) =>
                      prev.filter((_, idx) => idx !== i),
                    )
                  }
                  onClearAll={() => setEditProducts([])}
                  onSave={handleSaveEdit}
                />
              </div>

              {/* ── Left pane: Product Library ────────────────────────────────── */}
              <div className="xl:w-[60%] flex flex-col border-r border-gray-100 overflow-hidden h-full">
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
                      prev.includes(id)
                        ? prev.filter((x) => x !== id)
                        : [...prev, id],
                    )
                  }
                  onToggleTexture={(id) =>
                    setLibTextures((prev) => (prev.includes(id) ? [] : [id]))
                  }
                  onToggleMayContain={() => setLibShowMayContain((v) => !v)}
                  onAddProduct={(p) => setEditProducts((prev) => [...prev, p])}
                />
              </div>
            </div>
          </div>
        </>
      )}

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
    </div>
  );
};

export default MealsCatalogPage;
