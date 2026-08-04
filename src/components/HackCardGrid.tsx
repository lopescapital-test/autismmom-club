"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Hack } from "@/data/hacks";
import type { Diagnosis, Symptom, HackSituation } from "@/lib/taxonomy";
import { HACK_SITUATIONS } from "@/lib/taxonomy";

interface Props {
  hacks: Hack[];
}

export default function HackCardGrid({ hacks }: Props) {
  const searchParams = useSearchParams();

  const activeDiagnoses: Diagnosis[] = useMemo(
    () => (searchParams.get("dx")?.split(",").filter(Boolean) as Diagnosis[]) || [],
    [searchParams]
  );
  const activeSymptoms: Symptom[] = useMemo(
    () => (searchParams.get("sx")?.split(",").filter(Boolean) as Symptom[]) || [],
    [searchParams]
  );
  const activeSituations: HackSituation[] = useMemo(
    () => (searchParams.get("sit")?.split(",").filter(Boolean) as HackSituation[]) || [],
    [searchParams]
  );

  const hasFilters = activeDiagnoses.length > 0 || activeSymptoms.length > 0 || activeSituations.length > 0;

  const filtered = useMemo(() => {
    if (!hasFilters) return hacks;
    return hacks.filter((h) => {
      const dxOk =
        activeDiagnoses.length === 0 ||
        activeDiagnoses.some((d) => h.diagnoses?.includes(d));
      const sxOk =
        activeSymptoms.length === 0 ||
        activeSymptoms.some((s) => h.symptoms?.includes(s));
      const sitOk =
        activeSituations.length === 0 ||
        (h.situation && activeSituations.includes(h.situation));
      return dxOk && sxOk && sitOk;
    });
  }, [hacks, activeDiagnoses, activeSymptoms, activeSituations, hasFilters]);

  if (filtered.length === 0) {
    return (
      <div className="bg-surface rounded-2xl border border-border/50 p-12 text-center">
        <p className="text-foreground/60 font-body">
          {hasFilters
            ? "No hacks match those filters."
            : "No hacks yet. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filtered.map((hack) => (
        <Link
          key={hack.slug}
          href={`/hacks/${hack.slug}`}
          className="bg-white rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
        >
          {/* Photo area */}
          {hack.image ? (
            <div className="relative w-full aspect-[4/3] bg-surface overflow-hidden">
              <Image
                src={hack.image}
                alt={hack.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-primary/5 to-surface flex items-center justify-center">
              <span className="text-5xl">🧠</span>
            </div>
          )}

          {/* Info */}
          <div className="p-5">
            {hack.situation && (
              <span className="inline-block text-[11px] font-body font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-2">
                {HACK_SITUATIONS.find((s) => s.value === hack.situation)?.label || hack.situation}
              </span>
            )}
            <h3 className="font-serif text-foreground font-semibold group-hover:text-primary transition-colors line-clamp-2 text-lg mb-1">
              {hack.title}
            </h3>
            {hack.author && (
              <p className="text-xs text-foreground/50 font-body">by {hack.author}</p>
            )}
            <p className="text-sm text-foreground/60 font-body mt-2 line-clamp-2">
              {hack.content.split("\n\n")[0]}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}