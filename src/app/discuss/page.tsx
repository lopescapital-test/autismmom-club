import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { MessageSquare, Plus } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "general", label: "General" },
  { id: "food", label: "Recipes" },
  { id: "routines", label: "Routines" },
  { id: "sensory", label: "Sensory" },
  { id: "communication", label: "Communication" },
  { id: "reviews", label: "Reviews" },
  { id: "school", label: "School" },
];

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

export const metadata = {
  title: "Community Discussions - Autism+ Moms Club",
  description: "Join the conversation. Share tips, ask questions, and connect with other moms navigating autism.",
};

export default async function DiscussPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const sp = await searchParams;
  const activeCategory = sp.category || "all";

  const supabase = await createClient();

  let query = supabase
    .from("discussion_threads")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeCategory !== "all") {
    query = query.eq("category", activeCategory);
  }

  const { data: threads } = await query;
  const allThreads = threads || [];

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />

      {/* Hero Section */}
      <section className="relative pt-36 pb-16 px-6 md:px-12 overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-start)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_var(--gradient-via-3)_0%,_transparent_60%)] opacity-20 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-4 leading-tight">
                Community Discussions
              </h1>
              <p className="text-lg md:text-xl font-body text-foreground/70 max-w-2xl">
                Ask questions, share what works, and connect with other moms who get it. No judgment, just real talk.
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

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {CATEGORIES.map((cat) => {
              const isActive = cat.id === activeCategory;
              const href =
                cat.id === "all" ? "/discuss" : `/discuss?category=${cat.id}`;
              return (
                <Link
                  key={cat.id}
                  href={href}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    isActive
                      ? "bg-foreground text-background shadow-md"
                      : "bg-white/80 text-foreground/70 border border-border/50 hover:bg-surface hover:text-foreground hover:shadow-sm"
                  }`}
                >
                  {cat.id !== "all" && CATEGORY_EMOJIS[cat.id] + " "}
                  {cat.label}
                </Link>
              );
            })}
          </div>

          {/* Thread List */}
          {allThreads.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-[40px] border border-border/50 p-16 md:p-20 text-center shadow-xl">
              <div className="w-20 h-20 mx-auto mb-6 bg-surface rounded-3xl flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-foreground/40" />
              </div>
              <h2 className="text-2xl font-serif text-foreground mb-3">
                No discussions yet
              </h2>
              <p className="text-foreground/70 font-body mb-8 max-w-md mx-auto">
                Be the first to start a conversation! Ask a question, share a win, or just say hi.
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
              {allThreads.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ThreadCard({ thread }: { thread: any }) {
  const categoryLabel =
    CATEGORIES.find((c) => c.id === thread.category)?.label ||
    thread.category;
  const categoryEmoji = CATEGORY_EMOJIS[thread.category] || "💬";
  const timeAgo = getTimeAgo(new Date(thread.created_at));
  const preview =
    thread.content.length > 150
      ? thread.content.slice(0, 150) + "…"
      : thread.content;

  return (
    <Link
      href={`/discuss/${thread.slug}`}
      className="group block bg-white/80 backdrop-blur-sm rounded-[32px] border border-border/50 p-6 md:p-8 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-xl shrink-0">{categoryEmoji}</span>
        <div>
          <h3 className="text-xl md:text-2xl font-serif text-foreground group-hover:text-primary transition-colors leading-tight">
            {thread.title}
          </h3>
        </div>
      </div>

      <p className="text-foreground/60 font-body text-sm leading-relaxed mb-4 ml-9">
        {preview}
      </p>

      <div className="flex items-center gap-4 text-xs text-foreground/50 ml-9">
        <span className="inline-flex items-center gap-1.5 font-bold">
          <span className="w-5 h-5 rounded-full bg-gradient-accent flex items-center justify-center text-white text-[10px] font-serif">
            {(thread.author || "?").charAt(0).toUpperCase()}
          </span>
          {thread.author}
        </span>
        <span>·</span>
        <span>{timeAgo}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" />
          {thread.reply_count} {thread.reply_count === 1 ? "reply" : "replies"}
        </span>
        <span className="ml-auto">
          <span className="bg-surface text-foreground/60 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider">
            {categoryLabel}
          </span>
        </span>
      </div>
    </Link>
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
