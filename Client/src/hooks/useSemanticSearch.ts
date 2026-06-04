import { useState, useEffect, useRef } from "react";
import type { ProductData } from "../types";

export interface SemanticProduct extends ProductData {
  distance: number;
}

const DEBOUNCE_MS = 400;
const MIN_QUERY_LEN = 3;

/** Debounced semantic search: sends the query to the backend embedding endpoint. */
const useSemanticSearch = (query: string, enabled: boolean) => {
  const [results, setResults] = useState<SemanticProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || query.length <= MIN_QUERY_LEN) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/semantic-search`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, limit: 20 }),
          }
        );
        if (!res.ok) throw new Error("search failed");
        setResults(await res.json());
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, enabled]);

  return { results, loading };
};

export default useSemanticSearch;
