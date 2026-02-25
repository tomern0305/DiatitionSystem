import React, { useState, useEffect } from "react";
import type { SensitivityData } from "../pages/CategorySettingsPage";

export interface CategoryData {
  id: number;
  name: string;
}

interface AddProductFormProps {
  onProductAdded: () => void;
  onCancel: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({
  onProductAdded,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    category_id: 0,
    image: "",
    iddsi: 0,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugares: 0,
    sodium: 0,
    contains: [] as string[],
    mayContain: [] as string[],
  });

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [sensitivities, setSensitivities] = useState<SensitivityData[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/api/categories`).then((res) =>
        res.json(),
      ),
      fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`).then((res) =>
        res.json(),
      ),
    ])
      .then(([catsData, sensData]) => {
        setCategories(catsData);
        setSensitivities(sensData);
        if (catsData.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: catsData[0].id }));
        }
      })
      .catch((err) => console.error("Error fetching data for form:", err));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" || name === "category_id" ? Number(value) : value,
    }));
  };

  const handleContainsChange = (sensName: string) => {
    setFormData((prev) => {
      const current = prev.contains;
      if (current.includes(sensName)) {
        return {
          ...prev,
          contains: current.filter((item) => item !== sensName),
        };
      } else {
        return { ...prev, contains: [...current, sensName] };
      }
    });
  };

  const handleMayContainChange = (sensName: string) => {
    setFormData((prev) => {
      const current = prev.mayContain;
      if (current.includes(sensName)) {
        return {
          ...prev,
          mayContain: current.filter((item) => item !== sensName),
        };
      } else {
        return { ...prev, mayContain: [...current, sensName] };
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      setFormData((prev) => ({ ...prev, image: result.imageUrl }));
    } catch (err: any) {
      alert("שגיאה בהעלאת תמונה: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(() => {
        setFormData({
          name: "",
          category_id: categories.length > 0 ? categories[0].id : 0,
          image: "",
          iddsi: 0,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          sugares: 0,
          sodium: 0,
          contains: [],
          mayContain: [],
        });
        onProductAdded();
      })
      .catch((err) => {
        alert("Error adding product: " + err);
      });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">פרטי מוצר חדש</h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-red-500 font-medium transition-colors"
        >
          סגור
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם המנה
          </label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            קטגוריה
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
            required
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תמונת מוצר (קישור או העלאה)
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="image"
              placeholder="הכנס קישור לתמונה (URL)..."
              value={formData.image}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100 disabled:opacity-50"
              />
              {isUploading && (
                <span className="text-sm text-gray-500 shrink-0">מעלה...</span>
              )}
            </div>
          </div>
          {formData.image && (
            <div className="mt-3">
              <span className="text-xs text-gray-500 block mb-1">
                תצוגה מקדימה:
              </span>
              <img
                src={formData.image}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-md shadow-sm border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/100x100?text=Error";
                }}
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            מרקם (IDDSI)
          </label>
          <input
            type="number"
            name="iddsi"
            value={formData.iddsi}
            onChange={handleInputChange}
            min="0"
            max="7"
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            קלוריות
          </label>
          <input
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            חלבון (גרם)
          </label>
          <input
            type="number"
            step="0.1"
            name="protein"
            value={formData.protein}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            פחמימות (גרם)
          </label>
          <input
            type="number"
            step="0.1"
            name="carbs"
            value={formData.carbs}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שומן (גרם)
          </label>
          <input
            type="number"
            step="0.1"
            name="fat"
            value={formData.fat}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            סוכר (גרם)
          </label>
          <input
            type="number"
            step="0.1"
            name="sugares"
            value={formData.sugares}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            נתרן (מ"ג)
          </label>
          <input
            type="number"
            step="0.1"
            name="sodium"
            value={formData.sodium}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2 rounded-md"
          />
        </div>

        {/* Sensitivities/Allergies Selection */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              מכיל (רגישויות / אלרגיות / מאפיינים)
            </label>
            <div className="flex flex-wrap gap-3 p-4 border border-gray-200 rounded-md bg-gray-50">
              {sensitivities.length === 0 ? (
                <span className="text-gray-500 text-sm">
                  לא נמצאו רגישויות מוגדרות במערכת
                </span>
              ) : (
                sensitivities.map((sens) => (
                  <label
                    key={sens.id}
                    className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-indigo-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                      checked={formData.contains.includes(sens.name)}
                      onChange={() => handleContainsChange(sens.name)}
                    />
                    <span className="text-sm text-gray-800 select-none">
                      {sens.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              עלול להכיל (רגישויות / אלרגיות / מאפיינים)
            </label>
            <div className="flex flex-wrap gap-3 p-4 border border-gray-200 rounded-md bg-gray-50">
              {sensitivities.length === 0 ? (
                <span className="text-gray-500 text-sm">
                  לא נמצאו רגישויות מוגדרות במערכת
                </span>
              ) : (
                sensitivities.map((sens) => (
                  <label
                    key={`may-${sens.id}`}
                    className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:border-amber-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500 cursor-pointer"
                      checked={formData.mayContain.includes(sens.name)}
                      onChange={() => handleMayContainChange(sens.name)}
                    />
                    <span className="text-sm text-gray-800 select-none">
                      {sens.name}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-span-full pt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md w-full md:w-auto transition-colors"
          >
            שמור מוצר במערכת
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
