import Nav from "@/components/Nav";
import StickyBoard from "@/components/StickyBoard";
import { createClient } from "@/utils/supabase/server";
import { initialAffirmations } from "@/data/affirmations";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Community Bulletin Board - Autism+ Moms Club",
  description: "Words of encouragement, quick tips, and affirmations from other moms.",
};

export default async function WallPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("notes").select("*");
  const globalNotes = data || [];
  
  // Combine local mock data with global cloud data
  const combinedNotes = [...initialAffirmations, ...globalNotes];
  return (
    <main className="h-screen flex flex-col overflow-hidden bg-amber-50/30">
      <Nav />
      
      {/* Header Overlay (Floating so it doesn't interrupt the canvas) */}
      <div className="absolute top-24 md:top-28 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center bg-background/80 backdrop-blur-md px-4 py-3 md:px-8 md:py-4 rounded-3xl shadow-sm border border-border/50 w-[90%] md:w-auto">
        <h1 className="text-lg md:text-3xl font-serif text-foreground mb-0.5 md:mb-1">Community Bulletin Board</h1>
        <p className="text-xs md:text-sm font-body text-foreground/70 hidden sm:block">
          Drag the board to pan around. Click '+' to write a note, then pin it anywhere!
        </p>
        <p className="text-xs md:text-sm font-body text-foreground/70 sm:hidden">
          Drag to pan. Click '+' to add a note!
        </p>
      </div>

      {/* Endless Interactive Board Area */}
      <div className="flex-1 w-full relative">
        <StickyBoard initialNotes={combinedNotes} />
      </div>
    </main>
  );
}
