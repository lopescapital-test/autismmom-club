import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SubmitForm from "@/components/SubmitForm";

export const metadata = {
  title: "Submit a Resource - Autism+ Moms Club",
  description: "Share a win or strategy with the community.",
};

export default function SubmitPage() {
  return (
    <main className="min-h-screen flex flex-col bg-surface/30">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-2xl mx-auto w-full flex-1">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Share a Win</h1>
          <p className="text-lg font-body text-foreground/70">
            What worked for you today? Fill out this quick form to add your strategy to the toolkit.
          </p>
        </div>

        <div className="bg-white rounded-[40px] border border-border/50 p-8 md:p-12 shadow-xl relative overflow-hidden">
          <SubmitForm />
        </div>

      </div>
      <Footer />
    </main>
  );
}
