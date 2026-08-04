// ───────────────────────────────────────────────────────────
// Taxonomy — single source of truth for categories and tags.
// Every hardcoded category list in the codebase should import
// from here. Do not duplicate these strings inline.
// ───────────────────────────────────────────────────────────

export const TOOLKIT_CATEGORIES = [
  {
    value: "food",
    label: "Food & Recipes",
    emojiImage: "/emojis/bento-box.webp",
    description: "Texture, safe foods, and sensory-friendly recipes.",
  },
  {
    value: "routines",
    label: "Routines",
    emojiImage: "/emojis/sun-behind-cloud.webp",
    description: "Mornings, transitions, bedtime, and meltdowns.",
  },
  {
    value: "sensory",
    label: "Sensory",
    emojiImage: "/emojis/musical-notes.webp",
    description: "Tools, spaces, and regulation strategies.",
  },
  {
    value: "communication",
    label: "Communication",
    emojiImage: "/emojis/studio-microphone.webp",
    description: "AAC, scripts, and shutdown vs. meltdown.",
  },
  {
    value: "reviews",
    label: "Reviews",
    emojiImage: "/emojis/star.webp",
    description: "Honest, non-affiliate product reviews",
  },
  {
    value: "school",
    label: "School",
    emojiImage: "/emojis/backpack.webp",
    description: "IEPs, providers, and insurance navigation.",
  },
] as const;

export type ResourceCategory = (typeof TOOLKIT_CATEGORIES)[number]["value"];

// Unicode emoji characters for compact display (discuss chips, etc.)
export const CATEGORY_EMOJI_CHAR: Record<string, string> = {
  general: "💬",
  food: "🍲",
  routines: "📋",
  sensory: "🧩",
  communication: "🗣️",
  reviews: "⭐",
  school: "🏫",
};

// Derived from TOOLKIT_CATEGORIES — no literal labels duplicated for the 6 shared values.
export const DISCUSS_CATEGORIES = [
  { value: "general" as const, label: "General" as const },
  ...TOOLKIT_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
];

export type DiscussCategory = (typeof DISCUSS_CATEGORIES)[number]["value"];

export const ALL_FILTER = { value: "all" as const, label: "All" as const };

export const DIAGNOSES = [
  { value: "autism", label: "Autism" },
  { value: "adhd", label: "ADHD" },
] as const;

export type Diagnosis = (typeof DIAGNOSES)[number]["value"];

export const SYMPTOMS = [
  { value: "mood-swings", label: "Mood Swings" },
  { value: "stimming", label: "Stimming" },
  { value: "eating", label: "Eating" },
  { value: "sleep", label: "Sleep" },
  { value: "restlessness", label: "Restlessness" },
  { value: "high-energy", label: "High Energy" },
  { value: "sensory-overload", label: "Sensory Overload" },
  { value: "transitions", label: "Transitions" },
  { value: "speech-language", label: "Speech & Language" },
  { value: "toileting", label: "Toileting" },
] as const;

export type Symptom = (typeof SYMPTOMS)[number]["value"];