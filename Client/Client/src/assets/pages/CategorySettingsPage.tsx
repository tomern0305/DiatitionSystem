import { useState, useEffect } from "react";
import TopBar from "../components/ui/TopBar";
import AddCategoryForm from "../components/settings/AddCategoryForm";
import CategoryRow from "../components/settings/CategoryRow";
import AddSensitivityForm from "../components/settings/AddSensitivityForm";
import SensitivityRow from "../components/settings/SensitivityRow";
import AddTextureForm from "../components/settings/AddTextureForm";
import AddDietForm from "../components/settings/AddDietForm";
import TextureRow from "../components/settings/TextureRow";
import DietRow from "../components/settings/DietRow";
import Loader from "../components/ui/Loader";
import type {
  CategoryData,
  SensitivityData,
  TextureData,
  DietData,
} from "../types";

interface CategorySettingsPageProps {
  setIsSideMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategorySettingsPage = ({
  setIsSideMenuOpen,
}: CategorySettingsPageProps) => {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [sensitivities, setSensitivities] = useState<SensitivityData[]>([]);
  const [textures, setTextures] = useState<TextureData[]>([]);
  const [diets, setDiets] = useState<DietData[]>([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingSens, setLoadingSens] = useState(true);
  const [loadingTextures, setLoadingTextures] = useState(true);
  const [loadingDiets, setLoadingDiets] = useState(true);

  const [errorCats, setErrorCats] = useState<string | null>(null);
  const [errorSens, setErrorSens] = useState<string | null>(null);
  const [errorTextures, setErrorTextures] = useState<string | null>(null);
  const [errorDiets, setErrorDiets] = useState<string | null>(null);

  // Form State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSensitivity, setIsAddingSensitivity] = useState(false);
  const [isAddingTexture, setIsAddingTexture] = useState(false);
  const [isAddingDiet, setIsAddingDiet] = useState(false);

  const fetchCategories = (showLoader: boolean = true) => {
    if (showLoader) setLoadingCats(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        setCategories(data);
        if (showLoader) setLoadingCats(false);
      })
      .catch((err) => {
        setErrorCats(err.message);
        if (showLoader) setLoadingCats(false);
      });
  };

  const fetchSensitivities = (showLoader: boolean = true) => {
    if (showLoader) setLoadingSens(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sensitivities");
        return res.json();
      })
      .then((data) => {
        setSensitivities(data);
        if (showLoader) setLoadingSens(false);
      })
      .catch((err) => {
        setErrorSens(err.message);
        if (showLoader) setLoadingSens(false);
      });
  };

