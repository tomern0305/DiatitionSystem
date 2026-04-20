import React from "react";
import MealDetailsForm from "./MealDetailsForm";
import MealNutritionSummary from "./MealNutritionSummary";
import MealIngredientsList from "./MealIngredientsList";
import ProductLibrary from "./ProductLibrary";
import { buildMacros } from "../../utils/mealMacros";
import type { MealData, ProductData, DietData, RestrictionsData, TexturesData } from "../../types";
import type { AnnotatedProduct } from "./ProductLibrary";

interface MealEditDrawerProps {
  meal: MealData;
  editProducts: ProductData[];
  editName: string;
  editDesc: string;
  editDietId: number | "";
  editTotals: MealData["nutrition"];
  diets: DietData[];
  availableProducts: AnnotatedProduct[];
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  libSearch: string;
  libRestrictions: number[];
  libTextures: number[];
  libShowMayContain: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onNameChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onDietChange: (v: number | "") => void;
  onRemoveProduct: (i: number) => void;
  onClearProducts: () => void;
  onAddProduct: (p: ProductData) => void;
  onSearchChange: (v: string) => void;
  onToggleRestriction: (id: number) => void;
  onToggleTexture: (id: number) => void;
  onToggleMayContain: () => void;
}

/** Full-screen two-pane drawer for editing an existing meal. */
const MealEditDrawer: React.FC<MealEditDrawerProps> = ({
  meal, editProducts, editName, editDesc, editDietId, editTotals,
  diets, availableProducts, restrictionsData, texturesData,
  libSearch, libRestrictions, libTextures, libShowMayContain,
  saving, onClose, onSave, onNameChange, onDescChange, onDietChange,
  onRemoveProduct, onClearProducts, onAddProduct,
  onSearchChange, onToggleRestriction, onToggleTexture, onToggleMayContain,
}) => (
  <>
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col animate-slide-in-down" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 shrink-0">
        <h2 className="font-bold text-gray-800 text-xl">
          עריכה: <span className="text-blue-600">{meal.name}</span>
        </h2>
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

      {/* Two-pane body */}
      <div className="flex-1 flex flex-col xl:flex-row gap-0 overflow-hidden">
        {/* Right pane: builder cards */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
          <MealNutritionSummary totalCalories={editTotals.calories} macros={buildMacros(editTotals)} />
          <MealDetailsForm
            mealName={editName}
            mealDescription={editDesc}
            selectedDietId={editDietId}
            diets={diets}
            onMealNameChange={onNameChange}
            onMealDescriptionChange={onDescChange}
            onDietChange={onDietChange}
          />
          <MealIngredientsList
            selectedProducts={editProducts}
            saving={saving}
            canSave={editProducts.length > 0 && editName.trim().length > 0}
            onRemove={onRemoveProduct}
            onClearAll={onClearProducts}
            onSave={onSave}
          />
        </div>

        {/* Left pane: product library */}
        <div className="xl:w-[60%] flex flex-col border-r border-gray-100 overflow-hidden h-full">
          <ProductLibrary
            availableProducts={availableProducts}
            restrictionsData={restrictionsData}
            texturesData={texturesData}
            searchTerm={libSearch}
            selectedRestrictions={libRestrictions}
            selectedTextures={libTextures}
            showMayContain={libShowMayContain}
            onSearchChange={onSearchChange}
            onToggleRestriction={onToggleRestriction}
            onToggleTexture={onToggleTexture}
            onToggleMayContain={onToggleMayContain}
            onAddProduct={onAddProduct}
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

export default MealEditDrawer;
