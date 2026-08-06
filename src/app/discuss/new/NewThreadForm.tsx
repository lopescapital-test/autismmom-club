"use client";

import { useActionState } from "react";
import { createThread } from "../actions";
import { DISCUSS_CATEGORIES, CATEGORY_EMOJI_CHAR } from "@/lib/taxonomy";

const CATEGORIES = DISCUSS_CATEGORIES.map((c) => ({
  value: c.value,
  label: `${CATEGORY_EMOJI_CHAR[c.value]} ${c.label}`,
}));

export default function NewThreadForm() {
  const [state, formAction, isPending] = useActionState(createThread, null);

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">
          Category
        </label>
        <select
          name="category"
          required
          className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner appearance-none cursor-pointer"
        >
          <option value="">Select a category…</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">
          Your Name
        </label>
        <input
          name="author"
          type="text"
          placeholder="Sarah M. (or leave blank for anonymous)"
          className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">
          Title
        </label>
        <input
          name="title"
          required
          type="text"
          placeholder="e.g. Anyone else struggling with morning meltdowns?"
          className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">
          Your Post
        </label>
        <textarea
          name="content"
          required
          rows={8}
          placeholder="Share your question, experience, or thought…"
          className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner resize-none"
        />
      </div>

      {state?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm whitespace-pre-wrap font-mono">
          {state.error}
        </div>
      )}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-accent text-white rounded-2xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Posting…
            </span>
          ) : (
            "Post Discussion"
          )}
        </button>
      </div>
    </form>
  );
}