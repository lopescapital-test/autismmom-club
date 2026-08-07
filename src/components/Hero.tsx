import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] px-6 text-center max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="inline-block border border-border text-foreground/80 font-body text-xs px-4 py-1.5 rounded-full uppercase tracking-widest">
          By moms, for moms.
        </span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-sans text-foreground leading-tight tracking-tight mb-6">
        Real wins for real life.
      </h1>
      
      <p className="text-lg md:text-xl font-serif text-foreground/80 max-w-2xl leading-relaxed">
        A community platform for moms of neurodivergent kids — autism, ADHD, and beyond. Real product reviews, mom hacks, sensory strategies, and moms who get it.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
        <Link href="#explore" className="w-full sm:w-auto bg-gradient-accent text-white font-body rounded-full px-8 py-3 hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] text-center">
          Read the Wins
        </Link>
        <Link href="/submit" className="w-full sm:w-auto bg-surface text-foreground border border-border font-body rounded-full px-8 py-3 hover:bg-surface/80 transition-all text-center">
          Share Your Routine
        </Link>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-accent w-screen -ml-[calc(50vw-50%)]" />
    </section>
  );
}
