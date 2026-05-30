import React from "react";

const FIELD_LABELS: Record<string, string> = {
  calories: "קלוריות",
  protein: "חלבון",
  carbs: "פחמימות",
  fat: "שומן",
  sugares: "סוכר",
  sodium: 'נתרן',
};

export interface OutlierFlag {
  field: string;
  z: number;
  mean: number;
}

interface OutlierWarningPopupProps {
  flags: OutlierFlag[];
  onCancel: () => void;
  onConfirm: () => void;
}

const OutlierWarningPopup: React.FC<OutlierWarningPopupProps> = ({ flags, onCancel, onConfirm }) => (
  <>
    <div className="fixed inset-0 bg-black/40 z-50" onClick={onCancel} />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full border border-orange-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-orange-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-lg">ערכים חריגים זוהו</h3>
            <p className="text-sm text-gray-500">הערכים הבאים חורגים מהממוצע באופן משמעותי</p>
          </div>
        </div>

        <div className="space-y-2 mb-5">
          {flags.map((flag) => (
            <div key={flag.field} className="flex items-center justify-between bg-orange-50 px-4 py-2.5 rounded-xl border border-orange-100">
              <span className="font-semibold text-gray-700">{FIELD_LABELS[flag.field] ?? flag.field}</span>
              <span className="text-sm text-orange-700 font-medium">
                {flag.z > 0 ? "גבוה" : "נמוך"} מהממוצע ב־{Math.abs(flag.z)} ס״ת
              </span>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-5">ייתכן שמדובר בשגיאת הקלדה. האם ברצונך להוסיף את המוצר בכל זאת?</p>

        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all">
            בטל
          </button>
          <button onClick={onConfirm} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-sm">
            הוסף בכל זאת
          </button>
        </div>
      </div>
    </div>
  </>
);

export default OutlierWarningPopup;
