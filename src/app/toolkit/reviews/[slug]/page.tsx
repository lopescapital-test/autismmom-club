import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { PRODUCTS } from "@/data/products";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_EMOJI } from "@/lib/taxonomy";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return { title: "Product Not Found - Autism+ Moms Club" };
  return {
    title: `${product.name}${product.brand ? ` by ${product.brand}` : ""} - Product Review`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) notFound();

  const catLabel =
    PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label || product.category;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        <Link
          href="/toolkit/reviews"
          className="inline-flex items-center text-sm font-body text-foreground/60 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Product Reviews
        </Link>

        <div className="bg-white rounded-3xl border border-border/50 p-8 md:p-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface shrink-0 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-3xl">{PRODUCT_CATEGORY_EMOJI[product.category]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-foreground/50 uppercase tracking-wider font-body mb-1">
                <span>{catLabel}</span>
                <span className="text-foreground/20">·</span>
                <span>{product.brand || "Unknown brand"}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-base font-body text-foreground/70 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}