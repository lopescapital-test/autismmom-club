"use client";

import { useState, useEffect, useRef } from "react";
import { addReply } from "../actions";
import { Send } from "lucide-react";

const LS_NAME = "discuss_name";
const LS_ANON = "discuss_anon";

export default function ReplyForm({
  threadSlug,
  parentId,
  parentAuthor,
  onSubmitted,
}: {
  threadSlug: string;
  parentId?: string;
  parentAuthor?: string;
  onSubmitted?: () => void;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Identity state from localStorage
  const [useName, setUseName] = useState(false);
  const [storedName, setStoredName] = useState("");
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const savedAnon = localStorage.getItem(LS_ANON);
    const savedName = localStorage.getItem(LS_NAME);
    if (savedAnon === "false" && savedName) {
      setUseName(true);
      setStoredName(savedName);
      setAuthor(savedName);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("thread_slug", threadSlug);
    const resolvedAuthor = useName && author.trim() ? author.trim() : "Anonymous Mom";
    formData.set("author", resolvedAuthor);

    if (parentId) {
      formData.set("parent_id", parentId);
    }

    try {
      await addReply(formData);
      setText("");
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post reply.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnonToggle = () => {
    const next = !useName;
    setUseName(next);
    localStorage.setItem(LS_ANON, String(next));
    if (next) {
      localStorage.setItem(LS_NAME, author || storedName);
    }
  };

  const handleNameChange = (val: string) => {
    setAuthor(val);
    setStoredName(val);
    localStorage.setItem(LS_NAME, val);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" ref={formRef}>
      <input type="hidden" name="thread_slug" value={threadSlug} />
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}

      {/* Replying-to indicator */}
      {parentAuthor && (
        <p className="text-xs text-foreground/40 italic">
          Replying to <span className="font-bold">{parentAuthor}</span>
        </p>
      )}

      {/* Identity toggle */}
      <div className="flex items-center gap-3 text-xs text-foreground/60">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={useName}
            onChange={handleAnonToggle}
            className="accent-primary rounded"
          />
          Post as&hellip;
        </label>
        {useName && (
          <input
            name="author"
            type="text"
            value={author}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Your name"
            maxLength={60}
            className="rounded-xl border border-border/50 bg-surface/50 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner w-40"
          />
        )}
        {!useName && (
          <span className="text-foreground/40 italic">Post anonymously</span>
        )}
      </div>
      <p className="text-[10px] text-foreground/30 -mt-1">
        Names are not verified &mdash; choose what feels right.
      </p>

      {/* Input */}
      <div className="flex gap-3">
        <textarea
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            parentAuthor
              ? `Reply to ${parentAuthor}…`
              : "Share your thoughts…"
          }
          rows={2}
          className="flex-1 rounded-2xl border border-border/50 bg-surface/50 px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm shadow-inner resize-none w-full min-h-[50px]"
        />
        <button
          type="submit"
          disabled={!text.trim() || isSubmitting}
          className="bg-gradient-accent text-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shrink-0 self-end"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-500 font-body">{error}</p>
      )}
    </form>
  );
}