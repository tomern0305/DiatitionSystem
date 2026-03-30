// Shared TypeScript interfaces for the application

export interface ProductData {
  id: string;
  category: string;
  image: string;
  name: string;
  iddsi: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugares: number; // Matches the API prop
  sodium: number;
  contains?: string[];
  mayContain?: string[];
  texture?: string;
  texture_id?: number;
  company?: string;
  properties?: string[];
  lastEditDate?: Date; // Optional for some views
  textureNotes?: string;
  allergyNotes?: string;
  forbiddenFor?: string;
}

export interface CategoryData {
  id: number;
  name: string;
}

export interface RestrictionsData {
  id: number;
  name: string;
}

export interface TexturesData {
  id: number;
  name: string;
}

export interface DietData {
  id: number;
  name: string;
}

// Keeping the older alias for backward compatibility until refactored fully
export interface SensitivityData {
  id: number;
  name: string;
}

export interface TextureData {
  id: number;
  name: string;
}

/** Represents a saved meal as returned by GET /api/meals and GET /api/meals/:id. */
export interface MealData {
  id: number;
  name: string;
  description: string;
  diet_id: number | null;
  diet_name: string | null;
  product_ids: number[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugares: number;
    sodium: number;
  };
  filters: {
    restriction_ids: number[];
    texture_ids: number[];
    show_may_contain: boolean;
  };
  created_at: string;
  updated_at: string;
}
