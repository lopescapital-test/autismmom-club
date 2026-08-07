"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { DIAGNOSES, SYMPTOMS } from "@/lib/taxonomy";
import type { Diagnosis, Symptom } from "@/lib/taxonomy";
import { X, ChevronDown, Filter, Check } from "lucide-react";

interface Props {
  className?: string;
}

export default function TaxonomyFilter({ className = "" }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedDiagnoses: Diagnosis[] = useMemo(
    () => (searchParams.get("dx")?.split(",").filter(Boolean) as Diagnosis[]) || [],
    [searchParams]
  );
  const selectedSymptoms: Symptom[] = useMemo(
    () => (searchParams.get("sx")?.split(",").filter(Boolean) as Symptom[]) || [],
    [searchParams]
  );

  const [openDropdown, setOpenDropdown] = useState<"dx" | "sx" | null>(null);
  const dxRef = useRef<HTMLDivElement>(null);
  const sxRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        (openDropdown === "dx" && dxRef.current && !dxRef.current.contains(e.target as Node)) ||
        (openDropdown === "sx" && sxRef.current && !sxRef.current.contains(e.target as Node))
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  const updateParams = useCallback(
    (dx: Diagnosis[], sx: Symptom[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (dx.length) params.set("dx", dx.join(","));
      else params.delete("dx");
      if (sx.length) params.set("sx", sx.join(","));
      else params.delete("sx");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const toggleDiagnosis = (val: Diagnosis) => {
    const next = selectedDiagnoses.includes(val)
      ? selectedDiagnoses.filter((d) => d !== val)
      : [...selectedDiagnoses, val];
    updateParams(next, selectedSymptoms);
  };

  const toggleSymptom = (val: Symptom) => {
    const next = selectedSymptoms.includes(val)
      ? selectedSymptoms.filter((s) => s !== val)
      : [...selectedSymptoms, val];
    updateParams(selectedDiagnoses, next);
  };

  const clearAll = () => {
    updateParams([], []);
    setOpenDropdown(null);
  };

  const hasFilters = selectedDiagnoses.length > 0 || selectedSymptoms.length > 0;
  const totalActive = selectedDiagnoses.length + selectedSymptoms.length;

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 ${className}`}>
      {/* Diagnosis dropdown */}
      <div className="relative w-full sm:w-auto" ref={dxRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "dx" ? null : "dx")}
          className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-3 sm:py-2.5 rounded-xl border text-sm font-body transition-colors min-h-[48px] touch-manipulation ${
            selectedDiagnoses.length > 0
              ? "bg-primary/10 border-primary/30 text-primary font-semibold"
              : "bg-surface border-border text-foreground/80 hover:border-primary/30"
          }`}
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 shrink-0" />
            Diagnosis{selectedDiagnoses.length > 0 ? ` (${selectedDiagnoses.length})` : ""}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "dx" ? "rotate-180" : ""}`} />
        </button>

        {openDropdown === "dx" && (
          <div className="absolute z-50 mt-1 w-full sm:w-56 bg-white border border-border rounded-xl shadow-xl p-2 space-y-0.5">
            {DIAGNOSES.map((d) => {
              const active = selectedDiagnoses.includes(d.value);
              return (
                <label
                  key={d.value}
                  className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-sm font-body transition-colors cursor-pointer min-h-[44px] touch-manipulation ${
                    active
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                      : "text-foreground/80 hover:bg-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleDiagnosis(d.value)}
                    className="sr-only"
                  />
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "bg-primary border-primary" : "border-border bg-transparent"
                  }`}>
                    {active && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </span>
                  {d.label}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Symptom dropdown */}
      <div className="relative w-full sm:w-auto" ref={sxRef}>
        <button
          type="button"
          onClick={() => setOpenDropdown(openDropdown === "sx" ? null : "sx")}
          className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-3 sm:py-2.5 rounded-xl border text-sm font-body transition-colors min-h-[48px] touch-manipulation ${
            selectedSymptoms.length > 0
              ? "bg-primary/10 border-primary/30 text-primary font-semibold"
              : "bg-surface border-border text-foreground/80 hover:border-primary/30"
          }`}
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4 shrink-0" />
            Symptom{selectedSymptoms.length > 0 ? ` (${selectedSymptoms.length})` : ""}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "sx" ? "rotate-180" : ""}`} />
        </button>

        {openDropdown === "sx" && (
          <div className="absolute z-50 mt-1 w-full sm:w-64 bg-white border border-border rounded-xl shadow-xl p-2 space-y-0.5 max-h-72 overflow-y-auto">
            {SYMPTOMS.map((s) => {
              const active = selectedSymptoms.includes(s.value);
              return (
                <label
                  key={s.value}
                  className={`w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-lg text-sm font-body transition-colors cursor-pointer min-h-[44px] touch-manipulation ${
                    active
                      ? "bg-primary/10 text-primary font-semibold hover:bg-primary/15"
                      : "text-foreground/80 hover:bg-surface"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleSymptom(s.value)}
                    className="sr-only"
                  />
                  <span className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    active ? "bg-primary border-primary" : "border-border bg-transparent"
                  }`}>
                    {active && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </span>
                  {s.label}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Clear button */}
      {hasFilters && (
        <button
          type="button"
          onClick={clearAll}
          className="flex items-center gap-1.5 px-4 py-3 sm:py-2.5 rounded-xl border border-border text-sm font-body text-foreground/60 hover:text-foreground hover:border-foreground/30 transition-colors min-h-[48px] touch-manipulation shrink-0"
        >
          <X className="w-4 h-4" />
          Clear ({totalActive})
        </button>
      )}
    </div>
  );
}