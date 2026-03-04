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

// Keeping the older alias for backward compatibility until refactored fully
export interface SensitivityData {
  id: number;
  name: string;
}

export interface TextureData {
  id: number;
  name: string;
}
