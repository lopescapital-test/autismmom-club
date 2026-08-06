"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DISCUSS_CATEGORIES } from "@/lib/taxonomy";

const VALID_CATEGORIES: string[] = DISCUSS_CATEGORIES.map((c) => c.value);

export async function createThread(formData: FormData) {
  const supabase = await createClient();

  const title = (formData.get("title") as string) ?? "";
  const category = (formData.get("category") as string) ?? "";
  const content = (formData.get("content") as string) ?? "";
  const author = (formData.get("author") as string) || "Anonymous Mom";

  // ── Server-side field validation ──
  const errors: string[] = [];

  if (!title || title.trim().length < 3 || title.trim().length > 200) {
    errors.push("Title must be between 3 and 200 characters.");
  }
  if (!content || content.trim().length < 10 || content.trim().length > 8000) {
    errors.push("Content must be between 10 and 8000 characters.");
  }
  if (author.length > 60) {
    errors.push("Author name must be 60 characters or less.");
  }
  if (!VALID_CATEGORIES.includes(category)) {
    errors.push(
      `Category must be one of: ${VALID_CATEGORIES.join(", ")}.`
    );
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed:\n${errors.join("\n")}`);
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
    console.error("Failed to create thread:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    // TEMPORARY: expose Postgres error details to the client for debugging
    throw new Error(
      `[${error.code}] ${error.message}${error.details ? `\nDetails: ${error.details}` : ""}${error.hint ? `\nHint: ${error.hint}` : ""}`
    );
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
    console.error("Failed to add reply:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new Error(
      `[${error.code}] ${error.message}${error.details ? `\nDetails: ${error.details}` : ""}${error.hint ? `\nHint: ${error.hint}` : ""}`
    );
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