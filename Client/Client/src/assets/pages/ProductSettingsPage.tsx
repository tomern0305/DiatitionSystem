import React, { useState, useEffect } from "react";
import AddProductForm from "../components/settings/AddProductForm";
import TopBar from "../components/ui/TopBar";
import ProductRow from "../components/settings/ProductRow";
import Loader from "../components/ui/Loader";
import Toast from "../components/ui/Toast";
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

  const handleExportZip = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/system/export`,
      );
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "database_backup.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setStatusMessage({ text: "קובץ הגיבוי יוצא בהצלחה", type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: `שגיאה בייצוא: ${err.message}`, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/system/import`,
        {
          method: "POST",
          body: formData,
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setStatusMessage({
        text: `${data.message} חולץ והועלה בהצלחה.`,
        type: "success",
      });
      fetchData(true);
    } catch (err: any) {
      setStatusMessage({ text: `שגיאה בייבוא: ${err.message}`, type: "error" });
      setLoading(false);
    } finally {
      // Clear file input so the same file can be selected again
      e.target.value = "";
    }
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
            {/* Download Full Backup */}
            <button
              onClick={handleExportZip}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
              title="ייצא גיבוי מלא (ZIP)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
              ייצוא מערכת
            </button>

            {/* Upload Full Backup */}
            <div className="relative">
              <input
                type="file"
                accept=".zip"
                onChange={handleImportZip}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="ייבא גיבוי מערכת (ZIP)"
              />
              <div className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm pointer-events-none w-full sm:w-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
                    clipRule="evenodd"
                  />
                </svg>
                ייבוא נתונים
              </div>
            </div>

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
