import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import NewThreadForm from "./NewThreadForm";

export const metadata = {
  title: "Start a Discussion - Autism+ Moms Club",
  description: "Start a new conversation with the community.",
};

export default function NewThreadPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />

      <section className="relative pt-36 pb-16 px-6 md:px-12 flex-1 overflow-hidden">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--gradient-start)_0%,_transparent_60%),radial-gradient(ellipse_at_bottom_left,_var(--gradient-via-3)_0%,_transparent_60%)] opacity-20 pointer-events-none" />

        <div className="max-w-2xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Start a Discussion
            </h1>
            <p className="text-lg font-body text-foreground/70">
              Ask a question, share a win, or start a conversation. Your voice matters here.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-[40px] border border-border/50 p-8 md:p-12 shadow-xl">
            <NewThreadForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}