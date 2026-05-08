import React, { useState, useEffect, useMemo } from "react";
import TopBar from "../components/layout/TopBar";
import Toast from "../components/layout/Toast";
import LoadingGuard from "../components/layout/LoadingGuard";
import MealCard from "../components/meal/MealCard";
import MealEditDrawer from "../components/meal/MealEditDrawer";
import MealCreateDrawer from "../components/meal/MealCreateDrawer";
import MealCatalogFilters from "../components/meal/MealCatalogFilters";
import { useToast } from "../hooks/useToast";
import { useAllergenNames } from "../hooks/useAllergenNames";
import { useFilteredProducts } from "../hooks/useFilteredProducts";
import { useMealNutritionTotals } from "../hooks/useMealNutritionTotals";
import { useAuth } from '../context/AuthContext';
import type { MealData, ProductData, DietData, RestrictionsData, TexturesData } from "../types";

interface MealsCatalogPageProps {
  /** Controls the sidebar open/close state from the parent layout. */
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const MealsCatalogPage: React.FC<MealsCatalogPageProps> = ({ setIsSideMenuOpen }) => {
  // ── Remote data ───────────────────────────────────────────────────────────────
  const [meals, setMeals] = useState<MealData[]>([]);
  const [diets, setDiets] = useState<DietData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [restrictionsData, setRestrictionsData] = useState<RestrictionsData[]>([]);
  const [texturesData, setTexturesData] = useState<TexturesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Feedback ──────────────────────────────────────────────────────────────────
  const { toast, showToast, dismissToast } = useToast();
  const [deleting, setDeleting] = useState<number | null>(null);

  // ── Create drawer state ───────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);

  // ── Edit drawer state ─────────────────────────────────────────────────────────
  const [editMeal, setEditMeal] = useState<MealData | null>(null);
  const [editProducts, setEditProducts] = useState<ProductData[]>([]);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDietId, setEditDietId] = useState<number | "">("");
  const [saving, setSaving] = useState(false);

  // ── Library filter state ──────────────────────────────────────────────────────
  const [libSearch, setLibSearch] = useState("");
  const [libRestrictions, setLibRestrictions] = useState<number[]>([]);
  const [libTextures, setLibTextures] = useState<number[]>([]);
  const [libShowMayContain, setLibShowMayContain] = useState(false);

  // ── Catalog filter / sort state ───────────────────────────────────────────────
  const [filterDietId, setFilterDietId] = useState<number | null>(null);
  const [sortAZ, setSortAZ] = useState(false);

  // ── User Role Type - Helps to hide buttons
  const { user } = useAuth();
  type UserRole = 'admin' | 'line' | 'dietitian';
  const userType = user?.role as UserRole;

  // ── Derived: filtered + sorted meals ─────────────────────────────────────────
  const displayedMeals = useMemo(() => {
    let list = filterDietId === null ? meals : meals.filter((m) => m.diet_id === filterDietId);
    if (sortAZ) list = [...list].sort((a, b) => a.name.localeCompare(b.name, "he"));
    return list;
  }, [meals, filterDietId, sortAZ]);

