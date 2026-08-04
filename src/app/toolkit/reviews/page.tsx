import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { PRODUCT_CATEGORIES, CATEGORY_EMOJI } from "@/lib/products";
import type { Product, ProductCategory } from "@/lib/products";
import { RESOURCES } from "@/data/resources";
import Link from "next/link";
import { Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Product Reviews - Autism+ Moms Club",
  description: "Real, non-affiliate product reviews from neurodivergent families.",
};

export const dynamic = "force-dynamic";

async function getProducts(): Promise<{
  products: Product[];
  avgRatings: Record<string, number>;
  reviewCounts: Record<string, number>;
}> {
  const avgRatings: Record<string, number> = {};
  const reviewCounts: Record<string, number> = {};

  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .eq("status", "visible")
      .order("name");

    const { data: reviews } = await supabase
      .from("product_reviews")
      .select("product_slug, rating")
      .eq("status", "visible");

    const bySlug: Record<string, number[]> = {};
    for (const r of reviews || []) {
      if (!bySlug[r.product_slug]) bySlug[r.product_slug] = [];
      bySlug[r.product_slug].push(r.rating);
    }
    for (const [slug, ratings] of Object.entries(bySlug)) {
      avgRatings[slug] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      reviewCounts[slug] = ratings.length;
    }

    return { products: products || [], avgRatings, reviewCounts };
  } catch (e) {
    console.error("[reviews] DB not ready yet:", e instanceof Error ? e.message : e);
    return { products: [], avgRatings, reviewCounts };
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage() {
  const { products, avgRatings, reviewCounts } = await getProducts();

  // Group by category
  const grouped: Record<ProductCategory, Product[]> = {} as any;
  for (const cat of PRODUCT_CATEGORIES) grouped[cat.value] = [];
  for (const p of products) {
    if (grouped[p.category]) grouped[p.category].push(p);
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-6xl mx-auto w-full flex-1">
        <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
          Product Reviews
        </h1>
        <p className="text-lg font-body text-foreground/70 max-w-2xl mb-2">
          Honest, non-affiliate reviews from real families. No referral codes, no sponsored
          posts — just what actually worked (or didn't).
        </p>
        <p className="text-sm font-body text-foreground/50 mb-12">
          Have a product to review?{" "}
          <Link href="/submit" className="text-primary underline underline-offset-2">
            Share your experience
          </Link>
          .
        </p>

        {PRODUCT_CATEGORIES.map((cat) => {
          const catProducts = grouped[cat.value];
          return (
            <section key={cat.value} className="mb-16 last:mb-0">
              <h2 className="text-2xl font-serif text-foreground mb-6 flex items-center gap-3">
                <span className="text-2xl">{CATEGORY_EMOJI[cat.value]}</span>
                {cat.label}
                <span className="text-sm font-body text-foreground/40 font-normal">
                  ({catProducts.length})
                </span>
              </h2>

              {catProducts.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-border/50 p-8 text-center">
                  <p className="text-foreground/60 font-body text-sm">
                    No products reviewed in this category yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((product) => {
                    const avg = avgRatings[product.slug];
                    const count = reviewCounts[product.slug] || 0;
                    return (
                      <Link
                        key={product.id}
                        href={`/toolkit/reviews/${product.slug}`}
                        className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-surface shrink-0 flex items-center justify-center overflow-hidden">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt=""
                                className="w-10 h-10 object-contain"
                              />
                            ) : (
                              <span className="text-2xl">{CATEGORY_EMOJI[product.category]}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-serif text-foreground font-semibold group-hover:text-primary transition-colors truncate">
                              {product.name}
                            </h3>
                            {product.brand && (
                              <p className="text-xs text-foreground/50 mt-0.5">{product.brand}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              {avg ? (
                                <>
                                  <StarRating rating={avg} />
                                  <span className="text-xs text-foreground/50">
                                    {count} {count === 1 ? "review" : "reviews"}
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs text-foreground/40">No reviews yet</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}

        {/* Legacy resource articles tagged as reviews */}
        {RESOURCES.filter((r) => r.category === "reviews").length > 0 && (
          <section className="border-t border-border/40 pt-12 mt-12">
            <h2 className="text-xl font-serif text-foreground mb-4">
              Community Resource Articles
            </h2>
            <p className="text-sm font-body text-foreground/60 mb-6 max-w-lg">
              Full-length reviews written by our community before the product review system
              launched.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {RESOURCES.filter((r) => r.category === "reviews").map((r) => (
                <Link
                  key={r.id}
                  href={`/resource/${r.slug}`}
                  className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-surface shrink-0 flex items-center justify-center overflow-hidden">
                      {r.emoji && (
                        <img src={r.emoji} alt="" className="w-10 h-10 object-contain" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif text-foreground font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {r.title}
                      </h3>
                      <p className="text-xs text-foreground/50 mt-0.5 line-clamp-1">
                        {r.description}
                      </p>
                      <p className="text-xs text-foreground/40 mt-1">{r.readTime}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}