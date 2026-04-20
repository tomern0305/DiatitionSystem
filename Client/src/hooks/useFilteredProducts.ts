import { useMemo } from "react";
import type { ProductData, TexturesData } from "../types";
import type { AnnotatedProduct } from "../components/meal/ProductLibrary";

interface FilterOptions {
  searchTerm: string;
  allergenNames: string[];
  showMayContain: boolean;
  selectedTextures: number[];
  texturesData: TexturesData[];
}

/** Annotates products with allergen warnings and applies all active filters. */
export function useFilteredProducts(
  products: ProductData[],
  options: FilterOptions,
): AnnotatedProduct[] {
  const { searchTerm, allergenNames, showMayContain, selectedTextures, texturesData } = options;
  return useMemo((): AnnotatedProduct[] => {
    return products
      .map((p) => ({
        ...p,
        _warnings: allergenNames.filter((a) => p.mayContain?.includes(a)),
      }))
      .filter((p) => {
        if (searchTerm && !p.name.includes(searchTerm)) return false;
        if (allergenNames.length > 0 && p.contains?.some((a) => allergenNames.includes(a)))
          return false;
        if (!showMayContain && p._warnings.length > 0) return false;
        if (selectedTextures.length > 0) {
          const texName = texturesData.find((t) => t.id === selectedTextures[0])?.name;
          if (texName && p.texture !== texName) return false;
        }
        return true;
      });
  }, [products, searchTerm, allergenNames, showMayContain, selectedTextures, texturesData]);
}
