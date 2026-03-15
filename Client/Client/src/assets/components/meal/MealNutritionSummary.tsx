import React from "react";

/**
 * A single macro nutrient descriptor used for bar chart and detail rendering.
 * Includes labels, numeric values, units, and color for visual distinction.
 */
export interface MacroItem {
  label: string;
  value: number;
  unit: string;
  color: string;
}

interface MealNutritionSummaryProps {
  /** The total energy content of the meal in calories. */
  totalCalories: number;
  /** Comprehensive list of macro nutrients and minerals. */
  macros: MacroItem[];
}

/**
 * Renders a premium, consolidated nutritional summary using horizontal bar charts.
 * Optimized for a compact "half-height" display with tight spatial utilization.
 */
const MealNutritionSummary: React.FC<MealNutritionSummaryProps> = ({
  totalCalories,
  macros,
}) => {
  /**
   * Finds the maximum value among all macros to scale the bars proportionally.
   * We exclude sodium as it uses a different unit (mg).
   */
  const maxMacroValue = Math.max(
    ...macros.filter((m) => m.unit === "ג'").map((m) => m.value),
    1,
  );

  const sodiumMax = 1000; // Reference for sodium bar scaling (1000mg)

  return (
    <div className="bg-white rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 p-5 md:p-6 transition-all duration-500 overflow-hidden relative group font-premium">
      {/* Background decoration - subtle indigo glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />

      <div className="relative flex items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-50">
        <div className="space-y-0.5">
          <h3 className="text-gray-900 font-bold text-lg leading-tight uppercase tracking-tight">
            סיכום תזוני
          </h3>
          <p className="text-gray-500 text-[11px] font-medium">
            ערכי הארוחה שנבחרה
          </p>
        </div>

        <div className="flex items-center gap-3 bg-gray-50/80 px-4 py-2 rounded-2xl border border-gray-100/50">
          <div className="flex flex-col items-end">
            <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest leading-none mb-1">
              סה"כ קלוריות
            </span>
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-3xl font-black text-black-600 tabular-nums">
                {totalCalories.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-5 relative">
        {macros.map((m) => {
          const percentage =
            m.label === "נתרן"
              ? Math.min((m.value / sodiumMax) * 100, 100)
              : Math.min((m.value / maxMacroValue) * 100, 100);

          return (
            <div key={m.label} className="group/item flex flex-col justify-end">
              <div className="flex justify-between items-baseline mb-1.5 px-0.5">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {m.label}
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-base font-black text-gray-800 tabular-nums">
                    {m.value.toFixed(1)}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400">
                    {m.unit}
                  </span>
                </div>
              </div>

              <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100/30">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out relative"
                  style={{
                    width: `${m.value > 0 ? Math.max(percentage, 5) : 0}%`,
                    backgroundColor: m.color,
                    boxShadow: `0 0 12px ${m.color}22`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        .font-premium { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
      `}</style>
    </div>
  );
};

export default MealNutritionSummary;
