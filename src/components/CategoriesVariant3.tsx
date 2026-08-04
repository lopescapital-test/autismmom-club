import { Apple, Clock, Headphones, MessageSquare, Star, BookOpen } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";

const ICON_MAP: Record<string, LucideIcon> = {
  food: Apple,
  routines: Clock,
  sensory: Headphones,
  communication: MessageSquare,
  reviews: Star,
  school: BookOpen,
};

const CATEGORIES = TOOLKIT_CATEGORIES.map((c) => ({
  ...c,
  icon: ICON_MAP[c.value],
}));

export default function CategoriesVariant3() {
  return (
    <section className="py-24 px-6 md:px-12 w-full bg-background border-t border-border/50">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Explore the Toolkit (Modern Grid)</h2>
            <p className="font-body text-foreground/70">
              A highly minimalist, structured grid focusing on stark lines, hovering arrows, and typography.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {CATEGORIES.map((cat) => (
            <Card key={cat.value} className="group relative h-[300px] bg-background border-border/50 p-8 rounded-3xl hover:border-foreground transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden flex flex-col justify-between">
              
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 bg-surface text-foreground rounded-2xl flex items-center justify-center transition-colors duration-500 group-hover:bg-foreground group-hover:text-background">
                  <cat.icon size={28} strokeWidth={1.5} />
                </div>
                <ArrowUpRight className="w-6 h-6 text-muted-foreground opacity-0 -translate-x-4 translate-y-4 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500" />
              </div>

              <div className="mt-auto pt-10">
                <h3 className="text-2xl font-serif text-foreground mb-3 leading-none group-hover:text-primary transition-colors">{cat.label}</h3>
                <p className="text-base font-body text-foreground/70 leading-relaxed font-light">
                  {cat.description}
                </p>
              </div>

              <div className="absolute inset-0 z-[-1] bg-gradient-to-tr from-surface via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
