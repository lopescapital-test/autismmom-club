"use client";

import Link from "next/link";
import styles from "./glitch-nav.module.css";
import { TOOLKIT_CATEGORIES } from "@/lib/taxonomy";

export default function GlitchNav() {
  return (
    <nav className="flex items-center justify-center gap-8 flex-wrap py-8 w-full flex-wrap">
      {TOOLKIT_CATEGORIES.map((cat) => (
        <GlitchLink key={cat.value} href={`/toolkit/${cat.value}`} text={cat.label} />
      ))}
      <GlitchLink href="/wall" text="Wall" />
    </nav>
  );
}

function GlitchLink({ href, text }: { href: string; text: string }) {
  return (
    <Link href={href} className={styles.glitchBtn} data-text={text}>
      {text}
      <span className={styles.hoverText} data-text={text}>
        {text}
      </span>
    </Link>
  );
}
