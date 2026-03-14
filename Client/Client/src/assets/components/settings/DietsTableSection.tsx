import { useState, useEffect } from "react";
import AddDietForm from "./AddDietForm";
import DietRow from "./DietRow";
import Toast from "../ui/Toast";
import type { ToastType } from "../ui/Toast";
import type { DietData } from "../../types";

const DietsTableSection = () => {
  const [diets, setDiets] = useState<DietData[]>([]);
  const [loadingDiets, setLoadingDiets] = useState(true);
  const [errorDiets, setErrorDiets] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const [isAddingDiet, setIsAddingDiet] = useState(false);
  const [isDownloadingDietsTable, setIsDownloadingDietsTable] = useState(false);
  const [isUploadingDietsTable, setIsUploadingDietsTable] = useState(false);

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
    fetchDiets();
  }, []);

  const fetchDietsTable = (showLoader: boolean = true) => {
    if (showLoader) setIsDownloadingDietsTable(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/diets/table`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch diets table");
        return res.blob();
      })
      .then((data) => {
        const blob = new Blob(["\uFEFF", data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "diets_table.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        if (showLoader) setIsDownloadingDietsTable(false);
      })
      .catch(() => {
        setToast({ message: "שגיאה בהורדת הטבלה", type: "error" });
        if (showLoader) setIsDownloadingDietsTable(false);
      });
  };

  const handleUploadDietsTable = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingDietsTable(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/diets/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload table");

      setToast({
        message: data.message || "הטבלה הועלתה בהצלחה",
        type: "success",
      });
      fetchDiets(false);
    } catch (err: any) {
      setToast({
        message: `שגיאה בהעלאה: ${err.message}`,
        type: "error",
      });
    } finally {
      setIsUploadingDietsTable(false);
      event.target.value = "";
    }
  };

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

  if (loadingDiets) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (errorDiets) {
    return <div className="text-red-500 text-center">{errorDiets}</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-gray-800">דיאטות</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingDiet(!isAddingDiet)}
            className={`py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center text-white
              ${isAddingDiet ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
            title={isAddingDiet ? "ביטול" : "הוסף דיאטה"}
          >
            {isAddingDiet ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            )}
          </button>
          <label
            className={`cursor-pointer py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center text-white
              ${
                isUploadingDietsTable
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            title="העלאת דיאטות"
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUploadDietsTable}
              disabled={isUploadingDietsTable}
            />
            {isUploadingDietsTable ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
          </label>
          <button
            onClick={() => fetchDietsTable()}
            disabled={isDownloadingDietsTable}
            title="הורדת דיאטות"
            className={`py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center text-white
              ${isDownloadingDietsTable ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isDownloadingDietsTable ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
          </button>
        </div>
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
  );
};

export default DietsTableSection;
