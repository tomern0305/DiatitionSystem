import { useMemo } from "react";
import type { RestrictionsData } from "../types";

/** Resolves selected restriction IDs to their display names. */
export function useAllergenNames(
  selectedIds: number[],
  restrictionsData: RestrictionsData[],
): string[] {
  return useMemo(
    () =>
      selectedIds
        .map((id) => restrictionsData.find((r) => r.id === id)?.name)
        .filter((n): n is string => !!n),
    [selectedIds, restrictionsData],
  );
}
