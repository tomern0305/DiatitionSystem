import React from "react";
import type { ProductData, RestrictionsData, TexturesData } from "../../types";

/** A product enriched with computed allergen warnings for display purposes. */
export interface AnnotatedProduct extends ProductData {
  _warnings: string[];
}

interface ProductLibraryProps {
  /** Filtered + annotated products ready for display. */
  availableProducts: AnnotatedProduct[];
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  searchTerm: string;
  selectedRestrictions: number[];
  selectedTextures: number[];
  showMayContain: boolean;
  onSearchChange: (v: string) => void;
  onToggleRestriction: (id: number) => void;
  onToggleTexture: (id: number) => void;
  onToggleMayContain: () => void;
  /** Called when the user clicks on a product row to add it to the meal. */
  onAddProduct: (p: ProductData) => void;
}

const ProductLibrary: React.FC<ProductLibraryProps> = ({
  availableProducts,
  restrictionsData,
  texturesData,
  searchTerm,
  selectedRestrictions,
  selectedTextures,
  showMayContain,
  onSearchChange,
  onToggleRestriction,
  onToggleTexture,
  onToggleMayContain,
  onAddProduct,
}) => {
  return (
    <div
      className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden"
    >
      {/* ── Header + search ──────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">מאגר מוצרים</h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {availableProducts.length} מוצרים
          </span>
        </div>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="חיפוש מוצר..."
            className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-gray-100 shrink-0 flex flex-row flex-wrap gap-x-8 gap-y-4 items-start">
        {/* Allergens */}
        <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-800 font-bold flex items-center gap-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-red-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                />
              </svg>
              רגישויות ואלרגיות
            </h3>
            <button
              onClick={onToggleMayContain}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-200 border ${showMayContain ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"}`}
            >
              {showMayContain ? "כולל 'עלול להכיל'" : "הכלל 'עלול להכיל'"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {restrictionsData.map((r) => (
              <button
                key={r.id}
                onClick={() => onToggleRestriction(r.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                  selectedRestrictions.includes(r.id)
                    ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Textures */}
        {texturesData.length > 0 && (
          <div className="flex flex-col gap-2 flex-1 min-w-[180px] border-r border-gray-100 pr-6">
            <h3 className="text-gray-800 font-bold flex items-center gap-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
              מרקמים
            </h3>
            <div className="flex flex-wrap gap-2">
              {texturesData.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onToggleTexture(t.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                    selectedTextures.includes(t.id)
                      ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Product rows ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
        {availableProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 py-16">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
              />
            </svg>
            <p className="text-gray-500 font-medium">לא נמצאו מוצרים תואמים</p>
          </div>
        ) : (
          availableProducts.map((p) => {
            const hasWarning = p._warnings.length > 0;
            return (
              <div
                key={p.id}
                onClick={() => onAddProduct(p)}
                className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-all duration-200 group ${
                  hasWarning
                    ? "bg-orange-50 hover:bg-orange-100/60"
                    : "hover:bg-blue-50/40"
                }`}
              >
                {/* Image / initials */}
                {p.image ? (
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-12 h-12 shrink-0 rounded-xl object-cover border border-gray-100 mt-0.5"
                  />
                ) : (
                  <div
                    className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-bold text-base mt-0.5 ${hasWarning ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}
                  >
                    {p.name.trim().substring(0, 2)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  {/* Name + calories */}
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <h4
                      className={`font-bold text-base truncate transition-colors ${hasWarning ? "text-orange-800" : "text-gray-800 group-hover:text-blue-700"}`}
                    >
                      {p.name}
                    </h4>
                    <span className="shrink-0 text-sm font-bold text-gray-700">
                      {p.calories?.toFixed(0)}{" "}
                      <span className="font-normal text-gray-400 text-xs">
                        קל'
                      </span>
                    </span>
                  </div>

                  {/* May-contain warning */}
                  {hasWarning && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 text-orange-500 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <span className="text-xs text-orange-600 font-semibold">
                        עלול להכיל: {p._warnings.join(", ")}
                      </span>
                    </div>
                  )}

                  {/* Macro grid */}
                  <div className="grid grid-cols-3 gap-x-4 text-sm text-gray-500">
                    <span>
                      חלבון{" "}
                      <strong className="text-gray-700 font-semibold">
                        {p.protein?.toFixed(1) ?? 0}ג'
                      </strong>
                    </span>
                    <span>
                      פחמימה{" "}
                      <strong className="text-gray-700 font-semibold">
                        {p.carbs?.toFixed(1) ?? 0}ג'
                      </strong>
                    </span>
                    <span>
                      שומן{" "}
                      <strong className="text-gray-700 font-semibold">
                        {p.fat?.toFixed(1) ?? 0}ג'
                      </strong>
                    </span>
                    <span>
                      סוכרים{" "}
                      <strong className="text-gray-700 font-semibold">
                        {p.sugares?.toFixed(1) ?? 0}ג'
                      </strong>
                    </span>
                    <span>
                      נתרן{" "}
                      <strong className="text-gray-700 font-semibold">
                        {p.sodium?.toFixed(1) ?? 0}מ"ג
                      </strong>
                    </span>
                    {p.texture && (
                      <span>
                        מרקם{" "}
                        <strong className="text-gray-700 font-semibold">
                          {p.texture}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Add indicator */}
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 mt-2 transition-all duration-200 ${
                    hasWarning
                      ? "border-orange-300 text-orange-300 group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white"
                      : "border-gray-200 text-gray-300 group-hover:bg-blue-500 group-hover:border-blue-500 group-hover:text-white"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductLibrary;
