import { useState, useCallback } from "react";
import type { VariableUsage, VariableUsageMap } from "../types";

interface PendingDelete {
  id: number;
  name: string;
}

/**
 * Shared delete flow for settings variables (sensitivities, textures, diets, categories).
 * Loads per-item usage counts and drives the confirmation dialog.
 */
export const useVariableUsage = (
  /** Resource path without the /api prefix, e.g. "sensitivities" or "texture". */
  resource: string,
  /** Called after a successful delete so the caller can refresh its list. */
  onDeleted: () => void,
) => {
  // A missing entry means "unknown", never "not in use" — see getUsage below.
  const [usageMap, setUsageMap] = useState<VariableUsageMap>({});
  const [pending, setPending] = useState<PendingDelete | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/${resource}/usage`,
      );
      if (!res.ok) throw new Error("Failed to fetch usage");
      setUsageMap(await res.json());
    } catch {
      // Keep whatever we had; never blank the map into a false "not in use".
    }
  }, [resource]);

  const getUsage = useCallback(
    (id: number): VariableUsage | null => usageMap[id] ?? null,
    [usageMap],
  );

  /** Opens the confirmation dialog for one item, refreshing usage counts first. */
  const requestDelete = useCallback(
    async (id: number, name: string) => {
      setError(null);
      await fetchUsage();
      setPending({ id, name });
    },
    [fetchUsage],
  );

  const cancelDelete = useCallback(() => {
    setPending(null);
    setError(null);
  }, []);

  const confirmDelete = useCallback(
    async () => {
      if (!pending) return;
      setIsDeleting(true);
      setError(null);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/${resource}/${pending.id}`,
          { method: "DELETE" },
        );
        const data = await res.json();

        if (!res.ok) {
          // A 409 carries authoritative counts — feed them back so the dialog
          // switches to the "in use" branch instead of offering delete again.
          if (data.usage) {
            setUsageMap((prev) => ({ ...prev, [pending.id]: data.usage }));
          }
          throw new Error(data.message || data.error || "המחיקה נכשלה");
        }

        setPending(null);
        onDeleted();
        fetchUsage();
      } catch (err) {
        setError(err instanceof Error ? err.message : "המחיקה נכשלה");
      } finally {
        setIsDeleting(false);
      }
    },
    [pending, resource, onDeleted, fetchUsage],
  );

  return {
    fetchUsage,
    getUsage,
    pending,
    pendingUsage: pending ? getUsage(pending.id) : null,
    isDeleting,
    error,
    requestDelete,
    cancelDelete,
    confirmDelete,
  };
};
