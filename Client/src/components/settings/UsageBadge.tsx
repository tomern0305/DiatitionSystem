import React from "react";
import type { VariableUsage } from "../../types";

interface UsageBadgeProps {
  /** null means counts are unavailable — shown as "—", never as "not in use". */
  usage: VariableUsage | null;
}

/** Compact "in use by N products / N meals" indicator for settings tables. */
const UsageBadge: React.FC<UsageBadgeProps> = ({ usage }) => {
  if (!usage) {
    return (
      <span className="text-xs text-gray-300" title="לא ניתן לטעון נתוני שימוש">
        —
      </span>
    );
  }

  const parts: string[] = [];
  if (usage.products > 0) parts.push(`${usage.products} מוצרים`);
  if (usage.meals > 0) parts.push(`${usage.meals} ארוחות`);

  if (parts.length === 0) {
    return <span className="text-xs text-gray-400">לא בשימוש</span>;
  }

  // Meal references block deletion entirely, so they get the stronger colour.
  const tone =
    usage.meals > 0
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <span
      className={`inline-block whitespace-nowrap px-2 py-0.5 rounded-lg border text-xs font-medium ${tone}`}
    >
      {parts.join(" · ")}
    </span>
  );
};

export default UsageBadge;
