import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { MessageSquare, Plus, ArrowUp, Flame, Clock, TrendingUp } from "lucide-react";
import { DISCUSS_CATEGORIES, CATEGORY_EMOJI_CHAR, ALL_FILTER } from "@/lib/taxonomy";
import VoteButton from "@/components/VoteButton";

const CATEGORIES = [ALL_FILTER, ...DISCUSS_CATEGORIES];

type SortMode = "hot" | "new" | "top";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Discussions - Autism+ Moms Club",
  description:
    "Join the conversation. Share tips, ask questions, and connect with other moms navigating autism.",
};

export default async function DiscussPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const activeCategory = sp.category || "all";
  const activeSort: SortMode = (sp.sort as SortMode) || "hot";

  const supabase = await createClient();

  // Fetch all threads (the filter is small; sort client-side for Hot)
  let query = supabase.from("discussion_threads").select("*");

  if (activeCategory !== "all") {
    query = query.eq("category", activeCategory);
  }

  const { data: rawThreads } = await query;
  let threads = rawThreads || [];

  // Sorting
  if (activeSort === "new") {
    threads.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } else if (activeSort === "top") {
    threads.sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  } else {
    // Hot = vote_count / power((hours_since_creation) + 2, 1.5)
    const now = Date.now();
    threads.sort((a, b) => {
      const hoursA =
        (now - new Date(a.created_at).getTime()) / 3600000;
      const hoursB =
        (now - new Date(b.created_at).getTime()) / 3600000;
      const scoreA =
        (a.vote_count ?? 0) / Math.pow(hoursA + 2, 1.5);
      const scoreB =
        (b.vote_count ?? 0) / Math.pow(hoursB + 2, 1.5);
      return scoreB - scoreA;
    });
  }

  const sortMode = activeSort;
  const sortLabel = sortMode === "hot" ? "Hot" : sortMode === "new" ? "New" : "Top";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />

      <section className="relative pt-36 pb-16 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-start)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_var(--gradient-via-3)_0%,_transparent_60%)] opacity-20 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4 leading-tight">
                Community Discussions
              </h1>
              <p className="text-lg md:text-xl font-body text-foreground/70 max-w-2xl">
                Ask questions, share what works, and connect with other moms who
                get it. No judgment, just real talk.
              </p>
            </div>
            <Link
              href="/discuss/new"
              className="inline-flex items-center gap-2 bg-gradient-accent text-white rounded-full px-6 py-3 font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
            >
              <Plus className="w-5 h-5" />
              Start a Discussion
            </Link>
          </div>

          {/* Filter bar: category tabs + sort controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = cat.value === activeCategory;
                const href =
                  cat.value === "all"
                    ? `/discuss?sort=${sortMode}`
                    : `/discuss?category=${cat.value}&sort=${sortMode}`;
                return (
                  <Link
                    key={cat.value}
                    href={href}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      isActive
                        ? "bg-foreground text-background shadow-md"
                        : "bg-white/80 text-foreground/70 border border-border/50 hover:bg-surface hover:text-foreground hover:shadow-sm"
                    }`}
                  >
                    {cat.value !== "all" &&
                      CATEGORY_EMOJI_CHAR[cat.value] + " "}
                    {cat.label}
                  </Link>
                );
              })}
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-1 bg-white/80 rounded-full border border-border/50 p-1 self-start">
              {(
                [
                  { key: "hot" as SortMode, label: "Hot", icon: Flame },
                  { key: "new" as SortMode, label: "New", icon: Clock },
                  { key: "top" as SortMode, label: "Top", icon: TrendingUp },
                ] as const
              ).map((s) => {
                const isActive = sortMode === s.key;
                const href =
                  activeCategory === "all"
                    ? `/discuss?sort=${s.key}`
                    : `/discuss?category=${activeCategory}&sort=${s.key}`;
                const Icon = s.icon;
                return (
                  <Link
                    key={s.key}
                    href={href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isActive
                        ? "bg-foreground text-background shadow-sm"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Thread List */}
          {threads.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-[40px] border border-border/50 p-16 md:p-20 text-center shadow-xl">
              <div className="w-20 h-20 mx-auto mb-6 bg-surface rounded-3xl flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-foreground/40" />
              </div>
              <h2 className="text-2xl font-serif text-foreground mb-3">
                No discussions yet
              </h2>
              <p className="text-foreground/70 font-body mb-8 max-w-md mx-auto">
                Be the first to start a conversation! Ask a question, share a
                win, or just say hi.
              </p>
              <Link
                href="/discuss/new"
                className="inline-flex items-center gap-2 bg-gradient-accent text-white rounded-full px-6 py-3 font-bold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-5 h-5" />
                Start a Discussion
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} sortMode={sortMode} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ThreadCard({ thread, sortMode }: { thread: any; sortMode: SortMode }) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === thread.category)?.label || thread.category;
  const categoryEmoji = CATEGORY_EMOJI_CHAR[thread.category] || "💬";
  const timeAgo = getTimeAgo(new Date(thread.created_at));
  const preview =
    thread.content.length > 150
      ? thread.content.slice(0, 150) + "…"
      : thread.content;

  const score =
    sortMode === "hot"
      ? computeHotScore(thread.vote_count ?? 0, new Date(thread.created_at))
      : null;

  return (
    <Link
      href={`/discuss/${thread.slug}`}
      className="group block bg-white/80 backdrop-blur-sm rounded-[32px] border border-border/50 p-6 md:p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl shrink-0">{categoryEmoji}</span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl md:text-2xl font-serif text-foreground group-hover:text-primary transition-colors leading-tight">
            {thread.title}
          </h3>
        </div>
      </div>

      <p className="text-foreground/60 font-body text-sm leading-relaxed mb-4 ml-9">
        {preview}
      </p>

      <div className="flex items-center gap-4 text-xs text-foreground/50 ml-9">
        <span className="inline-flex items-center gap-1.5 font-bold shrink-0">
          <span className="w-5 h-5 rounded-full bg-gradient-accent flex items-center justify-center text-white text-[10px] font-serif">
            {(thread.author || "?").charAt(0).toUpperCase()}
          </span>
          {thread.author}
        </span>

        <span className="inline-flex items-center gap-1 shrink-0">
          <ArrowUp className="w-3 h-3" />
          {thread.vote_count ?? 0}
        </span>

        <span className="inline-flex items-center gap-1 shrink-0">
          <MessageSquare className="w-3.5 h-3.5" />
          {thread.reply_count}
        </span>

        <span className="shrink-0">{timeAgo}</span>

        {score !== null && (
          <span className="text-[10px] text-foreground/30 hidden sm:inline">
            {score.toFixed(1)} pts
          </span>
        )}

        <span className="ml-auto shrink-0">
          <span className="bg-surface text-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider">
            {categoryLabel}
          </span>
        </span>
      </div>
    </Link>
  );
}

function computeHotScore(voteCount: number, createdAt: Date): number {
  const hours = (Date.now() - createdAt.getTime()) / 3600000;
  return voteCount / Math.pow(hours + 2, 1.5);
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