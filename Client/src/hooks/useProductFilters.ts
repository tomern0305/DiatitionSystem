import { useState } from "react";
import type { ProductData, RestrictionsData, TexturesData } from "../types";

export type ProductState = "regular" | "warning" | "hidden";

export interface ProductFilters {
  selectedRestrictions: number[];
  selectedTextures: number[];
  showMayContain: boolean;
  handleRestrictionToggle: (id: number) => void;
  handleTextureToggle: (id: number) => void;
  setShowMayContain: (v: boolean) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getProductState: (
    product: ProductData,
    restrictionsData: RestrictionsData[],
    texturesData: TexturesData[],
  ) => ProductState;
}

const useProductFilters = (): ProductFilters => {
  const [selectedRestrictions, setSelectedRestrictions] = useState<number[]>([]);
  const [selectedTextures, setSelectedTextures] = useState<number[]>([]);
  const [showMayContain, setShowMayContain] = useState(false);

  const handleRestrictionToggle = (id: number) =>
    setSelectedRestrictions((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );

  const handleTextureToggle = (id: number) =>
    setSelectedTextures((prev) => (prev.includes(id) ? [] : [id]));

  const clearFilters = () => {
    setSelectedRestrictions([]);
    setSelectedTextures([]);
    setShowMayContain(false);
  };

  const hasActiveFilters =
    selectedRestrictions.length > 0 || selectedTextures.length > 0 || showMayContain;

  const getProductState = (
    product: ProductData,
    restrictionsData: RestrictionsData[],
    texturesData: TexturesData[],
  ): ProductState => {
    const restrictionNames = selectedRestrictions
      .map((id) => restrictionsData.find((r) => r.id === id)?.name)
      .filter(Boolean) as string[];

    if (restrictionNames.length > 0 && product.contains?.some((a) => restrictionNames.includes(a)))
      return "hidden";

    if (restrictionNames.length > 0 && product.mayContain?.some((a) => restrictionNames.includes(a))) {
      return showMayContain ? "warning" : "hidden";
    }

    if (selectedTextures.length > 0) {
      const textureName = texturesData.find((t) => t.id === selectedTextures[0])?.name;
      if (textureName && product.texture !== textureName) return "hidden";
    }

    return "regular";
  };

  return {
    selectedRestrictions,
    selectedTextures,
    showMayContain,
    handleRestrictionToggle,
    handleTextureToggle,
    setShowMayContain,
    clearFilters,
    hasActiveFilters,
    getProductState,
  };
};

export default useProductFilters;
