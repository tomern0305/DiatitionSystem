import React, { useState, useEffect } from "react";

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
  });

  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, category_id: data[0].id }));
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
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
            תמונת מוצר
          </label>
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
          {formData.image && (
            <div className="mt-2">
              <img
                src={formData.image}
                alt="Preview"
                className="h-16 w-16 object-cover rounded-md shadow-sm border border-gray-200"
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
