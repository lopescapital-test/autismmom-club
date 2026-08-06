"use client";

import { useState } from "react";
import VoteButton from "@/components/VoteButton";
import ReplyForm from "./ReplyForm";
import { MessageSquare } from "lucide-react";

interface ReplyNode {
  id: string;
  parent_id: string | null;
  author: string;
  text: string;
  created_at: string;
  vote_count: number;
  children: ReplyNode[];
  depth: number;
  hasMore: number;
  parentAuthor: string | null;
}

export default function ThreadedReplies({
  replies,
  threadSlug,
}: {
  replies: ReplyNode[];
  threadSlug: string;
}) {
  return (
    <div className="space-y-3">
      {replies.map((reply) => (
        <ReplyItem
          key={reply.id}
          reply={reply}
          threadSlug={threadSlug}
        />
      ))}
    </div>
  );
}

function ReplyItem({
  reply,
  threadSlug,
}: {
  reply: ReplyNode;
  threadSlug: string;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const timeAgo = getTimeAgo(new Date(reply.created_at));

  // Mobile-safe indentation: use left border + small offset instead of margin
  const indentClass =
    reply.depth === 0
      ? ""
      : reply.depth === 1
        ? "ml-3 pl-3 border-l-2 border-border/30"
        : reply.depth === 2
          ? "ml-2 pl-2 border-l-2 border-border/20"
          : "ml-2 pl-2 border-l-2 border-dashed border-border/20";

  return (
    <div className={reply.depth > 0 ? indentClass : ""}>
      <div className="bg-surface/50 p-4 md:p-5 rounded-3xl border border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-gradient-accent flex items-center justify-center text-white text-[10px] font-bold font-serif shadow-inner shrink-0">
              {(reply.author || "?").charAt(0).toUpperCase()}
            </span>
            <span className="font-bold text-sm text-foreground truncate">
              {reply.author}
            </span>
            <span className="text-[10px] text-foreground/40 shrink-0">
              {timeAgo}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <VoteButton
              targetType="reply"
              targetId={reply.id}
              initialCount={reply.vote_count ?? 0}
              initialVoted={false}
              threadSlug={threadSlug}
            />
          </div>
        </div>

        {/* "Replying to" label for deep replies */}
        {reply.depth >= 3 && reply.parentAuthor && (
          <p className="text-[11px] text-foreground/40 font-body mb-2 italic">
            replying to {reply.parentAuthor}
          </p>
        )}

        {/* Body */}
        <p className="text-foreground/80 text-sm font-body leading-relaxed break-words">
          {reply.text}
        </p>

        {/* Reply button */}
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="mt-2 inline-flex items-center gap-1 text-[11px] text-foreground/40 hover:text-primary transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          Reply
        </button>

        {/* Inline reply form */}
        {showReplyForm && (
          <div className="mt-3">
            <ReplyForm
              threadSlug={threadSlug}
              parentId={reply.id}
              parentAuthor={reply.author}
              onSubmitted={() => setShowReplyForm(false)}
            />
          </div>
        )}
      </div>

      {/* Children */}
      {reply.children.length > 0 && (
        <div className="mt-2 space-y-2">
          {reply.children.map((child) => (
            <ReplyItem
              key={child.id}
              reply={child}
              threadSlug={threadSlug}
            />
          ))}
        </div>
      )}

      {/* "Show more" indicator for capped depth */}
      {reply.hasMore > 0 && (
        <p className="text-[11px] text-foreground/30 italic mt-1 ml-2">
          +{reply.hasMore} more {reply.hasMore === 1 ? "reply" : "replies"}
        </p>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}