  // ── Data fetch ────────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/meals`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/diets`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/products`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/api/texture`).then((r) => r.json()),
    ])
      .then(([md, dd, pd, sd, td]) => {
        setMeals(md); setDiets(dd); setProducts(pd);
        setRestrictionsData(sd); setTexturesData(td);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  // ── Product lookup map ────────────────────────────────────────────────────────
  const productMap = useMemo(
    () => new Map(products.map((p) => [Number(p.id), p])),
    [products],
  );

  // ── Library filtering ─────────────────────────────────────────────────────────
  const libAllergenNames = useAllergenNames(libRestrictions, restrictionsData);
  const availableProducts = useFilteredProducts(products, {
    searchTerm: libSearch,
    allergenNames: libAllergenNames,
    showMayContain: libShowMayContain,
    selectedTextures: libTextures,
    texturesData,
  });
  const editTotals = useMealNutritionTotals(editProducts);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!window.confirm("האם למחוק ארוחה זו לצמיתות?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meals/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setMeals((prev) => prev.filter((m) => m.id !== id));
      showToast("הארוחה נמחקה בהצלחה", "success");
    } catch (e: any) {
      showToast(`שגיאה במחיקה: ${e.message}`, "error");
    } finally {
      setDeleting(null);
    }
  };

  const openEdit = (meal: MealData) => {
    setEditMeal(meal);
    setEditName(meal.name);
    setEditDesc(meal.description ?? "");
    setEditDietId(meal.diet_id ?? "");
    setEditProducts(
      meal.product_ids.map((id) => productMap.get(id)).filter(Boolean) as ProductData[],
    );
    setLibSearch(""); setLibRestrictions([]); setLibTextures([]); setLibShowMayContain(false);
  };
  const closeEdit = () => setEditMeal(null);

  const handleSaveEdit = async () => {
    if (!editMeal || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/meals/${editMeal.id}`, {
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
      });
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
      showToast(`הארוחה "${editName.trim()}" עודכנה בהצלחה!`, "success");
      closeEdit();
    } catch (e: any) {
      showToast(`שגיאה בשמירה: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <LoadingGuard loading={loading} error={error} loadingText="טוען ארוחות...">
      <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans" dir="rtl">
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />}

        <div className="w-full mx-auto space-y-6">
          <TopBar title="קטלוג ארוחות" setIsSideMenuOpen={setIsSideMenuOpen}>
            {meals.length > 0 && (
              <MealCatalogFilters
                meals={meals}
                diets={diets}
                filterDietId={filterDietId}
                sortAZ={sortAZ}
                displayedCount={displayedMeals.length}
                onFilterDiet={setFilterDietId}
                onToggleSort={() => setSortAZ((v) => !v)}
              />
            )}
            {(userType === 'dietitian' || userType === 'admin') && (
            <button
              onClick={() => setCreateOpen(true)}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-6 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              ארוחה חדשה
            </button>
            )}
          </TopBar>

          {/* Empty state */}
          {meals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xl font-semibold text-gray-500">טרם נוצרו ארוחות</p>
              <p className="text-sm">עבור ל"הרכבת ארוחה" כדי ליצור את הראשונה</p>
            </div>
          )}

          {/* Meal cards grid */}
          {displayedMeals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayedMeals.map((meal) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  productMap={productMap}
                  restrictionsData={restrictionsData}
                  texturesData={texturesData}
                  deleting={deleting}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create drawer */}
        {createOpen && (
          <MealCreateDrawer
            diets={diets}
            products={products}
            restrictionsData={restrictionsData}
            texturesData={texturesData}
            onClose={() => setCreateOpen(false)}
            onCreated={(meal) => setMeals((prev) => [...prev, meal])}
          />
        )}

        {/* Edit drawer */}
        {editMeal && (
          <MealEditDrawer
            meal={editMeal}
            editProducts={editProducts}
            editName={editName}
            editDesc={editDesc}
            editDietId={editDietId}
            editTotals={editTotals}
            diets={diets}
            availableProducts={availableProducts}
            restrictionsData={restrictionsData}
            texturesData={texturesData}
            libSearch={libSearch}
            libRestrictions={libRestrictions}
            libTextures={libTextures}
            libShowMayContain={libShowMayContain}
            saving={saving}
            onClose={closeEdit}
            onSave={handleSaveEdit}
            onNameChange={setEditName}
            onDescChange={setEditDesc}
            onDietChange={setEditDietId}
            onRemoveProduct={(i) => setEditProducts((prev) => prev.filter((_, idx) => idx !== i))}
            onClearProducts={() => setEditProducts([])}
            onAddProduct={(p) => setEditProducts((prev) => [...prev, p])}
            onSearchChange={setLibSearch}
            onToggleRestriction={(id) =>
              setLibRestrictions((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
            onToggleTexture={(id) => setLibTextures((prev) => (prev.includes(id) ? [] : [id]))}
            onToggleMayContain={() => setLibShowMayContain((v) => !v)}
          />
        )}
      </div>
    </LoadingGuard>
  );
};

export default MealsCatalogPage;
