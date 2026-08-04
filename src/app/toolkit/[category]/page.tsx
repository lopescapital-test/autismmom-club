import type { Metadata } from "next";
import { Suspense } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { RESOURCES } from "@/data/resources";
import { createClient } from "@/utils/supabase/server";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";
import TaxonomyFilter from "@/components/TaxonomyFilter";
import FilteredResourceGrid from "@/components/FilteredResourceGrid";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const p = await params;
  const category = p?.category || "";
  const isRecipe = category === "food";
  
  return {
    icons: isRecipe
      ? [{ rel: "icon", url: "/recipe-favicon-32.png", sizes: "32x32" }, { rel: "icon", url: "/recipe-favicon.svg", type: "image/svg+xml" }]
      : undefined,
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const p = await params;
  const category = p?.category || "category";
  
  let remoteResources: any[] | null = null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("status", "published")
      .eq("category", category);
    if (error) console.error("Supabase Error:", error);
    remoteResources = data;
  } catch (e) {
    console.error("[toolkit] Supabase fetch failed, falling back to local resources only:", e instanceof Error ? e.message : e);
  }

  const localFiltered = RESOURCES.filter(r => r.category === category);
  const filteredResources = [...localFiltered, ...(remoteResources || [])];

  const catMeta = TOOLKIT_CATEGORIES.find((c) => c.value === category);
  const title = catMeta?.label ?? category;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-6">Toolkit: {title}</h1>
        <p className="text-xl font-body text-foreground/70 max-w-2xl mb-12">
          Practical strategies and tools shared by other moms navigating {title}.
        </p>

        <Suspense fallback={<div className="h-12 rounded-xl bg-surface/50 animate-pulse" />}>
          <div className="mb-10">
            <TaxonomyFilter />
          </div>
        </Suspense>
        <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({length: 3}).map((_, i) => <div key={i} className="bg-white rounded-[32px] border border-border/50 p-6 h-64 animate-pulse" />)}</div>}>
          <FilteredResourceGrid resources={filteredResources} />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}

// Ensure static generation doesn't fail if we don't return all paths, or just use dynamic
export function generateStaticParams() {
  return TOOLKIT_CATEGORIES.map((c) => ({ category: c.value }));
}
