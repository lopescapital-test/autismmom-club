import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import VoteButton from "@/components/VoteButton";
import ReplyForm from "./ReplyForm";
import ThreadedReplies from "./ThreadedReplies";
import { CATEGORY_EMOJI_CHAR } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("discussion_threads")
    .select("title")
    .eq("slug", p.slug)
    .single();

  return {
    title: data
      ? `${data.title} - Autism+ Moms Club Discussions`
      : "Discussion - Autism+ Moms Club",
    description: "Join the conversation on Autism+ Moms Club.",
  };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await params;
  const slug = p.slug;

  const supabase = await createClient();

  const { data: thread } = await supabase
    .from("discussion_threads")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!thread) {
    notFound();
  }

  const { data: replies } = await supabase
    .from("discussion_replies")
    .select("*")
    .eq("thread_slug", slug)
    .order("created_at", { ascending: true });

  const allReplies: any[] = replies || [];
  const categoryEmoji = CATEGORY_EMOJI_CHAR[thread.category] || "💬";

  // Build nested tree from flat replies
  // Top-level replies have parent_id === null (or undefined if old data without parent_id)
  const replyMap = new Map<string, any[]>();
  const orphans: any[] = [];

  for (const r of allReplies) {
    const pid = r.parent_id;
    if (pid) {
      if (!replyMap.has(pid)) replyMap.set(pid, []);
      replyMap.get(pid)!.push(r);
    } else {
      orphans.push(r);
    }
  }

  const maxDepth = 3;

  function renderTree(replies: any[], depth: number): any[] {
    return replies.map((r) => ({
      ...r,
      children:
        depth < maxDepth && replyMap.has(r.id)
          ? renderTree(replyMap.get(r.id)!, depth + 1)
          : [],
      depth,
      hasMore:
        depth >= maxDepth && replyMap.has(r.id)
          ? replyMap.get(r.id)!.length
          : 0,
      parentAuthor: findParentAuthor(r.parent_id, allReplies),
    }));
  }

  const topLevel = renderTree(orphans, 0);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />

      <section className="relative pt-32 pb-16 px-6 md:px-12 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-start)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_var(--gradient-via-3)_0%,_transparent_60%)] opacity-20 pointer-events-none" />

        <div className="max-w-3xl mx-auto relative z-10">
          {/* Back link */}
          <Link
            href="/discuss"
            className="inline-flex items-center gap-1.5 text-sm font-body text-foreground/60 hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Discussions
          </Link>

          {/* Thread Header */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[40px] border border-border/50 p-8 md:p-12 shadow-xl mb-8">
            <div className="flex items-start gap-4 mb-5">
              <span className="text-2xl md:text-3xl shrink-0 mt-1">
                {categoryEmoji}
              </span>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl md:text-4xl font-serif text-foreground leading-tight mb-3">
                  {thread.title}
                </h1>
                <div className="flex items-center gap-3 text-xs text-foreground/50 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span className="w-5 h-5 rounded-full bg-gradient-accent flex items-center justify-center text-white text-[10px] font-serif">
                      {(thread.author || "?").charAt(0).toUpperCase()}
                    </span>
                    {thread.author}
                  </span>
                  <span>&middot;</span>
                  <span>{getTimeAgo(new Date(thread.created_at))}</span>
                  <span>&middot;</span>
                  <VoteButton
                    targetType="thread"
                    targetId={thread.id}
                    initialCount={thread.vote_count ?? 0}
                    initialVoted={false}
                  />
                  <span>&middot;</span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {thread.reply_count}{" "}
                    {thread.reply_count === 1 ? "reply" : "replies"}
                  </span>
                  <span className="bg-surface text-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider ml-auto">
                    {thread.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-6 mt-6">
              <div className="prose prose-lg prose-headings:font-serif prose-p:font-body text-foreground/80 leading-relaxed max-w-none whitespace-pre-wrap">
                {thread.content}
              </div>
            </div>
          </div>

          {/* Replies Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[40px] border border-border/50 p-8 md:p-12 shadow-xl mb-8">
            <h2 className="text-xl font-serif text-foreground mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-foreground/50" />
              Replies ({thread.reply_count})
            </h2>

            {topLevel.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto mb-4 bg-surface rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-foreground/30" />
                </div>
                <p className="text-foreground/50 font-body italic">
                  No replies yet. Be the first to respond!
                </p>
              </div>
            ) : (
              <ThreadedReplies replies={topLevel} threadSlug={slug} />
            )}
          </div>

          {/* Reply Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-[40px] border border-border/50 p-8 md:p-12 shadow-xl">
            <h3 className="text-lg font-serif text-foreground mb-5">
              Add a Reply
            </h3>
            <ReplyForm threadSlug={slug} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function findParentAuthor(parentId: string | null, allReplies: any[]): string | null {
  if (!parentId) return null;
  const parent = allReplies.find((r) => r.id === parentId);
  return parent?.author || null;
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