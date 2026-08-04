import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import { PRODUCT_CATEGORIES } from "@/lib/products";
import { upsertProduct } from "./actions";
import { toggleProductStatus } from "../reviews/actions";

export const metadata: Metadata = {
  title: "Manage Products - Admin",
};

export const dynamic = "force-dynamic";

async function getProducts() {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("name");
  return data || [];
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1">
        <h1 className="text-3xl font-serif text-foreground mb-8">Manage Products</h1>

        {/* Add product form */}
        <details className="mb-10 bg-surface rounded-2xl border border-border/50">
          <summary className="px-6 py-4 cursor-pointer font-bold text-foreground font-body hover:bg-surface/80 rounded-2xl transition-colors">
            + Add Product
          </summary>
          <div className="px-6 pb-6">
            <form action={upsertProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <input
                name="slug"
                placeholder="slug"
                required
                className="px-3 py-2 rounded-lg border border-border/50 text-sm"
              />
              <input
                name="name"
                placeholder="Product name"
                required
                className="px-3 py-2 rounded-lg border border-border/50 text-sm"
              />
              <input
                name="brand"
                placeholder="Brand"
                className="px-3 py-2 rounded-lg border border-border/50 text-sm"
              />
              <select
                name="category"
                required
                className="px-3 py-2 rounded-lg border border-border/50 text-sm"
              >
                <option value="">Select category</option>
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                name="description"
                placeholder="Short description"
                className="px-3 py-2 rounded-lg border border-border/50 text-sm sm:col-span-2"
              />
              <input
                name="image_url"
                placeholder="Image URL (optional)"
                className="px-3 py-2 rounded-lg border border-border/50 text-sm sm:col-span-2"
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 sm:col-span-2"
              >
                Save Product
              </button>
            </form>
          </div>
        </details>

        {/* Product list */}
        {products.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border/50 p-8 text-center">
            <p className="text-foreground/60 text-sm">No products yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-border/50 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-bold text-foreground text-sm truncate">
                    {p.name}
                  </p>
                  <p className="text-xs text-foreground/50 truncate">
                    {p.brand && `${p.brand} · `}
                    {PRODUCT_CATEGORIES.find((c) => c.value === p.category)?.label || p.category}
                    {p.slug && ` · /toolkit/reviews/${p.slug}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      p.status === "visible"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {p.status}
                  </span>
                  <form action={toggleProductStatus.bind(null, p.id, p.status)}>
                    <button
                      type="submit"
                      className="text-xs text-foreground/50 hover:text-primary underline underline-offset-2"
                    >
                      Toggle
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}