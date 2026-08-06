"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createThread(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const content = formData.get("content") as string;
  const author = (formData.get("author") as string) || "Anonymous Mom";

  if (!title || !content || !category) {
    throw new Error("Title, category, and content are required.");
  }

  // Generate a URL-friendly slug
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
    throw new Error("Failed to create thread. Please try again.");
  }

  revalidatePath("/discuss");
  redirect(`/discuss/${slug}`);
}

export async function addReply(formData: FormData) {
  const supabase = await createClient();

  const threadSlug = formData.get("thread_slug") as string;
  const text = formData.get("text") as string;
  const author = (formData.get("author") as string) || "Anonymous Mom";

  if (!text || !text.trim()) {
    throw new Error("Reply text is required.");
  }

  const { error } = await supabase.from("discussion_replies").insert([
    { thread_slug: threadSlug, author, text },
  ]);

  if (error) {
    console.error("Failed to add reply:", error);
    throw new Error("Failed to add reply. Please try again.");
  }

  revalidatePath(`/discuss/${threadSlug}`);
}

export async function deleteThread(formData: FormData) {
  // Admin moderation — uses service role key to bypass RLS
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