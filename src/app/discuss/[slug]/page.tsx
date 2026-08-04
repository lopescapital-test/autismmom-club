import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { ArrowLeft, MessageSquare } from "lucide-react";
import ReplyForm from "./ReplyForm";
import { deleteReply } from "../actions";

const CATEGORY_EMOJIS: Record<string, string> = {
  general: "💬",
  food: "🍲",
  routines: "📋",
  sensory: "🧩",
  communication: "🗣️",
  reviews: "⭐",
  school: "🏫",
};

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

  const allReplies = replies || [];
  const categoryEmoji = CATEGORY_EMOJIS[thread.category] || "💬";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />

      <section className="relative pt-32 pb-16 px-6 md:px-12 flex-1 overflow-hidden">
        {/* Subtle background texture */}
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
              <div>
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
                  <span>·</span>
                  <span>{getTimeAgo(new Date(thread.created_at))}</span>
                  <span>·</span>
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

            {allReplies.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto mb-4 bg-surface rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-7 h-7 text-foreground/30" />
                </div>
                <p className="text-foreground/50 font-body italic">
                  No replies yet. Be the first to respond!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allReplies.map((reply) => (
                  <div
                    key={reply.id}
                    className="bg-surface/50 p-5 rounded-3xl border border-border/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gradient-accent flex items-center justify-center text-white text-[10px] font-bold font-serif shadow-inner shrink-0">
                          {(reply.author || "?").charAt(0).toUpperCase()}
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {reply.author}
                        </span>
                        <span className="text-[10px] text-foreground/40">
                          {getTimeAgo(new Date(reply.created_at))}
                        </span>
                      </div>
                      <form action={deleteReply}>
                        <input type="hidden" name="id" value={reply.id} />
                        <input
                          type="hidden"
                          name="thread_slug"
                          value={slug}
                        />
                        <button
                          type="submit"
                          className="text-foreground/30 hover:text-red-400 transition-colors text-xs"
                          title="Delete reply"
                        >
                          ✕
                        </button>
                      </form>
                    </div>
                    <p className="text-foreground/80 text-sm font-body leading-relaxed">
                      {reply.text}
                    </p>
                  </div>
                ))}
              </div>
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