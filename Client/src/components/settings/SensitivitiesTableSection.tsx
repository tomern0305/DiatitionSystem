import { useState, useEffect } from "react";
import AddSensitivityForm from "./AddSensitivityForm";
import SensitivityRow from "./SensitivityRow";
import Toast from "../layout/Toast";
import type { ToastType } from "../layout/Toast";
import type { SensitivityData } from "../../types";

const SensitivitiesTableSection = () => {
  const [sensitivities, setSensitivities] = useState<SensitivityData[]>([]);
  const [loadingSens, setLoadingSens] = useState(true);
  const [errorSens, setErrorSens] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  const [isAddingSensitivity, setIsAddingSensitivity] = useState(false);
  const [isDownloadingSensitivitiesTable, setIsDownloadingSensitivitiesTable] =
    useState(false);
  const [isUploadingSensitivitiesTable, setIsUploadingSensitivitiesTable] =
    useState(false);

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

  useEffect(() => {
    fetchSensitivities();
  }, []);

  const fetchSensitivitiesTable = (showLoader: boolean = true) => {
    if (showLoader) setIsDownloadingSensitivitiesTable(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/sensitivities/table`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch sensitivities table");
        return res.blob();
      })
      .then((data) => {
        const blob = new Blob(["\uFEFF", data], {
          type: "text/csv;charset=utf-8;",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sensitivities_table.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        if (showLoader) setIsDownloadingSensitivitiesTable(false);
      })
      .catch(() => {
        setToast({ message: "שגיאה בהורדת הטבלה", type: "error" });
        if (showLoader) setIsDownloadingSensitivitiesTable(false);
      });
  };

  const handleUploadSensitivitiesTable = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingSensitivitiesTable(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/sensitivities/upload`,
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
      fetchSensitivities(false);
    } catch (err: any) {
      setToast({
        message: `שגיאה בהעלאה: ${err.message}`,
        type: "error",
      });
    } finally {
      setIsUploadingSensitivitiesTable(false);
      event.target.value = "";
    }
  };

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

  if (loadingSens) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (errorSens) {
    return <div className="text-red-500 text-center">{errorSens}</div>;
  }

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-xl font-bold text-gray-800">רגישויות ואלרגיות</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingSensitivity(!isAddingSensitivity)}
            className={`py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center text-white
              ${isAddingSensitivity ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"}`}
            title={isAddingSensitivity ? "ביטול" : "הוסף רגישות"}
          >
            {isAddingSensitivity ? (
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
                isUploadingSensitivitiesTable
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            title="העלאת רגישויות"
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleUploadSensitivitiesTable}
              disabled={isUploadingSensitivitiesTable}
            />
            {isUploadingSensitivitiesTable ? (
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
            onClick={() => fetchSensitivitiesTable()}
            disabled={isDownloadingSensitivitiesTable}
            title="הורדת רגישויות"
            className={`py-2 px-3 rounded-xl shadow-md transition-all flex items-center justify-center text-white
              ${isDownloadingSensitivitiesTable ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isDownloadingSensitivitiesTable ? (
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

      {isAddingSensitivity && (
        <AddSensitivityForm onAdd={handleAddSensitivitySubmit} />
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-600 text-sm w-full">
                שם רגישות
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
  );
};

export default SensitivitiesTableSection;
