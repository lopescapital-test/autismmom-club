"use client";

import { useState, useEffect, useRef } from "react";
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
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [error, setError] = useState<string | null>(null);

  // Track whether a local vote is in-flight so the prop-sync effect
  // doesn't stomp our optimistic values during the round-trip.
  const pendingRef = useRef(false);
  // Track the last server-returned count so the sync effect only
  // applies props when they're genuinely newer than what we've seen.
  const serverCountRef = useRef(initialCount);

  // Hydrate localStorage on mount
  useEffect(() => {
    const stored = getStoredVoted(targetType, targetId);
    if (stored !== initialVoted) {
      setVoted(stored);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync from props only when no vote is in-flight and the prop
  // actually differs from our last server-returned value.
  useEffect(() => {
    if (pendingRef.current) return;
    if (initialCount !== serverCountRef.current) {
      setCount(initialCount);
      serverCountRef.current = initialCount;
    }
    if (initialVoted !== voted) {
      setVoted(initialVoted);
    }
  }, [initialCount, initialVoted]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = async () => {
    const prevCount = count;
    const prevVoted = voted;

    // Optimistic update — immediate
    setCount(voted ? count - 1 : count + 1);
    setVoted(!voted);
    setError(null);
    pendingRef.current = true;

    const res = await toggleVote(targetType, targetId, threadSlug);

    pendingRef.current = false;

    if (res.error) {
      // Revert
      setCount(prevCount);
      setVoted(prevVoted);
      setError(res.error);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Authoritative value from the server
    setCount(res.count);
    setVoted(res.voted);
    serverCountRef.current = res.count;
    setStoredVoted(targetType, targetId, res.voted);
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 font-bold transition-colors rounded-xl px-3 py-1.5 min-h-[44px] cursor-pointer select-none border ${
          voted
            ? "text-primary bg-primary/10 border-primary/25"
            : "text-foreground/50 bg-surface/50 border-border/40 hover:bg-surface hover:border-foreground/20 hover:text-foreground/70"
        } active:scale-95`}
        title={voted ? "Remove upvote" : "Upvote"}
      >
        <ArrowUp
          className={`w-4 h-4 ${voted ? "fill-primary" : ""}`}
        />
        <span className="text-sm">{count}</span>
      </button>
      {error && (
        <span className="text-[10px] text-red-400 font-body">
          {error}
        </span>
      )}
    </span>
  );
}