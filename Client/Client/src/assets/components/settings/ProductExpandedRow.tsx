import React, { useState, useEffect } from "react";
import type {
  ProductData,
  CategoryData,
  SensitivityData,
  TextureData,
} from "../../types";

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
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setFormData((prev) => {
      let parsedValue: string | number = value;

      if (
        type === "number" ||
        name === "category_id" ||
        name === "iddsi" ||
        name === "texture_id"
      ) {
        parsedValue = value === "" ? 0 : Number(value);
      }

      return {
        ...prev,
        [name]: parsedValue,
      };
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      e.target.value = "";
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      const name = e.target.name;
      setFormData((prev) => ({ ...prev, [name]: 0 }));
    }
  };

  const handleContainsChange = (sensName: string) => {
    setFormData((prev) => {
      const current = prev.contains;
      if (current.includes(sensName)) {
        return {
          ...prev,
          contains: current.filter((item: string) => item !== sensName),
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
          mayContain: current.filter((item: string) => item !== sensName),
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
    setValidationError(null);

    // Validation
    if (!formData.name.trim()) {
      setValidationError("נא למלא את שם המוצר.");
      return;
    }
    if (!formData.category_id || formData.category_id === 0) {
      setValidationError("נא לבחור קטגוריה למוצר.");
      return;
    }
    if (!formData.texture_id || formData.texture_id === 0) {
      setValidationError(
        "נא לבחור טקסטורת מנה (חובה). לא ניתן לשמור ללא בחירת טקסטורה.",
      );
      return;
    }

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
              {product.texture || "יש לבחור טקסטורה"}
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
                    product.contains.map((sens: string, idx: number) => (
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
                    product.mayContain.map((sens: string, idx: number) => (
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
            <option value={0}>יש לבחור טקסטורה</option>
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
          <select
            name="iddsi"
            value={formData.iddsi}
            onChange={handleInputChange}
            className="w-full border border-gray-300 p-2.5 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={0}>0 - דליל</option>
            <option value={1}>1 - סמיך קלות</option>
            <option value={2}>2 - סמיך במידה</option>
            <option value={3}>3 - סמיך למדי</option>
            <option value={4}>4 - נוזלי סמיך / מחיתי</option>
            <option value={5}>5 - טחון ורך</option>
            <option value={6}>6 - רך לחיתוך</option>
            <option value={7}>7 - רגיל</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            קלוריות
          </label>
          <input
            type="number"
            name="calories"
            value={formData.calories === 0 ? "" : formData.calories}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            value={formData.protein === 0 ? "" : formData.protein}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            value={formData.carbs === 0 ? "" : formData.carbs}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            value={formData.fat === 0 ? "" : formData.fat}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            value={formData.sugares === 0 ? "" : formData.sugares}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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
            value={formData.sodium === 0 ? "" : formData.sodium}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
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

      {validationError && (
        <div className="mt-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-100 flex items-center gap-2 animate-fade-in-up">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-medium text-sm">{validationError}</span>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
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
