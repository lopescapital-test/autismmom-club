"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DIAGNOSES, SYMPTOMS } from "@/lib/taxonomy";
import type { Diagnosis, Symptom } from "@/lib/taxonomy";
import { Star, Send, ChevronDown } from "lucide-react";

export default function ReviewForm({ productSlug }: { productSlug: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [author, setAuthor] = useState("");
  const [text, setText] = useState("");
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showDx, setShowDx] = useState(false);
  const [showSx, setShowSx] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (rating === 0) {
        setError("Please select a rating.");
        return;
      }
      if (text.length < 10) {
        setError("Review text must be at least 10 characters.");
        return;
      }
      if (text.length > 4000) {
        setError("Review text must be under 4000 characters.");
        return;
      }
      if (author.length > 60) {
        setError("Name must be under 60 characters.");
        return;
      }

      setSubmitting(true);
      setError("");

      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_slug: productSlug,
            rating,
            author: author.trim() || "Anonymous Mom",
            text: text.trim(),
            diagnoses,
            symptoms,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to submit review");
        }

        setSuccess(true);
        setRating(0);
        setAuthor("");
        setText("");
        setDiagnoses([]);
        setSymptoms([]);
        router.refresh();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setSubmitting(false);
      }
    },
    [productSlug, rating, author, text, diagnoses, symptoms, router]
  );

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <p className="text-green-800 font-serif text-lg mb-2">
          Review submitted!
        </p>
        <p className="text-green-700/70 text-sm font-body mb-4">
          It may take a moment to appear.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="text-sm text-primary underline underline-offset-2"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
      {/* Rating */}
      <div>
        <label className="block text-sm font-bold text-foreground mb-2">
          Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 -m-1 touch-manipulation"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  i <= (hoverRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-none text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Author */}
      <div>
        <label
          htmlFor="author"
          className="block text-sm font-bold text-foreground mb-2"
        >
          Your name (optional)
        </label>
        <input
          id="author"
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Anonymous Mom"
          maxLength={60}
          className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm"
        />
      </div>

      {/* Review text */}
      <div>
        <label
          htmlFor="text"
          className="block text-sm font-bold text-foreground mb-2"
        >
          Your review
        </label>
        <textarea
          id="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What worked for your family? What didn't?"
          rows={5}
          maxLength={4000}
          className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm resize-y min-h-[120px]"
        />
        <p className="text-xs text-foreground/40 mt-1 text-right">
          {text.length}/4000
        </p>
      </div>

      {/* Diagnosis tags */}
      <div>
        <button
          type="button"
          onClick={() => setShowDx(!showDx)}
          className="flex items-center gap-2 text-sm font-bold text-foreground mb-2"
        >
          Diagnosis tags (optional)
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showDx ? "rotate-180" : ""}`}
          />
        </button>
        {showDx && (
          <div className="flex flex-wrap gap-2">
            {DIAGNOSES.map((d) => {
              const active = diagnoses.includes(d.value);
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() =>
                    setDiagnoses(
                      active
                        ? diagnoses.filter((x) => x !== d.value)
                        : [...diagnoses, d.value]
                    )
                  }
                  className={`px-3 py-2 rounded-lg text-xs font-body border transition-colors touch-manipulation min-h-[36px] ${
                    active
                      ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                      : "bg-surface border-border text-foreground/70 hover:border-primary/30"
                  }`}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Symptom tags */}
      <div>
        <button
          type="button"
          onClick={() => setShowSx(!showSx)}
          className="flex items-center gap-2 text-sm font-bold text-foreground mb-2"
        >
          Symptom tags (optional)
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showSx ? "rotate-180" : ""}`}
          />
        </button>
        {showSx && (
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {SYMPTOMS.map((s) => {
              const active = symptoms.includes(s.value);
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() =>
                    setSymptoms(
                      active
                        ? symptoms.filter((x) => x !== s.value)
                        : [...symptoms, s.value]
                    )
                  }
                  className={`px-3 py-2 rounded-lg text-xs font-body border transition-colors touch-manipulation min-h-[36px] ${
                    active
                      ? "bg-primary/10 border-primary/30 text-primary font-semibold"
                      : "bg-surface border-border text-foreground/70 hover:border-primary/30"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 font-body">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 bg-gradient-accent text-white rounded-xl px-6 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
      >
        {submitting ? "Submitting..." : "Submit Review"}
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}