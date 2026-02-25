import { useState, useEffect } from "react";
import ProductBig from "../components/ProductBig";
import TopBar from "../components/TopBar";
import type { Allergen } from "../components/ProductBig";

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
  contains?: Allergen[];
  mayContain?: Allergen[];
  properties?: string[];
}

export interface CategoryData {
  id: number;
  name: string;
}

interface ProductsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductsPage = ({ setIsSideMenuOpen }: ProductsPageProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
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
    ])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
        setLoading(false);
      })
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

        {/* Iterate over defined categories to maintain order */}
        {presentCategories.map((category) => {
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
                {categoryProducts.map((product, index) => (
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
                      properties={product.properties}
                      state="regular"
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsPage;
