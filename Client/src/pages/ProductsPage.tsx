import { useState } from "react";
import ProductBig from "../components/products/ProductBig";
import FilterBar from "../components/products/FilterBar";
import TopBar from "../components/layout/TopBar";
import Loader from "../components/layout/Loader";
import SuggestedMealsSection from "../components/meal/SuggestedMealsSection";
import SimilarFoodsPopup from "../components/products/SimilarFoodsPopup";
import useProductCatalog from "../hooks/useProductCatalog";
import useProductFilters from "../hooks/useProductFilters";
import useAiEnabled from "../hooks/useAiEnabled";
import useSemanticSearch from "../hooks/useSemanticSearch";
import type { ProductData } from "../types";

interface ProductsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductsPage = ({ setIsSideMenuOpen }: ProductsPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [aiMode, setAiMode] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const [similarAnchor, setSimilarAnchor] = useState<{ product: ProductData; rect: DOMRect } | null>(null);

  const { loading, error, products, restrictionsData, texturesData, getCatalog, getSuggestedMeals } = useProductCatalog(true);
  const filters = useProductFilters();
  const aiEnabled = useAiEnabled();
  const { results: aiResults, loading: aiLoading } = useSemanticSearch(searchTerm, aiMode);

  const handleScrollToProduct = (id: number) => {
    setHighlightedProductId(String(id));
    setTimeout(() => setHighlightedProductId(null), 3000);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <Loader text="טוען מוצרים..." />
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500" dir="rtl">
        <p className="text-xl">שגיאה: {error}</p>
      </div>
    );

  const { presentCategories, productsByCategory } = getCatalog(aiMode ? "" : searchTerm, sortBy);

  const renderCard = (product: ProductData, state: "regular" | "warning", index: number) => (
    <div
      key={product.id}
      id={`product-${product.id}`}
      className="w-full flex justify-center animate-fade-in-up cursor-pointer"
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setSimilarAnchor((prev) => prev?.product.id === product.id ? null : { product, rect });
      }}
    >
      <ProductBig
        name={product.name}
        image={product.image}
        iddsi={product.iddsi}
        calories={product.calories}
        protein={product.protein}
        carbs={product.carbs}
        fat={product.fat}
        sugares={product.sugares}
        sodium={product.sodium}
        contains={product.contains}
        mayContain={product.mayContain}
        texture={product.texture}
        properties={product.properties}
        state={highlightedProductId === product.id ? "selected" : state}
        textureNotes={product.textureNotes}
        allergyNotes={product.allergyNotes}
        forbiddenFor={product.forbiddenFor}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans" dir="rtl">
      <div className="w-full mx-auto space-y-16">
        <TopBar title="קטלוג מוצרים" setIsSideMenuOpen={setIsSideMenuOpen}>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* AI toggle — only when server supports it */}
            {aiEnabled && (
              <button
                onClick={() => { setAiMode((m) => !m); setSearchTerm(""); }}
                title={aiMode ? "עבור לחיפוש רגיל" : "חיפוש חכם עם AI"}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                  aiMode
                    ? "bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                </svg>
                AI
              </button>
            )}

            {/* Search input */}
            <div className="relative flex-1 sm:w-64">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                className={`w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 ${aiMode ? "text-purple-400" : "text-gray-400"}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder={aiMode ? "תאר מה אתה מחפש..." : "חיפוש מוצר או קטגוריה..."}
                className={`w-full pl-4 pr-10 py-2.5 border rounded-xl outline-none transition-all text-sm ${
                  aiMode
                    ? "bg-purple-50 border-purple-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 focus:bg-white"
                    : "bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white"
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {!aiMode && (
            <select
              className="w-full sm:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer text-sm font-medium text-gray-700"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">מיין לפי: רגיל</option>
              <option value="calories_asc">קלוריות (נמוך לגבוה)</option>
              <option value="calories_desc">קלוריות (גבוה לנמוך)</option>
              <option value="protein_desc">חלבון (גבוה לנמוך)</option>
            </select>
          )}
        </TopBar>

        {/* AI results section */}
        {aiMode && (
          <section>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-2xl font-bold text-purple-700 shrink-0">תוצאות חיפוש חכם</span>
              {aiLoading && <span className="text-sm text-purple-400">מחפש...</span>}
              {!aiLoading && aiResults.length > 0 && (
                <span className="text-sm text-gray-400">{aiResults.length} תוצאות</span>
              )}
              <div className="h-px bg-purple-100 flex-grow rounded-full" />
            </div>

            {!aiLoading && searchTerm.length > 3 && aiResults.length === 0 && (
              <p className="text-gray-400 text-center py-10">לא נמצאו תוצאות תואמות</p>
            )}
            {!searchTerm && (
              <p className="text-gray-400 text-center py-10">הקלד תיאור חופשי כדי לחפש — לדוגמה: "עשיר בחלבון ודל שומן"</p>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-items-center">
              {aiResults.map((product, index) => renderCard(product, "regular", index))}
            </div>
          </section>
        )}

        {/* Regular catalog */}
        {!aiMode && (
          <>
            <FilterBar
              restrictionsData={restrictionsData}
              texturesData={texturesData}
              filters={filters}
              showMayContainToggle
            />

            <SuggestedMealsSection
              meals={getSuggestedMeals(filters.selectedRestrictions, filters.selectedTextures)}
              products={products}
              restrictionsData={restrictionsData}
              texturesData={texturesData}
              onScrollToProduct={handleScrollToProduct}
            />

            {presentCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-gray-300 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-500">אין מוצרים קיימים במערכת</h3>
                <p className="text-gray-400 mt-2">הוסף מוצרים בעמוד ניהול המוצרים כדי לראות אותם כאן.</p>
              </div>
            ) : (
              presentCategories.map((category) => {
                const categoryProducts = productsByCategory[category];
                if (!categoryProducts || categoryProducts.length === 0) return null;

                const visibleProducts = categoryProducts
                  .map((p) => ({ product: p, state: filters.getProductState(p, restrictionsData, texturesData) }))
                  .filter(({ state }) => state !== "hidden") as { product: typeof categoryProducts[0]; state: "regular" | "warning" }[];
                if (visibleProducts.length === 0) return null;

                return (
                  <section key={category} className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="text-2xl font-bold text-gray-800 shrink-0 whitespace-normal break-words max-w-full">{category}</h2>
                      <div className="h-px bg-gray-200 flex-grow rounded-full shrink" />
                    </div>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-items-center">
                      {visibleProducts.map(({ product, state }, index) => renderCard(product, state, index))}
                    </div>
                  </section>
                );
              })
            )}
          </>
        )}
      </div>

      {similarAnchor && (
        <SimilarFoodsPopup
          product={similarAnchor.product}
          anchorRect={similarAnchor.rect}
          onClose={() => setSimilarAnchor(null)}
        />
      )}
    </div>
  );
};

export default ProductsPage;
