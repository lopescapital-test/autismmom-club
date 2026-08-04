"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import type { Product } from "@/data/products";
import type { Diagnosis, Symptom, ProductCategory } from "@/lib/taxonomy";
import { PRODUCT_CATEGORY_EMOJI } from "@/lib/taxonomy";

interface Props {
  products: Product[];
  category: ProductCategory;
}

export default function FilteredProductGrid({ products, category }: Props) {
  const searchParams = useSearchParams();

  const activeDiagnoses: Diagnosis[] = useMemo(
    () => (searchParams.get("dx")?.split(",").filter(Boolean) as Diagnosis[]) || [],
    [searchParams]
  );
  const activeSymptoms: Symptom[] = useMemo(
    () => (searchParams.get("sx")?.split(",").filter(Boolean) as Symptom[]) || [],
    [searchParams]
  );

  const filtered = useMemo(() => {
    if (activeDiagnoses.length === 0 && activeSymptoms.length === 0) {
      return products;
    }
    return products.filter((p) => {
      const dxOk =
        activeDiagnoses.length === 0 ||
        activeDiagnoses.some((d) => p.diagnoses?.includes(d));
      const sxOk =
        activeSymptoms.length === 0 ||
        activeSymptoms.some((s) => p.symptoms?.includes(s));
      return dxOk && sxOk;
    });
  }, [products, activeDiagnoses, activeSymptoms]);

  const hasFilters = activeDiagnoses.length > 0 || activeSymptoms.length > 0;

  if (filtered.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border/50 p-8 text-center">
        <p className="text-foreground/60 font-body text-sm">
          {hasFilters
            ? "No products match those filters."
            : "No products reviewed in this category yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((product) => (
        <Link
          key={product.slug}
          href={`/toolkit/reviews/${product.slug}`}
          className="bg-white rounded-2xl border border-border/50 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-surface shrink-0 flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt="" className="w-10 h-10 object-contain" />
              ) : (
                <span className="text-2xl">{PRODUCT_CATEGORY_EMOJI[category]}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-foreground font-semibold group-hover:text-primary transition-colors truncate">
                {product.name}
              </h3>
              {product.brand && (
                <p className="text-xs text-foreground/50 mt-0.5">{product.brand}</p>
              )}
              <p className="text-xs text-foreground/40 mt-1 line-clamp-1">{product.description}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}