  const fetchTextures = (showLoader: boolean = true) => {
    if (showLoader) setLoadingTextures(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/texture`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch textures");
        return res.json();
      })
      .then((data) => {
        setTextures(data);
        if (showLoader) setLoadingTextures(false);
      })
      .catch((err) => {
        setErrorTextures(err.message);
        if (showLoader) setLoadingTextures(false);
      });
  };

  const fetchDiets = (showLoader: boolean = true) => {
    if (showLoader) setLoadingDiets(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/diets`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch diets");
        return res.json();
      })
      .then((data) => {
        setDiets(data);
        if (showLoader) setLoadingDiets(false);
      })
      .catch((err) => {
        setErrorDiets(err.message);
        if (showLoader) setLoadingDiets(false);
      });
  };

  useEffect(() => {
    fetchCategories();
    fetchSensitivities();
    fetchTextures();
    fetchDiets();
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
      fetchCategories(false);
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

      fetchCategories(false);
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

      fetchCategories(false);
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
      fetchSensitivities(false);
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

      fetchSensitivities(false);
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

      fetchSensitivities(false);
    } catch (err: any) {
      alert(`לא ניתן למחוק: ${err.message}`);
    }
  };

  // --- Texture Handlers ---
  const handleAddTextureSubmit = async (name: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/texture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add texture");

      setIsAddingTexture(false);
      fetchTextures(false);
    } catch (err: any) {
      alert(`שגיאה בהוספת מרקם: ${err.message}`);
    }
  };

  const handleEditTextureSubmit = async (id: number, name: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/texture/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update texture");

      fetchTextures(false);
    } catch (err: any) {
      alert(`שגיאה בעדכון מרקם: ${err.message}`);
    }
  };

  const handleDeleteTexture = async (id: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק מרקם זו?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/texture/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete texture");

      fetchTextures(false);
    } catch (err: any) {
      alert(`לא ניתן למחוק: ${err.message}`);
    }
  };
  // --- Diet Handlers ---
  const handleAddDietSubmit = async (name: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/diets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add diet");

      setIsAddingDiet(false);
      fetchDiets(false);
    } catch (err: any) {
      alert(`שגיאה בהוספת דיאטה: ${err.message}`);
    }
  };

  const handleEditDietSubmit = async (id: number, name: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/diets/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim() }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update diet");

      fetchDiets(false);
    } catch (err: any) {
      alert(`שגיאה בעדכון דיאטה: ${err.message}`);
    }
  };

  const handleDeleteDiet = async (id: number) => {
    if (!window.confirm("האם אתה בטוח שברצונך למחוק דיאטה זו?")) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/diets/${id}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete diet");

      fetchDiets(false);
    } catch (err: any) {
      alert(`לא ניתן למחוק: ${err.message}`);
    }
  };

  if (loadingCats || loadingSens || loadingTextures || loadingDiets)
    return (
      <div className="p-8 text-center bg-gray-50 min-h-screen" dir="rtl">
        <Loader text="טוען נתונים..." />
      </div>
    );
  if (errorCats || errorSens || errorTextures || errorDiets)
    return (
      <div className="p-8 text-center text-red-500" dir="rtl">
        שגיאה: {errorCats || errorSens || errorTextures || errorDiets}
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 sm:p-8 md:p-10 font-sans"
      dir="rtl"
    >
      <div className="w-full mx-auto space-y-8">
        <TopBar title="ניהול משתנים" setIsSideMenuOpen={setIsSideMenuOpen} />

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
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
                      <td colSpan={2} className="p-8 text-center text-gray-500">
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
                      <td colSpan={2} className="p-8 text-center text-gray-500">
                        אין רגישויות או אלרגיות.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Textures */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-gray-800">מרקם מנות</h2>
              <button
                onClick={() => setIsAddingTexture(!isAddingTexture)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isAddingTexture ? "ביטול" : "הוסף מרקם"}
              </button>
            </div>

            {isAddingTexture && (
              <AddTextureForm onAdd={handleAddTextureSubmit} />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600 text-sm w-full">
                      שם מרקם
                    </th>
                    <th className="p-4 font-bold text-gray-600 text-sm text-center">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {textures.map((texture) => (
                    <TextureRow
                      key={texture.id}
                      texture={texture}
                      onEdit={handleEditTextureSubmit}
                      onDelete={handleDeleteTexture}
                    />
                  ))}
                  {textures.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-500">
                        אין מרקמים לבחירה.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Diets */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-xl font-bold text-gray-800">דיאטות</h2>
              <button
                onClick={() => setIsAddingDiet(!isAddingDiet)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
              >
                {isAddingDiet ? "ביטול" : "הוסף דיאטה"}
              </button>
            </div>

            {isAddingDiet && <AddDietForm onAdd={handleAddDietSubmit} />}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-bold text-gray-600 text-sm w-full">
                      שם דיאטה
                    </th>
                    <th className="p-4 font-bold text-gray-600 text-sm text-center">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {diets.map((diet) => (
                    <DietRow
                      key={diet.id}
                      diet={diet}
                      onEdit={handleEditDietSubmit}
                      onDelete={handleDeleteDiet}
                    />
                  ))}
                  {diets.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-gray-500">
                        אין דיאטות לבחירה.
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
