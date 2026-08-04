import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { createClient } from "@/utils/supabase/server";
import AdminApprovalForm from "@/components/AdminApprovalForm";
import { deleteResource, deleteComment } from "./actions";
import { deleteThread, deleteReply } from "../discuss/actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  // Fetch all pending_review items directly from Postgres
  const { data: pendingItems, error } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "pending_review")
    .order("created_at", { ascending: true });

  // Fetch all published items for moderation
  const { data: publishedItems } = await supabase
    .from("resources")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  const { data: globalComments } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch discussion threads
  const { data: discussionThreads } = await supabase
    .from("discussion_threads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching pending items:", error);
  }

  const items = pendingItems || [];

  return (
    <main className="min-h-screen flex flex-col bg-surface/30">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-5xl mx-auto w-full flex-1">

        <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-3xl font-serif text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-sm font-body text-foreground/70">Review and approve community submissions.</p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-bold text-sm">
            {items.length} Pending Reviews
          </div>
        </div>

        {/* Pending Reviews Queue */}
        <h2 className="text-xl font-bold text-foreground mb-4">Pending Submissions</h2>
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-border/50 shadow-sm">
            <h2 className="text-2xl font-serif mb-2 text-foreground">Inbox Zero!</h2>
            <p className="text-foreground/70 font-body">There are no pending submissions to review right now.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map(sub => (
              <div key={sub.id} className="bg-white rounded-3xl p-8 border border-border/50 shadow-sm flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex gap-2 mb-3">
                    <span className="bg-surface px-2 py-1 rounded text-xs font-mono uppercase text-foreground/70">{sub.category}</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-mono uppercase">Pending</span>
                  </div>
                  <h3 className="text-2xl font-serif mb-2">{sub.title}</h3>
                  <p className="text-sm text-foreground/60 mb-4">By {sub.author} • {sub.description}</p>
                  <div className="prose prose-sm text-foreground/80 bg-surface/50 p-4 rounded-xl border border-border/50 whitespace-pre-wrap">
                    {sub.content}
                  </div>
                </div>

                <AdminApprovalForm sub={sub} />
              </div>
            ))}
          </div>
        )}

        {/* Published Content Moderation */}
        <h2 className="text-xl font-bold text-foreground mt-16 mb-4">Published Resources</h2>
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead>
              <tr className="border-b border-border/50 text-foreground">
                <th className="pb-3 px-4 font-bold">Title</th>
                <th className="pb-3 px-4 font-bold">Category</th>
                <th className="pb-3 px-4 font-bold">Author</th>
                <th className="pb-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(publishedItems || []).map((pub: any) => (
                <tr key={pub.id} className="border-b border-border/30 last:border-0 hover:bg-surface/30">
                  <td className="py-3 px-4 truncate max-w-xs">{pub.title}</td>
                  <td className="py-3 px-4 uppercase text-xs font-mono">{pub.category}</td>
                  <td className="py-3 px-4">{pub.author}</td>
                  <td className="py-3 px-4 text-right">
                    <form action={deleteResource}>
                      <input type="hidden" name="id" value={pub.id} />
                      <input type="hidden" name="category" value={pub.category} />
                      <button type="submit" className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md transition-colors text-xs font-bold border border-red-200">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!publishedItems || publishedItems.length === 0) && <p className="text-center py-8 text-foreground/50">No published resources yet.</p>}
        </div>

        {/* Comments Moderation */}
        <h2 className="text-xl font-bold text-foreground mt-16 mb-4">Community Comments</h2>
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead>
              <tr className="border-b border-border/50 text-foreground">
                <th className="pb-3 px-4 font-bold">Comment</th>
                <th className="pb-3 px-4 font-bold">Author</th>
                <th className="pb-3 px-4 font-bold">Resource Slug</th>
                <th className="pb-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(globalComments || []).map((c: any) => (
                <tr key={c.id} className="border-b border-border/30 last:border-0 hover:bg-surface/30">
                  <td className="py-3 px-4 max-w-sm truncate">{c.text}</td>
                  <td className="py-3 px-4">{c.author}</td>
                  <td className="py-3 px-4 font-mono text-xs">{c.resource_slug}</td>
                  <td className="py-3 px-4 text-right">
                    <form action={deleteComment}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="resource_slug" value={c.resource_slug} />
                      <button type="submit" className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md transition-colors text-xs font-bold border border-red-200">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!globalComments || globalComments.length === 0) && <p className="text-center py-8 text-foreground/50">No comments yet.</p>}
        </div>

        {/* Discussion Threads Moderation */}
        <h2 className="text-xl font-bold text-foreground mt-16 mb-4">Discussion Threads</h2>
        <div className="bg-white rounded-3xl p-6 border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm text-foreground/80">
            <thead>
              <tr className="border-b border-border/50 text-foreground">
                <th className="pb-3 px-4 font-bold">Title</th>
                <th className="pb-3 px-4 font-bold">Category</th>
                <th className="pb-3 px-4 font-bold">Author</th>
                <th className="pb-3 px-4 font-bold">Replies</th>
                <th className="pb-3 px-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {(discussionThreads || []).map((thread: any) => (
                <tr key={thread.id} className="border-b border-border/30 last:border-0 hover:bg-surface/30">
                  <td className="py-3 px-4 truncate max-w-xs">{thread.title}</td>
                  <td className="py-3 px-4 uppercase text-xs font-mono">{thread.category}</td>
                  <td className="py-3 px-4">{thread.author}</td>
                  <td className="py-3 px-4">{thread.reply_count}</td>
                  <td className="py-3 px-4 text-right">
                    <form action={deleteThread}>
                      <input type="hidden" name="slug" value={thread.slug} />
                      <button type="submit" className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md transition-colors text-xs font-bold border border-red-200">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!discussionThreads || discussionThreads.length === 0) && <p className="text-center py-8 text-foreground/50">No discussion threads yet.</p>}
        </div>

      </div>
      <Footer />
    </main>
  );
}
