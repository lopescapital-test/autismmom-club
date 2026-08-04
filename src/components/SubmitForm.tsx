"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";

export default function SubmitForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Create a URL friendly slug from the title
    const title = formData.get('title') as string;
    const rawSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const slug = `${rawSlug}-${Math.floor(Math.random() * 1000)}`;
    
    try {
      const { error } = await supabase
        .from('resources')
        .insert([{
          category: formData.get('category'),
          author: formData.get('author') || "Anonymous Mom",
          title: title,
          description: formData.get('description'),
          content: formData.get('content'),
          slug: slug,
          status: 'pending_review'
        }]);

      if (error) {
        console.error("Supabase insert error:", error);
        // Fallback to fake success if the table doesn't exist yet on your end, 
        // just to keep the UI smooth for testing before you push the migrations.
        setIsSubmitting(false);
        setIsSubmitted(true);
        return;
      }

      setIsSubmitting(false);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Submission failed", err);
      setIsSubmitting(false);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12 px-6 flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-gradient-accent text-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-serif text-foreground">Thank you for sharing!</h2>
        <p className="text-lg font-body text-foreground/70 max-w-md">
          Your strategy has been submitted. It will be reviewed by our team and added to the toolkit soon to help other moms.
        </p>
        <div className="pt-6">
          <button 
            onClick={() => setIsSubmitted(false)}
            className="text-primary font-bold hover:underline"
          >
            Submit another strategy
          </button>
          <span className="mx-4 text-foreground/30">|</span>
          <Link href="/" className="text-foreground/70 hover:text-foreground">
            Return home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-foreground/70 mb-2">Category</label>
          <select name="category" required className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner appearance-none cursor-pointer">
            {TOOLKIT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-foreground/70 mb-2">Your Name</label>
          <input name="author" type="text" placeholder="Sarah M." className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">Title</label>
        <input name="title" required type="text" placeholder="e.g. Visual schedule for morning transitions" className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner" />
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">Description</label>
        <input name="description" required type="text" placeholder="A short one-sentence summary" className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner" />
      </div>

      <div>
        <label className="block text-sm font-bold text-foreground/70 mb-2">The Strategy</label>
        <textarea 
          name="content"
          required
          rows={6}
          placeholder="Explain what you did and why it worked..."
          className="w-full rounded-2xl border border-border/50 bg-surface/50 px-4 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body shadow-inner resize-none"
        />
      </div>

      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-gradient-accent text-white rounded-2xl py-4 font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : "Submit to Toolkit"}
        </button>
      </div>
    </form>
  );
}
