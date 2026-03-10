import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

/** A single macro nutrient descriptor used for chart and tile rendering. */
export interface MacroItem {
  label: string;
  value: number;
  unit: string;
  color: string;
}

interface MealNutritionSummaryProps {
  /** Total calorie count from all selected products. */
  totalCalories: number;
  /** Array of macro values used for the donut chart and tiles. */
  macros: MacroItem[];
}

const MealNutritionSummary: React.FC<MealNutritionSummaryProps> = ({
  totalCalories,
  macros,
}) => {
  /** Only macros with a non-zero value are passed to the chart. */
  const chartData = macros.filter((m) => m.value > 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-gray-800 font-bold text-lg mb-5">סיכום תזונתי</h3>

      <div className="flex items-center gap-6">
        {/* ── Donut chart ────────────────────────────────────────────────── */}
        <div className="w-32 h-32 shrink-0">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={56}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any, _: any, props: any) => [
                    `${Number(v).toFixed(1)} ${props.payload.unit || "ג'"}`,
                    "",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px",
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-xs text-center leading-snug p-3">
              הוסף מרכיבים
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* ── Calorie total ──────────────────────────────────────────────── */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-0.5">סה"כ קלוריות</p>
            <p className="text-3xl font-black text-gray-800 tracking-tight">
              {totalCalories.toFixed(0)}
              <span className="text-base font-normal text-gray-400 mr-1">
                קל'
              </span>
            </p>
          </div>

          {/* ── Macro tiles ────────────────────────────────────────────────── */}
          <div className="grid grid-cols-3 gap-2">
            {macros.map((m) => (
              <div
                key={m.label}
                className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="text-xs text-gray-500">{m.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {m.value.toFixed(1)}
                  <span className="text-xs text-gray-400 font-normal mr-0.5">
                    {m.unit}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealNutritionSummary;
