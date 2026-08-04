import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { HACKS } from "@/data/hacks";
import { DIAGNOSES, SYMPTOMS, HACK_SITUATIONS } from "@/lib/taxonomy";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hack = HACKS.find((h) => h.slug === slug);
  if (!hack) return { title: "Hack Not Found - Autism+ Moms Club" };
  return {
    title: `${hack.title} - Mom Hack`,
    description: hack.content.split("\n\n")[0],
  };
}

export default async function HackDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hack = HACKS.find((h) => h.slug === slug);
  if (!hack) notFound();

  const paragraphs = hack.content.split("\n\n");

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="pt-32 pb-16 px-6 md:px-12 max-w-4xl mx-auto w-full flex-1">
        {/* Back link */}
        <Link
          href="/hacks"
          className="inline-flex items-center text-sm font-body text-foreground/60 hover:text-primary transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Mom Hacks
        </Link>

        {/* Photo */}
        {hack.image && (
          <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-3xl overflow-hidden mb-10 bg-surface">
            <Image
              src={hack.image}
              alt={hack.title}
              fill
              sizes="(max-width: 768px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          {hack.situation && (
            <span className="inline-block text-sm font-body font-medium text-primary bg-primary/10 px-3 py-1 rounded-full mb-3">
              {HACK_SITUATIONS.find((s) => s.value === hack.situation)?.label || hack.situation}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">
            {hack.title}
          </h1>
          {hack.author && (
            <p className="text-sm text-foreground/50 font-body">by {hack.author}</p>
          )}
        </div>

        {/* Tags */}
        {((hack.diagnoses?.length || 0) > 0 || (hack.symptoms?.length || 0) > 0) && (
          <div className="flex flex-wrap gap-2 mb-10">
            {hack.diagnoses?.map((d) => {
              const label = DIAGNOSES.find((dx) => dx.value === d)?.label || d;
              return (
                <Link
                  key={d}
                  href={`/hacks?dx=${d}`}
                  className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors"
                >
                  {label}
                </Link>
              );
            })}
            {hack.symptoms?.map((s) => {
              const label = SYMPTOMS.find((sx) => sx.value === s)?.label || s;
              return (
                <Link
                  key={s}
                  href={`/hacks?sx=${s}`}
                  className="bg-surface text-foreground/70 text-xs px-3 py-1 rounded-full font-medium hover:bg-surface/80 transition-colors"
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg font-body text-foreground/80 max-w-none space-y-6">
          {paragraphs.map((p, i) => (
            <p key={i} className="leading-relaxed">{p}</p>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}