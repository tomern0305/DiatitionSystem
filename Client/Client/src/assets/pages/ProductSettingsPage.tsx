import React, { useState, useEffect } from "react";
import AddProductForm from "../components/AddProductForm";
import TopBar from "../components/TopBar";
import ProductRow from "../components/ProductRow";
import type { CategoryData } from "./CategorySettingsPage";

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
  sugares: number; // Matches the React component prop, though it's technically typo
  sodium: number;
  contains?: string[];
  mayContain?: string[];
  texture?: string;
  texture_id?: number;
  company?: string;
  properties?: string[];
  lastEditDate: Date;
}

interface ProductSettingsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductSettingsPage = ({
  setIsSideMenuOpen,
}: ProductSettingsPageProps) => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchData = () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductAdded = () => {
    setIsFormOpen(false);
    fetchData();
  };

  const handleProductUpdate = async (id: string, updatedData: any) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/products/${id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      },
    );
    if (!res.ok) {
      const error = await res.json();
      alert(`שגיאה בעדכון מוצר: ${error.error}`);
      throw new Error(error.error);
    }
    fetchData();
  };

  const handleProductDelete = async (id: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/api/products/${id}`,
      {
        method: "DELETE",
      },
    );
    if (!res.ok) {
      const error = await res.json();
      alert(`שגיאה במחיקת מוצר: ${error.error}`);
      throw new Error(error.error);
    }
    fetchData();
  };

  if (loading)
    return (
      <div className="p-8 text-center" dir="rtl">
        טוען נתונים...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500" dir="rtl">
        שגיאה: {error}
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans"
      dir="rtl"
    >
      <div className="w-full mx-auto space-y-8">
        <TopBar title="ניהול מוצרים" setIsSideMenuOpen={setIsSideMenuOpen}>
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2"
          >
            {isFormOpen ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                ביטול
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                הוסף מוצר חדש
              </>
            )}
          </button>
        </TopBar>

        {/* Add Product Form */}
        {isFormOpen && (
          <AddProductForm
            onProductAdded={handleProductAdded}
            onCancel={() => setIsFormOpen(false)}
          />
        )}

        {/* Products List (Table) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="p-4 w-10"></th>
                  <th className="p-4 font-semibold text-gray-600">תמונה</th>
                  <th className="p-4 font-semibold text-gray-600">שם המוצר</th>
                  <th className="p-4 font-semibold text-gray-600">קטגוריה</th>
                  <th className="p-4 font-semibold text-gray-600">חברה</th>
                  <th className="p-4 font-semibold text-gray-600">IDDSI</th>
                  <th className="p-4 font-semibold text-gray-600">קלוריות</th>
                  <th className="p-4 font-semibold text-gray-600">
                    חלבונים (ג')
                  </th>
                  <th className="p-4 font-semibold text-gray-600">
                    תאריך עריכה אחרון
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-gray-500 text-lg"
                    >
                      אין מוצרים קיימים במערכת.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <ProductRow
                      key={p.id}
                      product={p}
                      categories={categories}
                      isExpanded={expandedRowId === p.id}
                      onToggleExpand={() =>
                        setExpandedRowId(expandedRowId === p.id ? null : p.id)
                      }
                      onSave={handleProductUpdate}
                      onDelete={handleProductDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSettingsPage;
