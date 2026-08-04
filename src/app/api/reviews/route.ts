import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { product_slug, rating, author, text, diagnoses, symptoms } = body;

    // Validation
    if (!product_slug || typeof product_slug !== "string") {
      return NextResponse.json({ error: "product_slug is required" }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    if (!text || text.length < 10) {
      return NextResponse.json({ error: "Review text must be at least 10 characters" }, { status: 400 });
    }
    if (text.length > 4000) {
      return NextResponse.json({ error: "Review text must be under 4000 characters" }, { status: 400 });
    }

    const authorName = author?.trim() || "Anonymous Mom";
    if (authorName.length > 60) {
      return NextResponse.json({ error: "Name must be under 60 characters" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("product_reviews").insert({
      product_slug,
      rating,
      author: authorName,
      text: text.trim(),
      diagnoses: diagnoses || [],
      symptoms: symptoms || [],
    });

    if (error) {
      console.error("[reviews] insert error:", error);
      return NextResponse.json({ error: "Database error. The products table may not exist yet." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("[reviews] API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}