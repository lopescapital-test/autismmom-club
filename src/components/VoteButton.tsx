"use client";

import { useOptimistic, useState, useEffect, startTransition } from "react";
import { toggleVote } from "@/app/discuss/actions";
import { ArrowUp } from "lucide-react";

function storageKey(type: string, id: string) {
  return `discuss_vote_${type}_${id}`;
}

function getStoredVoted(type: string, id: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(storageKey(type, id)) === "true";
}

function setStoredVoted(type: string, id: string, voted: boolean) {
  try {
    if (voted) {
      localStorage.setItem(storageKey(type, id), "true");
    } else {
      localStorage.removeItem(storageKey(type, id));
    }
  } catch {}
}

export default function VoteButton({
  targetType,
  targetId,
  initialCount,
  initialVoted,
  threadSlug,
}: {
  targetType: "thread" | "reply";
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
  threadSlug?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authoritative state seeded from server-rendered props
  const [settled, setSettled] = useState({ count: initialCount, voted: initialVoted });

  // Sync when props change (e.g. after revalidation + navigation)
  useEffect(() => {
    setSettled({ count: initialCount, voted: initialVoted });
  }, [initialCount, initialVoted]);

  // On mount: hydrate voted state from localStorage
  useEffect(() => {
    setMounted(true);
    const stored = getStoredVoted(targetType, targetId);
    if (stored !== settled.voted) {
      setSettled((prev) => ({ ...prev, voted: stored }));
    }
  }, [targetType, targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Optimistic wrapper: instant visual feedback before the action returns
  const [optimistic, addOptimistic] = useOptimistic(
    settled,
    (state) => ({
      count: state.voted ? state.count - 1 : state.count + 1,
      voted: !state.voted,
    })
  );

  const handleClick = () => {
    startTransition(async () => {
      setError(null);
      addOptimistic(null); // immediate UI flip

      const res = await toggleVote(targetType, targetId, threadSlug);

      if (res.error) {
        setError(res.error);
        setTimeout(() => setError(null), 3000);
        return; // no setSettled → optimistic reverts to old settled value
      }

      // Update authoritative state inside the same transition
      setSettled({ count: res.count ?? 0, voted: res.voted });
      setStoredVoted(targetType, targetId, res.voted);
    });
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-xs font-bold transition-colors rounded-lg px-2 py-1 ${
          optimistic.voted
            ? "text-primary bg-primary/10"
            : "text-foreground/40 hover:text-foreground/70 hover:bg-surface/50"
        }`}
        title={optimistic.voted ? "Remove upvote" : "Upvote"}
      >
        <ArrowUp
          className={`w-3.5 h-3.5 ${optimistic.voted ? "fill-primary" : ""}`}
        />
        {optimistic.count}
      </button>
      {error && (
        <span className="text-[10px] text-red-400 font-body">
          {error}
        </span>
      )}
    </span>
  );
}