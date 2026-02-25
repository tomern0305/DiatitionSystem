import { useState, useEffect } from "react";
import TopBar from "../components/TopBar";
import AddCategoryForm from "../components/AddCategoryForm";
import CategoryRow from "../components/CategoryRow";
import AddSensitivityForm from "../components/AddSensitivityForm";
import SensitivityRow from "../components/SensitivityRow";

export interface CategoryData {
  id: number;
  name: string;
}

export interface SensitivityData {
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
  const [sensitivities, setSensitivities] = useState<SensitivityData[]>([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSens, setLoadingSens] = useState(true);

  const [errorCats, setErrorCats] = useState<string | null>(null);
  const [errorSens, setErrorSens] = useState<string | null>(null);

  // Form State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSensitivity, setIsAddingSensitivity] = useState(false);

  const fetchCategories = () => {
    setLoadingCats(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        setLoadingCats(false);
      })
      .catch((err) => {
        setErrorCats(err.message);
        setLoadingCats(false);
      });
  };

  const fetchSensitivities = () => {
    setLoadingSens(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sensitivities");
        return res.json();
      })
      .then((data) => {
        setSensitivities(data);
        setLoadingSens(false);
      })
      .catch((err) => {
        setErrorSens(err.message);
        setLoadingSens(false);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchSensitivities();
  }, []);

  // --- Category Handlers ---
  const handleAddCategorySubmit = async (name: string) => {
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

      setIsAddingCategory(false);
      fetchCategories();
    } catch (err: any) {
      alert(`שגיאה בהוספת קטגוריה: ${err.message}`);
    }
  };

  const handleEditCategorySubmit = async (id: number, name: string) => {
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

  const handleDeleteCategory = async (id: number) => {
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

  // --- Sensitivity Handlers ---
  const handleAddSensitivitySubmit = async (name: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sensitivities`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add sensitivity");

      setIsAddingSensitivity(false);
      fetchSensitivities();
    } catch (err: any) {
      alert(`שגיאה בהוספת רגישות: ${err.message}`);
    }
  };

  const handleEditSensitivitySubmit = async (id: number, name: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sensitivities/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to update sensitivity");

      fetchSensitivities();
    } catch (err: any) {
      alert(`שגיאה בעדכון רגישות: ${err.message}`);
    }
  };

  const handleDeleteSensitivity = async (id: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק רגישות תזונתית זו?"))
      return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sensitivities/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to delete sensitivity");

      fetchSensitivities();
    } catch (err: any) {
      alert(`לא ניתן למחוק: ${err.message}`);
    }
  };

  if (loadingCats || loadingSens)
    return (
      <div className="p-8 text-center" dir="rtl">
        טוען נתונים...
      </div>
    );
  if (errorCats || errorSens)
    return (
      <div className="p-8 text-center text-red-500" dir="rtl">
        שגיאה: {errorCats || errorSens}
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans"
      dir="rtl"
    >
      <div className="w-full mx-auto space-y-8">
        <TopBar title="ניהול משתנים" setIsSideMenuOpen={setIsSideMenuOpen} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Section 1: Categories */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-gray-800">קטגוריות מנות</h2>
              <button
                onClick={() => setIsAddingCategory(!isAddingCategory)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isAddingCategory ? "ביטול" : "הוסף קטגוריה"}
              </button>
            </div>

            {isAddingCategory && (
              <AddCategoryForm onAdd={handleAddCategorySubmit} />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600 text-sm">
                      מזהה
                    </th>
                    <th className="p-4 font-bold text-gray-600 text-sm w-full">
                      שם הקטגוריה
                    </th>
                    <th className="p-4 font-bold text-gray-600 text-sm text-center">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((cat) => (
                    <CategoryRow
                      key={cat.id}
                      category={cat}
                      onEdit={handleEditCategorySubmit}
                      onDelete={handleDeleteCategory}
                    />
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        אין קטגוריות לשייך למוצרים.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Sensitivities */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-gray-800">
                רגישויות ואלרגיות
              </h2>
              <button
                onClick={() => setIsAddingSensitivity(!isAddingSensitivity)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isAddingSensitivity ? "ביטול" : "הוסף רגישות"}
              </button>
            </div>

            {isAddingSensitivity && (
              <AddSensitivityForm onAdd={handleAddSensitivitySubmit} />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600 text-sm">
                      מזהה
                    </th>
                    <th className="p-4 font-bold text-gray-600 text-sm w-full">
                      המשתנה יכיל (מכיל...)
                    </th>
                    <th className="p-4 font-bold text-gray-600 text-sm text-center">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sensitivities.map((sens) => (
                    <SensitivityRow
                      key={sens.id}
                      sensitivity={sens}
                      onEdit={handleEditSensitivitySubmit}
                      onDelete={handleDeleteSensitivity}
                    />
                  ))}
                  {sensitivities.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        אין רגישויות או אלרגיות.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySettingsPage;
