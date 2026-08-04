import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { DIAGNOSES, SYMPTOMS } from "@/lib/taxonomy";
import { toggleReviewStatus } from "./actions";

export const metadata: Metadata = {
  title: "Moderate Reviews - Admin",
};

export const dynamic = "force-dynamic";

async function getReviews() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("product_reviews")
    .select("*, products!inner(name)")
    .order("created_at", { ascending: false });
  return data || [];
}

function StarDisplay({ rating }: { rating: number }) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminReviewsPage() {
  const reviews = await getReviews();

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1">
        <h1 className="text-3xl font-serif text-foreground mb-8">
          Moderate Reviews
        </h1>

        {reviews.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border/50 p-8 text-center">
            <p className="text-foreground/60 text-sm">No reviews yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border p-5 ${
                  r.status === "hidden"
                    ? "border-red-200 opacity-60"
                    : "border-border/50"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {r.author}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {formatDate(r.created_at)} ·{" "}
                      {r.products?.name || r.product_slug}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-yellow-500 text-sm">
                      <StarDisplay rating={r.rating} />
                    </span>
                    <form action={toggleReviewStatus.bind(null, r.id, r.status)}>
                      <button
                        type="submit"
                        className={`text-xs underline underline-offset-2 ${
                          r.status === "hidden"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {r.status === "visible"
                          ? "Hide"
                          : "Show"}
                      </button>
                    </form>
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                  {r.text}
                </p>
                {(r.diagnoses?.length > 0 || r.symptoms?.length > 0) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.diagnoses?.map((d: string) => (
                      <span
                        key={d}
                        className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                      >
                        {DIAGNOSES.find((dx) => dx.value === d)?.label || d}
                      </span>
                    ))}
                    {r.symptoms?.map((s: string) => (
                      <span
                        key={s}
                        className="text-[11px] bg-surface text-foreground/70 px-2 py-0.5 rounded-full"
                      >
                        {SYMPTOMS.find((sx) => sx.value === s)?.label || s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}