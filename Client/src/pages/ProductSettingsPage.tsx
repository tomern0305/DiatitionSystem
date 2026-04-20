import React, { useState, useEffect } from "react";
import AddProductForm from "../components/settings/AddProductForm";
import TopBar from "../components/layout/TopBar";
import ProductRow from "../components/settings/ProductRow";
import Loader from "../components/layout/Loader";
import Toast from "../components/layout/Toast";
import type { ProductData, CategoryData } from "../types";

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

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const fetchData = (showLoader: boolean = true) => {
    if (showLoader) setLoading(true);
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
        if (showLoader) setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        if (showLoader) setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProductAdded = () => {
    setIsFormOpen(false);
    setStatusMessage({ text: "המוצר נוסף בהצלחה!", type: "success" });
    fetchData(false);
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
      setStatusMessage({
        text: `שגיאה בעדכון מוצר: ${error.error}`,
        type: "error",
      });
      throw new Error(error.error);
    }
    fetchData(false);
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
      setStatusMessage({
        text: `שגיאה במחיקת מוצר: ${error.error}`,
        type: "error",
      });
      throw new Error(error.error);
    }
    fetchData(false);
  };

  if (loading)
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen" dir="rtl">
        <Loader text="טוען נתונים / מעבד קבצים..." />
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
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans relative"
      dir="rtl"
    >
      <div className="w-full mx-auto space-y-8">
        <TopBar title="ניהול מוצרים" setIsSideMenuOpen={setIsSideMenuOpen}>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Add New Product */}
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
          </div>
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

      {/* Toast Notification */}
      {statusMessage && (
        <Toast
          message={statusMessage.text}
          type={statusMessage.type}
          onDismiss={() => setStatusMessage(null)}
        />
      )}
    </div>
  );
};

export default ProductSettingsPage;
