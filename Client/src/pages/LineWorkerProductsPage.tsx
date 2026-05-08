import { useState } from "react";
import ProductSmall from "../components/products/ProductSmall";
import FilterBar from "../components/products/FilterBar";
import TopBar from "../components/layout/TopBar";
import Loader from "../components/layout/Loader";
import SuggestedMealsSection from "../components/meal/SuggestedMealsSection";
import useProductCatalog from "../hooks/useProductCatalog";
import useProductFilters from "../hooks/useProductFilters";

interface ProductsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LineWorkerProductsPage = ({ setIsSideMenuOpen }: ProductsPageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);

  const handleScrollToProduct = (id: number) => {
    setHighlightedProductId(String(id));
    setTimeout(() => setHighlightedProductId(null), 3000);
  };

  const { loading, error, products, restrictionsData, texturesData, getCatalog, getSuggestedMeals } =
    useProductCatalog(true);
  const filters = useProductFilters();

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

  const { presentCategories, productsByCategory } = getCatalog(searchTerm, sortBy);

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans" dir="rtl">
      <div className="w-full mx-auto space-y-16">
        <TopBar title="קטלוג מוצרים - עובד פס" setIsSideMenuOpen={setIsSideMenuOpen}>
          <div className="relative w-full sm:w-64">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="חיפוש מוצר או קטגוריה..."
              className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white outline-none transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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
        </TopBar>

        <FilterBar
          restrictionsData={restrictionsData}
          texturesData={texturesData}
          filters={filters}
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

            const visibleProducts = categoryProducts.filter(
              (p) => filters.getProductState(p, restrictionsData, texturesData) !== "hidden",
            );
            if (visibleProducts.length === 0) return null;

            return (
              <section key={category} className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 shrink-0 whitespace-normal break-words max-w-full">
                    {category}
                  </h2>
                  <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
                </div>

                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-items-center">
                  {visibleProducts.map((product) => (
                    <div
                      key={product.id}
                      id={`product-${product.id}`}
                      className="w-full flex justify-center animate-fade-in-up"
                      style={{ animationDelay: "0ms" }}
                    >
                      <ProductSmall
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
                        state={highlightedProductId === product.id ? "selected" : "regular"}
                        textureNotes={product.textureNotes}
                        allergyNotes={product.allergyNotes}
                        forbiddenFor={product.forbiddenFor}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LineWorkerProductsPage;
