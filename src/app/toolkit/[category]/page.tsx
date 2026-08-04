import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { RESOURCES } from "@/data/resources";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";

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

        {filteredResources.length === 0 ? (
          <div className="bg-surface rounded-3xl p-12 text-center border border-border/50">
            <p className="text-foreground/70 font-serif text-lg mb-4">We haven't added any strategies here yet.</p>
            <Link href="/submit" className="bg-primary text-white rounded-full px-6 py-2 shadow-sm hover:opacity-90 inline-block font-body">Share a Win</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Link 
                href={`/resource/${resource.slug}`} 
                key={resource.id}
                className="bg-white rounded-[32px] border border-border/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
              >
                <div className="w-16 h-16 mb-4 flex items-center justify-center bg-surface rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
                  <img src={resource.emoji || ""} alt="Icon" className="w-12 h-12 object-contain drop-shadow-md" />
                </div>
                <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">{resource.title}</h3>
                <p className="text-sm font-body text-foreground/70 line-clamp-3 mb-6 flex-1">
                  {resource.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {(resource.tags || []).slice(0,2).map((tag: string) => (
                    <span key={tag} className="bg-surface text-foreground/80 px-2 py-1 rounded text-xs font-mono">{tag}</span>
                  ))}
                  <span className="ml-auto text-xs text-foreground/50">{resource.readTime}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}

// Ensure static generation doesn't fail if we don't return all paths, or just use dynamic
export function generateStaticParams() {
  return TOOLKIT_CATEGORIES.map((c) => ({ category: c.value }));
}
