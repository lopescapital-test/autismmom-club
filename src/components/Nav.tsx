"use client";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import styles from '@/components/ui/glitch-nav.module.css';
import { TOOLKIT_CATEGORIES } from '@/lib/taxonomy';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="shrink-0 sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50 w-full shadow-sm">
      <div className="w-full mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex flex-col items-start leading-tight">
            <span className="font-sans text-xl md:text-2xl font-bold text-gradient whitespace-nowrap">
              Autism<span style={{ color: "#E6A8B5", WebkitTextFillColor: "#E6A8B5" }} className="text-[0.85em] align-baseline font-bold">+</span> Moms Club
            </span>
            <span className="text-[10px] md:text-xs text-foreground/50 font-body whitespace-nowrap">
              The power of a mom raising a neurodivergent child.
            </span>
          </Link>
        </div>
        
        {/* Middle: Glitch Links (Hidden on mobile) */}
        <div className="hidden 2xl:flex items-center justify-center gap-5 flex-1 overflow-x-auto hide-scrollbar">
          {TOOLKIT_CATEGORIES.map((cat) => (
            <GlitchLink key={cat.value} href={`/toolkit/${cat.value}`} text={cat.label} />
          ))}
          <GlitchLink href="/wall" text="Wall" />
          <GlitchLink href="/hacks" text="Hacks" />
          <GlitchLink href="/discuss" text="Discuss" />
        </div>
        
        {/* Right: Submit Button & Hamburger */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:block">
            <Link href="/submit" className="inline-flex items-center justify-center bg-gradient-accent text-white font-body text-sm rounded-full px-6 py-2.5 hover:opacity-90 transition-opacity hover:scale-[1.02] active:scale-[0.98] shadow-md whitespace-nowrap font-bold">
              Share a Win
            </Link>
          </div>
          <button 
            className="2xl:hidden p-2 text-foreground/80 hover:bg-surface rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="2xl:hidden border-t border-border/50 bg-white/95 backdrop-blur-xl absolute top-20 left-0 w-full shadow-2xl p-4 flex flex-col gap-2">
          {TOOLKIT_CATEGORIES.map((cat) => (
            <MobileLink key={cat.value} href={`/toolkit/${cat.value}`} text={cat.label} onClick={() => setIsOpen(false)} />
          ))}
          <MobileLink href="/wall" text="Wall" onClick={() => setIsOpen(false)} />
          <MobileLink href="/hacks" text="Hacks" onClick={() => setIsOpen(false)} />
          <MobileLink href="/discuss" text="Discuss" onClick={() => setIsOpen(false)} />
          <div className="mt-4 pt-4 border-t border-border/50 sm:hidden">
            <Link href="/submit" onClick={() => setIsOpen(false)} className="flex items-center justify-center bg-gradient-accent text-white font-body text-sm rounded-xl w-full px-6 py-3 shadow-md font-bold">
              Share a Win
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function GlitchLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className={styles.glitchBtn} data-text={text}>
      {text}
      <span className={styles.hoverBg}></span>
    </Link>
  );
}

function MobileLink({ href, text, onClick }: { href: string; text: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="block w-full py-3 px-4 font-serif text-lg text-foreground hover:bg-surface rounded-xl transition-colors">
      {text}
    </Link>
  );
}
