import { useState, useEffect } from "react";
import type { ProductData } from "../types";

const API = import.meta.env.VITE_API_URL;

export function useSimilarProducts(productId: string | null) {
  const [similar, setSimilar] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) {
      setSimilar([]);
      return;
    }
    setLoading(true);
    fetch(`${API}/api/products/${productId}/similar?limit=6`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setSimilar)
      .catch(() => setSimilar([]))
      .finally(() => setLoading(false));
  }, [productId]);

  return { similar, loading };
}
