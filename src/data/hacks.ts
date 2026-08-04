import type { Diagnosis, Symptom, HackSituation } from "@/lib/taxonomy";

export interface Hack {
  slug: string;
  title: string;
  content: string; // Supports \n\n paragraph breaks
  author: string;
  image?: string; // Path under /public/hacks/, e.g. "/hacks/suction-spinner.jpg"
  diagnoses?: Diagnosis[];
  symptoms?: Symptom[];
  situation?: HackSituation;
}

// Hacks are real-world tricks using ordinary household products for neurodivergent kids.
// Distinct from Reviews (purpose-built products) — Hacks repurposes everyday items.
// Jake will populate this array with real hacks.
// Shape: slug, title, content, author, optional image, optional diagnoses/symptoms, optional situation.
export const HACKS: Hack[] = [];