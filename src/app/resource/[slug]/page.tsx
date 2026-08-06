import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { RESOURCES } from "@/data/resources";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FlippableResourceCard from "@/components/FlippableResourceCard";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const p = await params;
  const slug = p?.slug;

  // Check local data first
  const localResource = RESOURCES.find(r => r.slug === slug);
  if (localResource?.category === "food") {
    return {
      icons: [{ rel: "icon", url: "/recipe-favicon-32.png", sizes: "32x32" }, { rel: "icon", url: "/recipe-favicon.svg", type: "image/svg+xml" }],
    };
  }

  // Check Supabase
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("resources")
      .select("category")
      .eq("slug", slug)
      .single();
    
    if (data?.category === "food") {
      return {
        icons: [{ rel: "icon", url: "/recipe-favicon-32.png", sizes: "32x32" }, { rel: "icon", url: "/recipe-favicon.svg", type: "image/svg+xml" }],
      };
    }
  } catch {}

  // Not a recipe page, use default favicon
  return {};
}

export default async function ResourcePage({ params }: { params: { slug: string } }) {
  const p = await params;
  const slug = p?.slug;

  // 1. Try to find in local static mock data
  let resource: any = RESOURCES.find(r => r.slug === slug);

  // 2. If not found locally, fetch from Supabase
  if (!resource) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("slug", slug)
      .single();
      
    if (data && !error) {
      resource = data;
    }
  }

  // Fetch global comments
  const supabase = await createClient();
  const { data: globalComments } = await supabase
    .from("comments")
    .select("*")
    .eq("resource_slug", slug)
    .or("status.is.null,status.neq.hidden")
    .order("created_at", { ascending: true });

  // 3. If STILL not found, throw 404
  if (!resource) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col bg-surface/30">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-3xl mx-auto w-full flex-1">
        
        <Link href={`/toolkit/${resource.category}`} className="inline-flex items-center text-sm font-body text-foreground/60 hover:text-primary transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to {TOOLKIT_CATEGORIES.find((c) => c.value === resource.category)?.label ?? resource.category}
        </Link>

        <FlippableResourceCard resource={resource} initialComments={globalComments || []} />

      </div>
      <Footer />
    </main>
  );
}

export function generateStaticParams() {
  return RESOURCES.map(r => ({ slug: r.slug }));
}
