import type { ProductCategory, Diagnosis, Symptom } from "@/lib/taxonomy";

export interface Product {
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  image?: string;
  diagnoses?: Diagnosis[];
  symptoms?: Symptom[];
}

// Products are a curated list — same pattern as RESOURCES in resources.ts.
// Jake will populate this array with real products.
// Shape: slug, name, brand, category, description, optional image path, optional diagnoses/symptoms.
export const PRODUCTS: Product[] = [];