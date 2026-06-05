import React from "react";
import type { MealData, ProductData, RestrictionsData, TexturesData } from "../../types";
import { buildMacros } from "../../utils/mealMacros";
import { useAuth } from '../../context/AuthContext';

interface MealCardProps {
  meal: MealData;
  productMap: Map<number, ProductData>;
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  deleting: number | null;
  onEdit: (meal: MealData) => void;
  onDelete: (id: number) => void;
}

type UserRole = 'admin' | 'line' | 'dietitian';

const MealCard: React.FC<MealCardProps> = ({
  meal, productMap, restrictionsData, texturesData, deleting, onEdit, onDelete,
}) => {
  const { user } = useAuth();
  const userType = user?.role as UserRole;
  const macros = buildMacros(meal.nutrition);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header: name, tags, edit/delete */}
      <div className="px-3 py-2.5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-800 text-base leading-snug truncate">{meal.name}</h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {meal.diet_name && (
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  {meal.diet_name}
                </span>
              )}
              {meal.filters.restriction_ids.map((rid) => {
                const rname = restrictionsData.find((r) => r.id === rid)?.name;
                return rname ? (
                  <span key={rid} className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                    ⚠ {rname}
                  </span>
                ) : null;
              })}
              {meal.filters.texture_ids.map((tid) => {
                const tname = texturesData.find((t) => t.id === tid)?.name;
                return tname ? (
                  <span key={tid} className="text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {tname}
                  </span>
                ) : null;
              })}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
          {(userType === 'dietitian' || userType === 'admin') && (
            <button
              onClick={() => onEdit(meal)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="ערוך ארוחה"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
            </button>
            )}
            {(userType === 'dietitian' || userType === 'admin') && (
              <button
                onClick={() => onDelete(meal.id)}
                disabled={deleting === meal.id}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                aria-label="מחק ארוחה"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {meal.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{meal.description}</p>
        )}
      </div>

      {/* Nutrition mini-summary */}
      <div className="px-3 py-2.5 flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xl font-black text-gray-800">
            {meal.nutrition.calories.toFixed(0)}
            <span className="text-xs font-normal text-gray-400 mr-1">קל'</span>
          </span>
          <span className="text-xs text-gray-400">{meal.product_ids.length} מרכיבים</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {macros.map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-lg px-1.5 py-1 border border-gray-100">
              <div className="flex items-center gap-1 mb-0.5">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                <span className="text-xs text-gray-500 truncate">{m.label}</span>
              </div>
              <span className="text-xs font-bold text-gray-800">
                {m.value.toFixed(1)}
                <span className="text-gray-400 font-normal"> {m.unit}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Products list */}
      {meal.product_ids.length > 0 && (
        <div className="mx-3 mb-2.5 rounded-xl border border-gray-100 overflow-hidden">
          {meal.product_ids.map((pid, idx) => {
            const pname = productMap.get(pid)?.name;
            return pname ? (
              <div
                key={pid}
                className={`flex items-center gap-2 px-2.5 py-1.5 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 shrink-0" />
                <span className="text-xs text-gray-700 truncate">{pname}</span>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Footer: creation date + creator name for admins on temp meals */}
      <div className="px-3 py-2 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {new Date(meal.created_at).toLocaleDateString("he-IL", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
        {!meal.is_global && meal.created_by_username && userType === 'admin' && (
          <span className="text-xs text-amber-600 font-medium">{meal.created_by_username}</span>
        )}
      </div>
    </div>
  );
};

export default MealCard;
