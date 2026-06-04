import type { RestrictionsData, TexturesData } from "../../types";
import type { ProductFilters } from "../../hooks/useProductFilters";

interface FilterBarProps {
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  filters: ProductFilters;
  /** Show the "may contain" toggle column (dietitian view only) */
  showMayContainToggle?: boolean;
}

const FilterBar = ({ restrictionsData, texturesData, filters, showMayContainToggle = false }: FilterBarProps) => {
  if (restrictionsData.length === 0) return null;

  const {
    selectedRestrictions,
    selectedTextures,
    showMayContain,
    handleRestrictionToggle,
    handleTextureToggle,
    setShowMayContain,
    clearFilters,
    hasActiveFilters,
  } = filters;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-row flex-wrap gap-x-12 gap-y-8 items-start">
      {showMayContainToggle && (
        <div className="flex flex-col gap-3 min-w-[250px] flex-1">
          <h3 className="text-gray-800 font-bold flex items-center gap-2 m-0 p-0 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            מעורבב / עלול להכיל
          </h3>
          <div className="flex flex-wrap gap-2 mt-1">
            <button
              onClick={() => setShowMayContain(!showMayContain)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                showMayContain
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
              }`}
            >
              הצג מוצרים שעלולים להכיל
            </button>
          </div>
        </div>
      )}

      {/* Sensitivities */}
      <div className="flex flex-col gap-3 min-w-[250px] flex-1 border-r border-gray-100 pr-0 sm:pr-8">
        <h3 className="text-gray-800 font-bold flex items-center gap-2 m-0 p-0 text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-red-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          סינון רגישויות
        </h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {restrictionsData.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRestrictionToggle(r.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
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
        <div className="flex flex-col gap-3 min-w-[250px] flex-1 border-r border-gray-100 pr-0 sm:pr-8">
          <h3 className="text-gray-800 font-bold flex items-center gap-2 m-0 p-0 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            סינון מרקמים
          </h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {texturesData.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTextureToggle(t.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
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

      {/* Clear */}
      <button
        onClick={clearFilters}
        disabled={!hasActiveFilters}
        className="self-start px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed border-red-200 bg-red-50 text-red-600 hover:enabled:bg-red-100 hover:enabled:border-red-300"
      >
        נקה סינון
      </button>
    </div>
  );
};

export default FilterBar;
