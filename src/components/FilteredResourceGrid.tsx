"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import type { Resource } from "@/data/resources";
import type { Diagnosis, Symptom } from "@/lib/taxonomy";

interface Props {
  resources: Resource[];
}

export default function FilteredResourceGrid({ resources }: Props) {
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
      return resources;
    }
    return resources.filter((r) => {
      // Diagnosis match: resource tagged with at least one selected diagnosis
      const dxOk =
        activeDiagnoses.length === 0 ||
        activeDiagnoses.some((d) => r.diagnoses?.includes(d));
      // Symptom match: resource tagged with at least one selected symptom
      const sxOk =
        activeSymptoms.length === 0 ||
        activeSymptoms.some((s) => r.symptoms?.includes(s));
      return dxOk && sxOk;
    });
  }, [resources, activeDiagnoses, activeSymptoms]);

  const hasFilters = activeDiagnoses.length > 0 || activeSymptoms.length > 0;

  if (filtered.length === 0) {
    return (
      <div className="bg-surface rounded-3xl p-12 text-center border border-border/50">
        <p className="text-foreground/70 font-serif text-lg mb-4">
          {hasFilters
            ? "No resources match those filters."
            : "We haven't added any strategies here yet."}
        </p>
        <Link
          href="/submit"
          className="bg-primary text-white rounded-full px-6 py-2 shadow-sm hover:opacity-90 inline-block font-body"
        >
          Share a Win
        </Link>
      </div>
    );
  }

  // Deduplicate by slug (local + remote may overlap)
  const seen = new Set<string>();
  const unique = filtered.filter((r) => {
    if (seen.has(r.slug)) return false;
    seen.add(r.slug);
    return true;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {unique.map((resource) => (
        <Link
          href={`/resource/${resource.slug}`}
          key={resource.id}
          className="bg-white rounded-[32px] border border-border/50 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col relative"
        >
          <div className="w-16 h-16 mb-4 flex items-center justify-center bg-surface rounded-2xl shrink-0 group-hover:scale-110 transition-transform">
            <img
              src={resource.emoji || ""}
              alt="Icon"
              className="w-12 h-12 object-contain drop-shadow-md"
            />
          </div>
          <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-sm font-body text-foreground/70 line-clamp-3 mb-6 flex-1">
            {resource.description}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {(resource.tags || []).slice(0, 2).map((tag: string) => (
              <span
                key={tag}
                className="bg-surface text-foreground/80 px-2 py-1 rounded text-xs font-mono"
              >
                {tag}
              </span>
            ))}
            <span className="ml-auto text-xs text-foreground/50">
              {resource.readTime}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}