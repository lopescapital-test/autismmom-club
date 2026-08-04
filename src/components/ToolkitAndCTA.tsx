"use client";
import Link from "next/link";

import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";
import { AnimatedFeatureCard } from "@/components/ui/feature-card-1";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cards = [
  { 
    id: "001", slug: "texture-consistent-snacks-arfid", 
    tag: "Recipes",
    title: "Texture-consistent snacks designed specifically for ARFID and aversions.", 
    imageSrc: TOOLKIT_CATEGORIES.find(c => c.value === "food")!.emojiImage, 
    color: "orange" as const
  },
  { 
    id: "002", slug: "morning-visual-schedule", 
    tag: "Routines",
    title: "A step-by-step visual schedule to reduce anxiety during morning transitions.", 
    imageSrc: TOOLKIT_CATEGORIES.find(c => c.value === "routines")!.emojiImage, 
    color: "blue" as const
  },
  { 
    id: "003", slug: "proprioceptive-heavy-work", 
    tag: "Sensory",
    title: "Proprioceptive exercises that provide calming input for nervous system regulation.", 
    imageSrc: TOOLKIT_CATEGORIES.find(c => c.value === "sensory")!.emojiImage, 
    color: "purple" as const
  },
  { 
    id: "004", slug: "low-demand-communication-cards", 
    tag: "Communication",
    title: "Customizable communication cards for low-demand days.", 
    imageSrc: TOOLKIT_CATEGORIES.find(c => c.value === "communication")!.emojiImage, 
    color: "green" as const
  }
];

export default function ToolkitAndCTA() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.scrollWidth - containerRef.current.offsetWidth);
    }
  }, []);

  const scrollTo = (direction: "left" | "right") => {
    const currentX = x.get();
    const containerWidth = containerRef.current?.offsetWidth || 0;
    const scrollAmount = containerWidth * 0.8;

    let newX = direction === "left" ? currentX + scrollAmount : currentX - scrollAmount;
    newX = Math.max(Math.min(newX, 0), -width);

    animate(x, newX, { type: "spring", stiffness: 300, damping: 30, mass: 1 });
  };

  return (
    <section className="bg-background w-full overflow-hidden border-t border-border/50">
      
      {/* How To Use / CTA Section */}
      <div className="bg-surface/50 py-24 px-6 border-t border-border/30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white border border-border/50 shadow-sm text-primary mb-2">
              <img src="/emojis/kids-hugging.png" alt="Kids hugging" className="w-9 h-9 object-contain" />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground">How to use the Toolkit</h2>
            <div className="space-y-4 text-foreground/80 font-serif leading-relaxed">
              <p>
                Browse the collections above for practical, mom-tested strategies. We categorize everything so you can quickly find routines for chaotic mornings, safe snacks for picky eaters, or sensory tools to help decompress.
              </p>
              <p>
                <strong>What worked for you?</strong> No cure claims. No judgment. Just practical strategies from one mom to another. If you've found a hack that saves your day, share it with the community.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/submit" className="inline-block bg-gradient-accent text-white font-body rounded-full px-8 py-3 text-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md">
                Submit a Resource
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-sm rounded-3xl bg-white p-8 border border-border/50 shadow-xl shadow-black/5 rotate-1 hover:rotate-0 transition-transform duration-500 relative">
            <div className="absolute -top-4 -right-4 text-5xl drop-shadow-md">✨</div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Submission Guidelines</h3>
            <ul className="space-y-3 text-sm text-foreground/70 font-body">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Focus on practical, actionable steps.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Mention if it's for sensory seekers or avoiders.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Share honest product reviews (no affiliates).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">✕</span>
                <span>No medical advice or "cure" protocols.</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

    </section>
  );
}
