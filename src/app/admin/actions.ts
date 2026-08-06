"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

export async function approveResource(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  let emoji = formData.get("emoji") as string;
  const category = formData.get("category") as string;

  if (!id) throw new Error("Missing ID");

  if (!emoji || emoji.length < 3) {
    emoji = "/emojis/star.svg";
  }

  const { error } = await supabase
    .from("resources")
    .update({
      status: "published",
      emoji: emoji,
    })
    .eq("id", id);

  if (error) {
    console.error("Failed to approve:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/toolkit/${category}`);
  revalidatePath("/admin");
}

export async function rejectResource(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;

  if (!id) throw new Error("Missing ID");

  const { error } = await supabase
    .from("resources")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    console.error("Failed to reject:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}

export async function deleteResource(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const category = formData.get("category") as string;

  if (!id) throw new Error("Missing ID");

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/toolkit/${category}`);
  revalidatePath("/admin");
}

export async function deleteComment(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;
  const resource_slug = formData.get("resource_slug") as string;

  if (!id) throw new Error("Missing ID");

  // Soft delete — set status to hidden instead of hard delete.
  // Requires a `status` column on the `comments` table.
  const { error } = await supabase
    .from("comments")
    .update({ status: "hidden" })
    .eq("id", id);

  if (error) {
    console.error("Failed to hide comment:", error);
    throw new Error(error.message);
  }

  revalidatePath(`/resource/${resource_slug}`);
}

export async function deleteNote(formData: FormData) {
  const supabase = createAdminClient();
  const id = formData.get("id") as string;

  if (!id) throw new Error("Missing ID");

  // Soft delete — set status to hidden instead of hard delete.
  // Requires a `status` column on the `notes` table.
  const { error } = await supabase
    .from("notes")
    .update({ status: "hidden" })
    .eq("id", id);

  if (error) {
    console.error("Failed to hide note:", error);
    throw new Error(error.message);
  }

  revalidatePath("/wall");
  revalidatePath("/admin");
}