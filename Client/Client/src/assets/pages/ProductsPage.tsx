import { useState, useEffect } from "react";
import ProductBig from "../components/ProductBig";
import TopBar from "../components/TopBar";

export interface ProductData {
  id: string;
  category: string;
  image: string;
  name: string;
  iddsi: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugares: number;
  sodium: number;
  contains?: string[];
  mayContain?: string[];
  texture?: string;
  properties?: string[];
}

export interface CategoryData {
  id: number;
  name: string;
}

export interface RestrictionsData {
  id: number;
  name: string;
}

export interface TexturesData {
  id: number;
  name: string;
}

interface ProductsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductsPage = ({ setIsSideMenuOpen }: ProductsPageProps) => {
  const [restrictionsData, setRestrictionsData] = useState<RestrictionsData[]>(
    [],
  );
  const [texturesData, setTexturesData] = useState<TexturesData[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>(
    [],
  );
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<number[]>([]);
  const [showMayContain, setShowMayContain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/products`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/categories`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sensitivities");
        return res.json();
      }),
      fetch(`${import.meta.env.VITE_API_URL}/api/texture`).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch textures");
        return res.json();
      }),
    ])
      .then(
        ([productsData, categoriesData, sensitivitiesData, texturesData]) => {
          setProducts(productsData);
          setCategories(categoriesData);
          setRestrictionsData(sensitivitiesData);
          setTexturesData(texturesData);
          setLoading(false);
        },
      )
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p className="text-xl">טוען מוצרים...</p>
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

  // Filter and sort products
  const filteredProducts = products.filter(
    (p) =>
      p.name.includes(searchTerm) ||
      (p.category && p.category.includes(searchTerm)),
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "calories_asc") return a.calories - b.calories;
    if (sortBy === "calories_desc") return b.calories - a.calories;
    if (sortBy === "protein_desc") return b.protein - a.protein;
    return 0; // default order
  });

  // Group sorted products by category
  const productsByCategory = sortedProducts.reduce(
    (acc, product) => {
      const cat = product.category as string;
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(product);
      return acc;
    },
    {} as Record<string, ProductData[]>,
  );

  const presentCategories = Object.keys(productsByCategory).sort((a, b) => {
    const idxA = categories.findIndex((c) => c.name === a);
    const idxB = categories.findIndex((c) => c.name === b);
    if (idxA === -1 && idxB === -1) return a.localeCompare(b);
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // Handle checking/unchecking a restriction
  const handleRestrictionToggle = (restrictionId: number) => {
    setSelectedRestrictions((prev) => {
      if (prev.includes(restrictionId)) {
        return prev.filter((id) => id !== restrictionId);
      }
      return [...prev, restrictionId];
    });
  };

  // Handle checking/unchecking a texture (Single selection)
  const handleTextureToggle = (textureId: number) => {
    setSelectedTextures((prev) => {
      // If clicking the already selected texture, toggle it off
      if (prev.includes(textureId)) {
        return [];
      }
      // Otherwise, select only this one
      return [textureId];
    });
  };

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans"
      dir="rtl"
    >
      <div className="w-full mx-auto space-y-16">
        {/* Search, Sort & Header Bar */}
        <TopBar title="קטלוג מוצרים" setIsSideMenuOpen={setIsSideMenuOpen}>
          <div className="relative w-full sm:w-64">
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

        {/* --- Restrictions Filter Bar --- */}
        {restrictionsData.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-row flex-wrap gap-x-12 gap-y-8 items-start">
            {/* May Contain Column */}
            <div className="flex flex-col gap-3 min-w-[250px] flex-1">
              <h3 className="text-gray-800 font-bold flex items-center gap-2 m-0 p-0 text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 text-orange-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                מעורבב / עלול להכיל
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  onClick={() => setShowMayContain(!showMayContain)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                    ${
                      showMayContain
                        ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                    }
                  `}
                >
                  הצג מוצרים שעלולים להכיל
                </button>
              </div>
            </div>
            {/* Sensitivities Column */}
            <div className="flex flex-col gap-3 min-w-[250px] flex-1 border-r border-gray-100 pr-0 sm:pr-8">
              <h3 className="text-gray-800 font-bold flex items-center gap-2 m-0 p-0 text-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 text-red-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>
                סינון רגישויות
              </h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {restrictionsData.map((restriction) => {
                  const isSelected = selectedRestrictions.includes(
                    restriction.id,
                  );
                  return (
                    <button
                      key={restriction.id}
                      onClick={() => handleRestrictionToggle(restriction.id)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                        ${
                          isSelected
                            ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                        }
                      `}
                    >
                      {restriction.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Textures Column */}
            {texturesData.length > 0 && (
              <div className="flex flex-col gap-3 min-w-[250px] flex-1 border-r border-gray-100 pr-0 sm:pr-8">
                <h3 className="text-gray-800 font-bold flex items-center gap-2 m-0 p-0 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-blue-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                    />
                  </svg>
                  סינון מרקמים
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {texturesData.map((texture) => {
                    const isSelected = selectedTextures.includes(texture.id);
                    return (
                      <button
                        key={texture.id}
                        onClick={() => handleTextureToggle(texture.id)}
                        className={`
                          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                          ${
                            isSelected
                              ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }
                        `}
                      >
                        {texture.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Iterate over defined categories to maintain order */}
        {presentCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 text-gray-300 mb-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <h3 className="text-xl font-bold text-gray-500">
              אין מוצרים קיימים במערכת
            </h3>
            <p className="text-gray-400 mt-2">
              הוסף מוצרים בעמוד ניהול המוצרים כדי לראות אותם כאן.
            </p>
          </div>
        ) : (
          presentCategories.map((category) => {
            const categoryProducts = productsByCategory[category];

            // Don't render the section if there are no products
            if (!categoryProducts || categoryProducts.length === 0) return null;

            return (
              <section key={category} className="relative">
                {/* Category Title Header */}
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 shrink-0">
                    {category}
                  </h2>
                  <div className="h-px bg-gray-200 flex-grow rounded-full"></div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 justify-items-center">
                  {categoryProducts.map((product, index) => {
                    // Determine if the product should be disabled based on filters
                    let isDisabled = false;
                    let isWarning = false;

                    // Map selected restriction IDs back to their names to compare with product allergens
                    const selectedRestrictionNames = selectedRestrictions
                      .map(
                        (id) => restrictionsData.find((r) => r.id === id)?.name,
                      )
                      .filter(Boolean);

                    // 1. Check Restrictions: If the product contains ANY of the selected restrictions, it is disabled.
                    if (
                      selectedRestrictionNames.length > 0 &&
                      product.contains?.some((allergen) =>
                        selectedRestrictionNames.includes(allergen),
                      )
                    ) {
                      isDisabled = true;
                    }

                    // 2. Check "May Contain": If it hasn't strictly failed "contains", check "mayContain"
                    if (
                      !isDisabled &&
                      selectedRestrictionNames.length > 0 &&
                      product.mayContain?.some((allergen) =>
                        selectedRestrictionNames.includes(allergen),
                      )
                    ) {
                      // It fails the restriction due to "may contain".
                      // If the user explicitly wants to show these, we mark it as "warning", otherwise it is "disabled".
                      if (showMayContain) {
                        isWarning = true;
                      } else {
                        isDisabled = true;
                      }
                    }

                    // 3. Check Textures: If a texture is selected, the product MUST match it, otherwise it is disabled.
                    // This rule applies even if it was marked as warning, because texture is a strict requirement.
                    if (!isDisabled && selectedTextures.length > 0) {
                      const selectedTextureName = texturesData.find(
                        (t) => t.id === selectedTextures[0],
                      )?.name;

                      if (
                        selectedTextureName &&
                        product.texture !== selectedTextureName
                      ) {
                        isDisabled = true;
                        isWarning = false; // Texture mismatch overrides warning
                      }
                    }

                    // Determine final state for ProductBig
                    let productState: "regular" | "disabled" | "warning" =
                      "regular";
                    if (isDisabled) {
                      productState = "disabled";
                    } else if (isWarning) {
                      productState = "warning";
                    }

                    return (
                      <div
                        key={product.id}
                        className="w-full flex justify-center animate-fade-in-up"
                        style={{ animationDelay: `${index * 50}ms` }}
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
                          state={productState}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
