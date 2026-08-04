"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share, MessageCircle, ArrowLeft, Send } from "lucide-react";
import { Resource } from "@/data/resources";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { addComment } from "@/app/resource/[slug]/actions";

interface Props {
  resource: Resource;
  initialComments?: any[];
}

export default function FlippableResourceCard({ resource, initialComments = [] }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [comments, setComments] = useState<any[]>([
    ...initialComments
  ]);
  const [newComment, setNewComment] = useState("");
  const [isCopied, setIsCopied] = useState(false);



  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };


  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Pre-process raw text to enforce markdown line-breaks on lists if users didn't add them
  const rawContent = resource.content || "No content provided.";
  const formattedContent = rawContent
    .replace(/(?<!\n)(?:^|\s)(\d+\.\s)/g, '\n$1') // Force newline before "1. "
    .replace(/(?<!\n)(?:^|\s)([-*]\s)/g, '\n$1'); // Force newline before "- " or "* "

  const handleAddComment = async (formData: FormData) => {
    const text = formData.get("text") as string;
    if (!text || !text.trim()) return;
    
    // Optimistic UI update
    const optimisticComment = { id: Date.now().toString(), author: "You", text: text };
    setComments((prev) => [...prev, optimisticComment]);
    setNewComment("");
    
    try {
      await addComment(formData);
    } catch (err) {
      console.error(err);
      // If server fails, remove the optimistic comment
      setComments((prev) => prev.filter(c => c.id !== optimisticComment.id));
    }
  };

  return (
    <div className="relative w-full" style={{ perspective: "1000px" }}>
      <motion.div
        className="w-full relative"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
        style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
      >
        {/* FRONT OF CARD */}
        <div
          className="bg-white rounded-[40px] border border-border/50 p-8 md:p-16 shadow-2xl relative overflow-hidden"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

          <div className="w-24 h-24 mb-8 flex items-center justify-center bg-surface rounded-3xl shrink-0 drop-shadow-xl relative z-10">
            <img src={resource.emoji || ""} alt="Icon" className="w-16 h-16 object-contain" />
          </div>

          <div className="flex gap-2 flex-wrap mb-4 relative z-10">
            {(resource.tags || []).map(tag => (
              <span key={tag} className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-xs font-mono uppercase tracking-wider">{tag}</span>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-serif text-foreground mb-6 leading-tight relative z-10">
            {resource.title || "Untitled"}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-border/40 pb-8 mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-serif font-bold shadow-inner shrink-0">
                {(resource.author || "?").charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{resource.author || "Anonymous"}</p>
                <p className="text-xs text-foreground/60">{resource.readTime || "3 min"} read</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={handleFlip} className="flex-1 sm:flex-none justify-center text-foreground/50 hover:text-primary transition-colors px-4 py-2 bg-surface rounded-full border border-border/50 hover:shadow-md flex items-center gap-2 font-body text-sm font-semibold">
                <MessageCircle className="w-4 h-4" />
                Comments
              </button>
              <button onClick={handleShare} className="text-foreground/50 hover:text-primary transition-colors p-2 bg-surface rounded-full border border-border/50 hover:shadow-md relative shrink-0">
                <Share className="w-5 h-5" />
                {isCopied && (
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="prose prose-lg md:prose-xl prose-headings:font-serif prose-p:font-body prose-a:text-primary hover:prose-a:underline text-foreground/80 leading-relaxed max-w-none relative z-10" style={{ wordBreak: "break-word" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {formattedContent}
            </ReactMarkdown>
          </div>
        </div>

        {/* BACK OF CARD */}
        <div
          className="bg-white rounded-[40px] border border-border/50 p-8 md:p-12 shadow-2xl absolute inset-0 w-full h-full flex flex-col"
          style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(0)", WebkitTransform: "rotateY(180deg) translateZ(0)" }}
        >
          <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-6">
            <h2 className="text-2xl font-serif text-foreground">Community Comments</h2>
            <button onClick={handleFlip} className="text-foreground/50 hover:text-primary transition-colors flex items-center gap-2 font-body text-sm bg-surface px-4 py-2 rounded-full border border-border/50 hover:shadow-md">
              <ArrowLeft className="w-4 h-4" />
              Back to Article
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-4 space-y-6 mb-6">
            {comments.length === 0 ? (
              <p className="text-foreground/50 italic text-center py-8">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-surface/50 p-4 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-accent flex items-center justify-center text-white text-xs font-bold font-serif shadow-inner">
                      {comment.author.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-foreground">{comment.author}</span>
                  </div>
                  <p className="text-foreground/80 text-sm font-body leading-relaxed">{comment.text}</p>
                </div>
              ))
            )}
          </div>

          <form action={handleAddComment} className="mt-auto border-t border-border/40 pt-6">
            <input type="hidden" name="slug" value={resource.slug} />
            <div className="flex gap-3">
              <input 
                type="text" 
                name="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add to the conversation..."
                className="flex-1 rounded-2xl border border-border/50 bg-surface/50 px-5 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 font-body text-sm shadow-inner w-full min-h-[50px]"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="bg-gradient-accent text-white rounded-2xl px-6 py-4 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
