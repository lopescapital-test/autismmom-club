import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { PRODUCT_CATEGORIES, CATEGORY_EMOJI } from "@/lib/products";
import { DIAGNOSES, SYMPTOMS } from "@/lib/taxonomy";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, ArrowLeft, ChevronDown } from "lucide-react";
import ReviewForm from "./ReviewForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, brand, description")
    .eq("slug", slug)
    .eq("status", "visible")
    .single();

  if (!product) return { title: "Product Not Found - Autism+ Moms Club" };

  return {
    title: `${product.name}${product.brand ? ` by ${product.brand}` : ""} - Product Review`,
    description: product.description || `Reviews for ${product.name}`,
  };
}

function StarDisplay({ rating, size = "md" }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${cls} ${
            i <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300"
          }`}
        />
      ))}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("status", "visible")
    .single();

  if (!product) notFound();

  const { data: reviews } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_slug", slug)
    .eq("status", "visible")
    .order("created_at", { ascending: false });

  const catLabel =
    PRODUCT_CATEGORIES.find((c) => c.value === product.category)?.label ||
    product.category;

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0;

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        {/* Breadcrumb */}
        <Link
          href="/toolkit/reviews"
          className="inline-flex items-center text-sm font-body text-foreground/60 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Product Reviews
        </Link>

        {/* Product header */}
        <div className="bg-white rounded-3xl border border-border/50 p-8 md:p-10 mb-10">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="w-20 h-20 rounded-2xl bg-surface shrink-0 flex items-center justify-center overflow-hidden">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-3xl">{CATEGORY_EMOJI[product.category as keyof typeof CATEGORY_EMOJI]}</span>
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
              {reviews && reviews.length > 0 && (
                <div className="flex items-center gap-3 mt-4">
                  <StarDisplay rating={avgRating} />
                  <span className="text-sm text-foreground/60">
                    {avgRating.toFixed(1)} avg · {reviews.length}{" "}
                    {reviews.length === 1 ? "review" : "reviews"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Existing reviews */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Reviews ({reviews?.length || 0})
          </h2>

          {!reviews || reviews.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-border/50 p-8 text-center">
              <p className="text-foreground/60 font-body">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-border/50 p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold font-serif shrink-0">
                        {review.author.charAt(0)}
                      </span>
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {review.author}
                        </p>
                        <p className="text-xs text-foreground/40">
                          {formatDate(review.created_at)}
                        </p>
                      </div>
                    </div>
                    <StarDisplay rating={review.rating} size="sm" />
                  </div>
                  <p className="text-sm font-body text-foreground/80 leading-relaxed whitespace-pre-wrap">
                    {review.text}
                  </p>
                  {(review.diagnoses?.length > 0 || review.symptoms?.length > 0) && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {review.diagnoses?.map((d: string) => {
                        const label = DIAGNOSES.find((dx) => dx.value === d)?.label || d;
                        return (
                          <span
                            key={d}
                            className="bg-primary/10 text-primary text-[11px] px-2 py-0.5 rounded-full font-medium"
                          >
                            {label}
                          </span>
                        );
                      })}
                      {review.symptoms?.map((s: string) => {
                        const label = SYMPTOMS.find((sx) => sx.value === s)?.label || s;
                        return (
                          <span
                            key={s}
                            className="bg-surface text-foreground/70 text-[11px] px-2 py-0.5 rounded-full font-medium"
                          >
                            {label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Write a review */}
        <section className="border-t border-border/40 pt-10">
          <h2 className="text-2xl font-serif text-foreground mb-6">
            Write a Review
          </h2>
          <ReviewForm productSlug={slug} />
        </section>
      </div>
      <Footer />
    </main>
  );
}