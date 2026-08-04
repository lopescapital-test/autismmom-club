"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function upsertProduct(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string | null;
  const data: any = {
    slug: formData.get("slug"),
    name: formData.get("name"),
    brand: formData.get("brand") || null,
    category: formData.get("category"),
    description: formData.get("description") || null,
    image_url: formData.get("image_url") || null,
  };

  const { error } = id
    ? await supabase.from("products").update(data).eq("id", id)
    : await supabase.from("products").insert(data);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath("/toolkit/reviews");
}