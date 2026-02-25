import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import AddCategoryForm from "../components/AddCategoryForm";
import CategoryRow from "../components/CategoryRow";

export interface CategoryData {
  id: number;
  name: string;
}

interface CategorySettingsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategorySettingsPage = ({
  setIsSideMenuOpen,
}: CategorySettingsPageProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [isAdding, setIsAdding] = useState(false);

  const fetchCategories = () => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubmit = async (name: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add category");

      setIsAdding(false);
      fetchCategories();
    } catch (err: any) {
      alert(`שגיאה בהוספת קטגוריה: ${err.message}`);
    }
  };

  const handleEditSubmit = async (id: number, name: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category");

      fetchCategories();
    } catch (err: any) {
      alert(`שגיאה בעדכון קטגוריה: ${err.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק קטגוריה זו?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete category");

      fetchCategories();
    } catch (err: any) {
      alert(`לא ניתן למחוק: ${err.message}`);
    }
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
        <TopBar title="ניהול קטגוריות" setIsSideMenuOpen={setIsSideMenuOpen}>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-all flex items-center justify-center gap-2"
          >
            {isAdding ? (
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
                הוסף קטגוריה
              </>
            )}
          </button>
        </TopBar>

        {isAdding && <AddCategoryForm onAdd={handleAddSubmit} />}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[500px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-4 sm:p-5 font-bold text-gray-600 text-sm">
                  מזהה
                </th>
                <th className="p-4 sm:p-5 font-bold text-gray-600 text-sm w-full">
                  שם הקטגוריה
                </th>
                <th className="p-4 sm:p-5 font-bold text-gray-600 text-sm text-center">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <CategoryRow
                  key={cat.id}
                  category={cat}
                  onEdit={handleEditSubmit}
                  onDelete={handleDelete}
                />
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-gray-500">
                    אין קטגוריות. הוסף קטגוריה חדשה כדי להתחיל.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsPage;
