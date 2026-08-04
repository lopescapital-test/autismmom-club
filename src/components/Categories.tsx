"use client";
import Link from "next/link";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";

export default function Categories() {
  return (
    <section id="explore" className="py-24 px-6 md:px-12 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-12 text-center md:text-left">Explore the Toolkit</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {TOOLKIT_CATEGORIES.map((cat) => (
          <Link href={`/toolkit/${cat.value}`} key={cat.value} className="bg-white rounded-[32px] border border-border/50 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col items-center text-center justify-start relative overflow-hidden h-full min-h-[320px]">
            <div className="absolute inset-0 bg-gradient-to-b from-surface/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-24 h-24 mb-6 flex items-center justify-center transition-transform duration-500 group-hover:scale-110 drop-shadow-xl relative z-10">
              <img src={cat.emojiImage} alt={cat.label} className="w-full h-full object-contain drop-shadow-md" />
            </div>
            <h3 className="text-2xl font-serif text-foreground mb-3 relative z-10 group-hover:text-primary transition-colors">{cat.label}</h3>
            <p className="text-base font-body text-foreground/70 leading-relaxed relative z-10">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
