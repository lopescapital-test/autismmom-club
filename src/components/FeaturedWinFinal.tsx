"use client";

import { AnimatedFeatureCard } from "@/components/ui/feature-card-1";
import { animate, motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const cards = [
  { 
    id: "001", 
    tag: "Recipes",
    title: "Texture-consistent snacks designed specifically for ARFID and aversions.", 
    imageSrc: "/emojis/bento-box.webp", 
    color: "orange" as const
  },
  { 
    id: "002", 
    tag: "Routines",
    title: "A step-by-step visual schedule to reduce anxiety during morning transitions.", 
    imageSrc: "/emojis/sun-behind-cloud.webp", 
    color: "blue" as const
  },
  { 
    id: "003", 
    tag: "Sensory",
    title: "Proprioceptive exercises that provide calming input for nervous system regulation.", 
    imageSrc: "/emojis/musical-notes.webp", 
    color: "purple" as const
  },
  { 
    id: "004", 
    tag: "Communication",
    title: "Customizable communication cards for low-demand days.", 
    imageSrc: "/emojis/studio-microphone.webp", 
    color: "green" as const
  }
];

export default function FeaturedWinFinal() {
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
    <section className="py-24 bg-background w-full overflow-hidden border-t border-border/50">
      <div className="w-full max-w-6xl mx-auto px-6 relative group/slider">
        <div className="mb-12 text-center md:text-left">
          <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-4">Toolkit Highlights</h2>
          <p className="font-body text-foreground/70 max-w-2xl">Preview some of the most impactful strategies shared by our community.</p>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 left-2 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hidden md:block">
          <button onClick={() => scrollTo("left")} className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground shadow-lg flex items-center justify-center hover:bg-surface hover:scale-110 transition-all active:scale-95"><ChevronLeft className="w-6 h-6" /></button>
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-2 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 hidden md:block">
          <button onClick={() => scrollTo("right")} className="h-12 w-12 rounded-full bg-background/80 backdrop-blur-md border border-border text-foreground shadow-lg flex items-center justify-center hover:bg-surface hover:scale-110 transition-all active:scale-95"><ChevronRight className="w-6 h-6" /></button>
        </div>

        <motion.div ref={containerRef} className="cursor-grab active:cursor-grabbing overflow-hidden pb-12 -mx-4 px-4">
          <motion.div drag="x" dragConstraints={{ right: 0, left: -width }} dragElastic={0.1} style={{ x }} className="flex gap-6">
            {cards.map((card) => (
              <div key={card.id} className="min-w-[320px] max-w-[320px]">
                <AnimatedFeatureCard
                  index={card.id}
                  tag={card.tag}
                  title={card.title}
                  imageSrc={card.imageSrc}
                  color={card.color}
                />
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
