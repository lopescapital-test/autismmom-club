"use client";

import { useOptimistic, useEffect, useState } from "react";
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
}: {
  targetType: "thread" | "reply";
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const localVoted = mounted ? getStoredVoted(targetType, targetId) : initialVoted;

  const [optimistic, addOptimistic] = useOptimistic(
    { count: initialCount, voted: localVoted || initialVoted },
    (state) => ({
      count: state.voted ? state.count - 1 : state.count + 1,
      voted: !state.voted,
    })
  );

  const handleClick = async () => {
    addOptimistic(null);
    const res = await toggleVote(targetType, targetId);
    if (!res.error) {
      setStoredVoted(targetType, targetId, res.voted);
    }
  };

  return (
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
  );
}