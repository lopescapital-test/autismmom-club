"use client";
import Link from "next/link";
import { TOOLKIT_CATEGORIES, SITE_SECTIONS } from "@/lib/taxonomy";

// Custom order: Row 1 = food, routines, sensory, hacks | Row 2 = communication, reviews, school, wall
const ALL_SECTIONS = [
  { ...TOOLKIT_CATEGORIES.find((c) => c.value === "food")!, href: "/toolkit/food" },
  { ...TOOLKIT_CATEGORIES.find((c) => c.value === "routines")!, href: "/toolkit/routines" },
  { ...TOOLKIT_CATEGORIES.find((c) => c.value === "sensory")!, href: "/toolkit/sensory" },
  { ...SITE_SECTIONS.find((s) => s.value === "hacks")! },
  { ...TOOLKIT_CATEGORIES.find((c) => c.value === "communication")!, href: "/toolkit/communication" },
  { ...TOOLKIT_CATEGORIES.find((c) => c.value === "reviews")!, href: "/toolkit/reviews" },
  { ...TOOLKIT_CATEGORIES.find((c) => c.value === "school")!, href: "/toolkit/school" },
  { ...SITE_SECTIONS.find((s) => s.value === "wall")! },
];

export default function Categories() {
  return (
    <section id="explore" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-12 text-center md:text-left">Explore the Toolkit</h2>

      {/* 4 columns at lg+ = two even rows of 4 cards, no orphan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ALL_SECTIONS.map((sec) => (
          <Link
            key={sec.value}
            href={sec.href}
            className="bg-white rounded-[32px] border border-border/50 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center justify-start relative overflow-hidden h-full min-h-[320px]"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-surface/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-24 h-24 mb-6 flex items-center justify-center drop-shadow-xl relative z-10">
              <img src={sec.emojiImage} alt={sec.label} className="w-full h-full object-contain drop-shadow-md animate-emoji-bounce animate-emoji-shimmer" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">{sec.label}</h3>
            <p className="text-base font-body text-foreground/70 leading-relaxed relative z-10">
              {sec.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}