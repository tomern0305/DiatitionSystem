import React, { useState, useEffect } from "react";
import type { ProductData } from "../pages/ProductSettingsPage";
import type {
  CategoryData,
  SensitivityData,
  TextureData,
} from "../pages/CategorySettingsPage";

interface ProductExpandedRowProps {
  product: ProductData;
  categories: CategoryData[];
  onSave: (id: string, updatedData: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

const ProductExpandedRow: React.FC<ProductExpandedRowProps> = ({
  product,
  categories,
  onSave,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: product.name || "",
    category_id: categories.find((c) => c.name === product.category)?.id || 0,
    image: product.image || "",
    iddsi: product.iddsi || 0,
    calories: product.calories || 0,
    protein: product.protein || 0,
    carbs: product.carbs || 0,
    fat: product.fat || 0,
    sugares: product.sugares || 0,
    sodium: product.sodium || 0,
    contains: product.contains || ([] as string[]),
    mayContain: product.mayContain || [],
    texture_id: product.texture_id || 0,
    company: product.company || "",
    properties: product.properties || [],
  });

  const [sensitivities, setSensitivities] = useState<SensitivityData[]>([]);
  const [textures, setTextures] = useState<TextureData[]>([]);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      if (sensitivities.length === 0) {
        fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities`)
          .then((res) => res.json())
          .then((data) => setSensitivities(data))
          .catch((err) => console.error("Error fetching sensitivities:", err));
      }
      if (textures.length === 0) {
        fetch(`${import.meta.env.VITE_API_URL}/api/texture`)
          .then((res) => res.json())
          .then((data) => setTextures(data))
          .catch((err) => console.error("Error fetching textures:", err));
      }
    }
  }, [isEditing]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(product.id, formData);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "האם אתה בטוח שברצונך למחוק מוצר זה לצמיתות? פעולה זו אינה הפיכה.",
      )
    ) {
      await onDelete(product.id);
    }
  };

  if (!isEditing) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-xl font-bold text-gray-800">פירוט מוצר מלא</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition-colors"
            >
              ערוך מוצר
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
              מחק
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-50 text-gray-500 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              title="סגור חלונית"
            >
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
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">פחמימות</div>
            <div className="text-lg font-bold text-gray-800">
              {product.carbs} גרם
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">שומן</div>
            <div className="text-lg font-bold text-gray-800">
              {product.fat} גרם
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">סוכרים</div>
            <div className="text-lg font-bold text-gray-800">
              {product.sugares} גרם
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm mb-1">נתרן</div>
            <div className="text-lg font-bold text-gray-800">
              {product.sodium} מ"ג
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 md:col-span-4 mt-2">
            <div className="text-gray-500 text-sm mb-1">טקסטורה מוגדרת</div>
            <div className="text-lg font-bold text-gray-800">
              {product.texture || "ללא טקסטורה מוגדרת"}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 col-span-2 md:col-span-4 mt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-gray-500 text-sm mb-2">
                  מכיל (רגישויות/אלרגיות)
                </div>
                <div className="flex flex-wrap gap-2">
                  {!product.contains || product.contains.length === 0 ? (
                    <span className="text-sm text-gray-400">
                      לא הוגדרו רגישויות
                    </span>
                  ) : (
                    product.contains.map((sens, idx) => (
                      <span
                        key={idx}
                        className="bg-red-50 text-red-700 text-sm px-3 py-1 rounded-full font-medium border border-red-100"
                      >
                        {sens}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="text-gray-500 text-sm mb-2">
                  עלול להכיל (רגישויות/אלרגיות)
                </div>
                <div className="flex flex-wrap gap-2">
                  {!product.mayContain || product.mayContain.length === 0 ? (
                    <span className="text-sm text-gray-400">
                      לא הוגדר "עלול להכיל"
                    </span>
                  ) : (
                    product.mayContain.map((sens, idx) => (
                      <span
                        key={`may-${idx}`}
                        className="bg-amber-50 text-amber-700 text-sm px-3 py-1 rounded-full font-medium border border-amber-100"
                      >
                        {sens}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-blue-100 m-4 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-blue-900">
          מצב עריכה: {product.name}
        </h3>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ביטול פתיחה
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            שם המוצר
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            קטגוריה
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            חברה / מותג
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            placeholder="לדוג': תנובה, שטראוס..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            טקסטורה
          </label>
          <select
            name="texture_id"
            value={formData.texture_id}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
          >
            <option value={0}>ללא טקסטורה מוגדרת</option>
            {textures.map((txt) => (
              <option key={txt.id} value={txt.id}>
                {txt.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            תמונת מוצר (קישור או העלאה)
          </label>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              name="image"
              placeholder="הכנס קישור לתמונה (URL)..."
              value={formData.image}
              onChange={handleInputChange}
              className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
                className="w-full border border-gray-300 p-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm text-gray-500
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

        {/* Nutritional Data */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            מרקם (IDDSI)
          </label>
          <input
            type="number"
            name="iddsi"
            value={formData.iddsi}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            קלוריות
          </label>
          <input
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            חלבונים (ג')
          </label>
          <input
            type="number"
            step="0.1"
            name="protein"
            value={formData.protein}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            פחמימות (ג')
          </label>
          <input
            type="number"
            step="0.1"
            name="carbs"
            value={formData.carbs}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            שומן (ג')
          </label>
          <input
            type="number"
            step="0.1"
            name="fat"
            value={formData.fat}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            סוכר (ג')
          </label>
          <input
            type="number"
            step="0.1"
            name="sugares"
            value={formData.sugares}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            נתרן (מ"ג)
          </label>
          <input
            type="number"
            step="0.1"
            name="sodium"
            value={formData.sodium}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white outline-none"
          />
        </div>

        {/* Sensitivities/Allergies Selection in Edit Mode */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 mt-2 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              מכיל (רגישויות / אלרגיות / מאפיינים)
            </label>
            <div className="flex flex-wrap gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              עלול להכיל (רגישויות / אלרגיות / מאפיינים)
            </label>
            <div className="flex flex-wrap gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50">
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
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <button
          onClick={() => setIsEditing(false)}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
        >
          ביטול
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl shadow-md transition-all"
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </div>
    </div>
  );
};

export default ProductExpandedRow;
