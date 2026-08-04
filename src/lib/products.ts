export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string | null;
  category: ProductCategory;
  description: string | null;
  image_url: string | null;
  status: "visible" | "hidden";
  created_at: string;
}

export interface ProductReview {
  id: string;
  product_slug: string;
  rating: number;
  author: string;
  text: string;
  diagnoses: string[];
  symptoms: string[];
  status: "visible" | "hidden";
  created_at: string;
}

export const PRODUCT_CATEGORIES = [
  { value: "learning-toys", label: "Learning Toys" },
  { value: "therapy-equipment", label: "Therapy Equipment" },
  { value: "food-brands", label: "Food & Allergy-Friendly Brands" },
  { value: "sensory-tools", label: "Sensory Tools" },
  { value: "clothing-daily-living", label: "Clothing & Daily Living" },
  { value: "tech-apps", label: "Tech & Apps" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];

export const CATEGORY_EMOJI: Record<ProductCategory, string> = {
  "learning-toys": "🧸",
  "therapy-equipment": "⚕️",
  "food-brands": "🍎",
  "sensory-tools": "🧩",
  "clothing-daily-living": "👕",
  "tech-apps": "📱",
};