import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { HACKS } from "@/data/hacks";
import Link from "next/link";
import TaxonomyFilter from "@/components/TaxonomyFilter";
import { Suspense } from "react";
import HackCardGrid from "@/components/HackCardGrid";
import SituationFilter from "@/components/SituationFilter";

export const metadata: Metadata = {
  title: "Mom Hacks - Autism+ Moms Club",
  description: "Real-world tricks using everyday products for neurodivergent kids.",
};

export default function HacksPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Mom Hacks</h1>
        <p className="text-lg font-body text-foreground/70 max-w-2xl mb-2">
          Clever real-world tricks using ordinary household products. Not purpose-built gear
          — just the stuff moms figure out that actually works.
        </p>
        <p className="text-sm font-body text-foreground/50 mb-8">
          Got a hack?{" "}
          <Link href="/submit" className="text-primary underline underline-offset-2">
            Share your trick
          </Link>
          .
        </p>

        <Suspense fallback={<div className="h-12 rounded-xl bg-surface/50 animate-pulse mb-10" />}>
          <div className="mb-10 flex flex-col sm:flex-row gap-3">
            <TaxonomyFilter />
            <SituationFilter />
          </div>
        </Suspense>

        <Suspense fallback={<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface rounded-2xl animate-pulse h-64" />
          ))}
        </div>}>
          <HackCardGrid hacks={HACKS} />
        </Suspense>

        {HACKS.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border/50 p-12 text-center mt-8">
            <div className="text-5xl mb-4">🧠</div>
            <h2 className="text-2xl font-serif text-foreground mb-2">No hacks yet</h2>
            <p className="text-foreground/60 font-body max-w-md mx-auto">
              Mom Hacks are coming soon. Know a clever trick using an ordinary household
              item?{" "}
              <Link href="/submit" className="text-primary underline underline-offset-2">
                Tell us about it
              </Link>
              .
            </p>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}