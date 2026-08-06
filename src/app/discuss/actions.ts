"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import crypto from "node:crypto";
import { DISCUSS_CATEGORIES } from "@/lib/taxonomy";

const VALID_CATEGORIES: string[] = DISCUSS_CATEGORIES.map((c) => c.value);

// ── CREATE THREAD ──────────────────────────────────────────

export async function createThread(
  prevState: { error: string } | null | undefined,
  formData: FormData
): Promise<{ error: string } | null> {
  const supabase = await createClient();

  const title = (formData.get("title") as string) ?? "";
  const category = (formData.get("category") as string) ?? "";
  const content = (formData.get("content") as string) ?? "";
  const author = (formData.get("author") as string) || "Anonymous Mom";

  // ── Validation ──
  const errs: string[] = [];
  if (!title || title.trim().length < 3 || title.trim().length > 200) {
    errs.push("Title must be between 3 and 200 characters.");
  }
  if (!content || content.trim().length < 10 || content.trim().length > 8000) {
    errs.push("Content must be between 10 and 8000 characters.");
  }
  if (author.length > 60) {
    errs.push("Author name must be 60 characters or less.");
  }
  if (!VALID_CATEGORIES.includes(category)) {
    errs.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}.`);
  }
  if (errs.length > 0) {
    return { error: `Validation failed:\n${errs.join("\n")}` };
  }

  const rawSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${rawSlug}-${Math.floor(Math.random() * 10000)}`;

  const { error } = await supabase.from("discussion_threads").insert([
    { slug, category, title, content, author },
  ]);

  if (error) {
    console.error("Failed to create thread:", error);
    return { error: "Failed to create thread. Please try again." };
  }

  revalidatePath("/discuss");
  redirect(`/discuss/${slug}`);
}

// ── ADD REPLY ──────────────────────────────────────────────

export async function addReply(formData: FormData) {
  const supabase = await createClient();

  const threadSlug = formData.get("thread_slug") as string;
  const text = formData.get("text") as string;
  const author = (formData.get("author") as string) || "Anonymous Mom";
  const parentId = (formData.get("parent_id") as string) || null;

  if (!text || !text.trim()) {
    throw new Error("Reply text is required.");
  }

  const payload: Record<string, any> = {
    thread_slug: threadSlug,
    author,
    text: text.trim(),
  };
  if (parentId) {
    payload.parent_id = parentId;
  }

  const { error } = await supabase.from("discussion_replies").insert([payload]);

  if (error) {
    console.error("Failed to add reply:", error);
    throw new Error("Failed to add reply. Please try again.");
  }

  revalidatePath(`/discuss/${threadSlug}`);
}

// ── DELETE THREAD ──────────────────────────────────────────

export async function deleteThread(formData: FormData) {
  const supabase = createAdminClient();
  const slug = formData.get("slug") as string;
  if (!slug) throw new Error("Missing slug");

  const { error } = await supabase
    .from("discussion_threads")
    .delete()
    .eq("slug", slug);

  if (error) {
    console.error("Failed to delete thread:", error);
    throw new Error(error.message);
  }
  revalidatePath("/discuss");
}

// ── TOGGLE VOTE ────────────────────────────────────────────

export async function toggleVote(
  targetType: "thread" | "reply",
  targetId: string,
  threadSlug?: string
): Promise<{ count: number; voted: boolean; error?: string }> {
  const supabase = createAdminClient();

  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "127.0.0.1";

  const salt = process.env.VOTE_SALT;
  if (!salt) {
    console.error("VOTE_SALT is not set — voting is disabled.");
    return { count: 0, voted: false, error: "Voting is temporarily unavailable." };
  }
  const ipHash = crypto.createHmac("sha256", salt).update(ip).digest("hex");

  // Try insert
  const { error: insertError } = await supabase.from("votes").insert({
    target_type: targetType,
    target_id: targetId,
    ip_hash: ipHash,
  });

  let voted: boolean;

  if (insertError && insertError.code === "23505") {
    // Already voted — toggle off
    const { error: delError } = await supabase
      .from("votes")
      .delete()
      .match({ target_type: targetType, target_id: targetId, ip_hash: ipHash });

    if (delError) {
      console.error("Failed to remove vote:", delError);
      return { count: 0, voted: false, error: "Failed to remove vote." };
    }
    voted = false;
  } else if (insertError) {
    console.error("Failed to vote:", insertError);
    return { count: 0, voted: false, error: "Failed to record vote." };
  } else {
    voted = true;
  }

  // Read authoritative vote_count from the table (DB trigger keeps it in sync)
  const table = targetType === "thread" ? "discussion_threads" : "discussion_replies";
  const { data: updated } = await supabase
    .from(table)
    .select("vote_count")
    .eq("id", targetId)
    .single();

  const count = updated?.vote_count ?? 0;

  // Revalidate so server-rendered pages show fresh counts
  revalidatePath("/discuss");
  if (threadSlug) {
    revalidatePath(`/discuss/${threadSlug}`);
  }

  return { count, voted };
}