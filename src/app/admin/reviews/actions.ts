"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleProductStatus(id: string, current: "visible" | "hidden") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ status: current === "visible" ? "hidden" : "visible" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/toolkit/reviews");
}

export async function toggleReviewStatus(id: string, current: "visible" | "hidden") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_reviews")
    .update({ status: current === "visible" ? "hidden" : "visible" })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/reviews");
  revalidatePath("/toolkit/reviews");
}