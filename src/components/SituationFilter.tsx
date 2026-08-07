"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { HACK_SITUATIONS } from "@/lib/taxonomy";
import type { HackSituation } from "@/lib/taxonomy";
import { X, ChevronDown, MapPin, Check } from "lucide-react";

export default function SituationFilter() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selected: HackSituation[] = useMemo(
    () => (searchParams.get("sit")?.split(",").filter(Boolean) as HackSituation[]) || [],
    [searchParams]
  );

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = useCallback(
    (val: HackSituation) => {
      const next = selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val];
      const params = new URLSearchParams(searchParams.toString());
      if (next.length) params.set("sit", next.join(","));
      else params.delete("sit");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname, selected]
  );

  const clear = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sit");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setOpen(false);
  }, [searchParams, router, pathname]);

  return (
    <div className="relative w-full sm:w-auto" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-3 sm:py-2.5 rounded-xl border text-sm font-body transition-colors min-h-[48px] touch-manipulation ${
          selected.length > 0
            ? "bg-primary/10 border-primary/30 text-primary font-semibold"
            : "bg-surface border-border text-foreground/80 hover:border-primary/30"
        }`}
      >
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 shrink-0" />
          Situation{selected.length > 0 ? ` (${selected.length})` : ""}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full sm:w-56 bg-white border border-border rounded-xl shadow-xl p-2 space-y-0.5">
          {HACK_SITUATIONS.map((s) => {
            const active = selected.includes(s.value);
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
                  onChange={() => toggle(s.value)}
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
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="w-full flex items-center gap-2 px-3 py-3 sm:py-2.5 rounded-lg text-sm font-body text-foreground/50 hover:text-foreground hover:bg-surface transition-colors text-left min-h-[44px] touch-manipulation border-t border-border/50 mt-1 pt-2"
            >
              <X className="w-4 h-4" />
              Clear situation filter
            </button>
          )}
        </div>
      )}
    </div>
  );
}