import { useState, useEffect } from "react";
import type { ProductData, CategoryData, RestrictionsData, TexturesData, MealData } from "../types";

const API = import.meta.env.VITE_API_URL;

export interface ProductCatalog {
  loading: boolean;
  error: string | null;
  products: ProductData[];
  categories: CategoryData[];
  restrictionsData: RestrictionsData[];
  texturesData: TexturesData[];
  meals: MealData[];
  /** Returns products filtered by search term, sorted, grouped by category. */
  getCatalog: (
    searchTerm: string,
    sortBy: string,
  ) => { presentCategories: string[]; productsByCategory: Record<string, ProductData[]> };
  /** Returns meals whose restriction/texture filters exactly match the active selections. */
  getSuggestedMeals: (selectedRestrictions: number[], selectedTextures: number[]) => MealData[];
}

const useProductCatalog = (fetchMeals = false): ProductCatalog => {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [restrictionsData, setRestrictionsData] = useState<RestrictionsData[]>([]);
  const [texturesData, setTexturesData] = useState<TexturesData[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requests: Promise<unknown>[] = [
      fetch(`${API}/api/products`).then((r) => { if (!r.ok) throw new Error("Failed to fetch products"); return r.json(); }),
      fetch(`${API}/api/categories`).then((r) => { if (!r.ok) throw new Error("Failed to fetch categories"); return r.json(); }),
      fetch(`${API}/api/sensitivities`).then((r) => { if (!r.ok) throw new Error("Failed to fetch sensitivities"); return r.json(); }),
      fetch(`${API}/api/texture`).then((r) => { if (!r.ok) throw new Error("Failed to fetch textures"); return r.json(); }),
    ];
    if (fetchMeals) {
      requests.push(fetch(`${API}/api/meals`).then((r) => (r.ok ? r.json() : [])).catch(() => []));
    }

    Promise.all(requests)
      .then(([productsData, categoriesData, sensitivitiesData, texturesData, mealsData]) => {
        setProducts(productsData as ProductData[]);
        setCategories(categoriesData as CategoryData[]);
        setRestrictionsData(sensitivitiesData as RestrictionsData[]);
        setTexturesData(texturesData as TexturesData[]);
        if (fetchMeals) setMeals((mealsData as MealData[]) ?? []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [fetchMeals]);

  const getCatalog = (searchTerm: string, sortBy: string) => {
    const filtered = products.filter(
      (p) => p.name.includes(searchTerm) || (p.category && p.category.includes(searchTerm)),
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === "calories_asc") return a.calories - b.calories;
      if (sortBy === "calories_desc") return b.calories - a.calories;
      if (sortBy === "protein_desc") return b.protein - a.protein;
      return 0;
    });

    const productsByCategory = sorted.reduce(
      (acc, product) => {
        const cat = product.category as string;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
      },
      {} as Record<string, ProductData[]>,
    );

    const presentCategories = Object.keys(productsByCategory).sort((a, b) => {
      const idxA = categories.findIndex((c) => c.name === a);
      const idxB = categories.findIndex((c) => c.name === b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    return { presentCategories, productsByCategory };
  };

  const getSuggestedMeals = (selectedRestrictions: number[], selectedTextures: number[]): MealData[] => {
    if (selectedRestrictions.length === 0) return [];
    return meals.filter((meal) => {
      const mealIds = meal.filters.restriction_ids;
      const exactMatch =
        mealIds.length === selectedRestrictions.length &&
        selectedRestrictions.every((id) => mealIds.includes(id));
      if (!exactMatch) return false;
      if (selectedTextures.length > 0) {
        return selectedTextures.every((id) => meal.filters.texture_ids.includes(id));
      }
      return true;
    });
  };

  return { loading, error, products, categories, restrictionsData, texturesData, meals, getCatalog, getSuggestedMeals };
};

export default useProductCatalog;
