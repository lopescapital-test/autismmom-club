"use client";

import { useState, useEffect, useRef } from "react";
import { addReply } from "../actions";
import { Send } from "lucide-react";

const LS_NAME = "discuss_name";

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
  const [author, setAuthor] = useState("");

  useEffect(() => {
    const savedName = localStorage.getItem(LS_NAME);
    if (savedName) {
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
    const resolvedAuthor = author.trim() || "Anonymous Mom";
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

  const handleNameChange = (val: string) => {
    setAuthor(val);
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

      {/* Identity — always visible */}
      <div>
        <input
          name="author"
          type="text"
          value={author}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="Your name (optional)"
          maxLength={60}
          className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner"
        />
        <p className="text-[10px] text-foreground/30 mt-1">
          Leave blank to post as Anonymous Mom. Names are not verified &mdash; choose what feels right.
        </p>
      </div>

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