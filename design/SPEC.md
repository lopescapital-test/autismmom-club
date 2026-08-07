# Page Spec: Home (`/`)

## 1. Global Navigation (`components/Nav.tsx`)
- **Layout:** Sticky top, `h-20`, background `#FAFAF7` (with 80% opacity and backdrop blur), border-bottom 1px solid `#E5E5E0`.
- **Content Left:** Logo text "Autism Mom Club", `font-sans`, `text-xl`, `font-bold`, background clip text using the accent gradient.
- **Content Center (Desktop):** Links: "Recipes", "Routines", "Sensory", "Communication". `text-sm`, `font-body`, `#1A1A1A`.
- **Content Right:** Primary Button "Share a Win" (gradient bg, white text, rounded-full, px-6 py-2, `text-sm`).

## 2. Hero Section (`components/Hero.tsx`)
- **Layout:** `min-h-[80vh]`, flex column, centered, max-w-4xl mx-auto, text-center.
- **Top Element:** Small tag, rounded-full, border `#E5E5E0`, "By moms, for moms."
- **Headline:** `text-5xl md:text-7xl`, `font-sans`, `#1A1A1A`, leading-tight. "Real wins for real life."
- **Subheadline:** `text-lg md:text-xl`, `font-serif`, `#1A1A1A` opacity-80, max-w-2xl mt-6. "A community platform for moms of neurodivergent kids — autism, ADHD, and beyond. Real product reviews, mom hacks, sensory strategies, and moms who get it."
- **CTA:** Two buttons side-by-side mt-10. Primary: "Read the Wins". Secondary: "Share Your Routine".
- **Bottom divider:** 2px high full-width div using the accent gradient.

## 3. Categories Grid (`components/Categories.tsx`)
- **Layout:** `py-24 px-6 md:px-12` max-w-6xl mx-auto.
- **Header:** `text-3xl font-sans` "Explore the Toolkit", mb-12.
- **Grid:** CSS Grid, 2 cols mobile, 3 cols desktop. gap-6.
- **Card Items:** 6 cards (Food, Routines, Sensory, Communication, Reviews, School).
  - Background `#FFFFFF`, rounded-2xl, border 1px `#E5E5E0`, p-6.
  - Icon: simple lucid icon in `#1A1A1A`.
  - Title: `text-xl font-sans mb-2`.
  - Description: `text-base font-serif opacity-80`.

## 4. Featured Win / Testimonial (`components/FeaturedWin.tsx`)
- **Layout:** `py-24`, background `#F2F2EE`, full width.
- **Container:** max-w-4xl mx-auto px-6.
- **Image:** Left side (on desktop), circular or rounded-2xl, candid photo of a mom pouring cereal or holding a visual schedule (documentary style, no stock vibe).
- **Text:** Right side. `font-serif text-2xl italic leading-relaxed`. "Switching to a visual schedule for mornings cut our meltdowns by 90%. I want every mom to know this."
- **Author:** `font-sans text-sm mt-4 font-bold uppercase tracking-wider`. "Sarah, Mom to Leo (Age 6, Level 2)".

## 5. Community Submission Form CTA (`components/CommunityCTA.tsx`)
- **Layout:** `py-24 px-6`, max-w-3xl mx-auto text-center.
- **Icon:** Heart or Handshake.
- **Headline:** `text-3xl font-sans mb-4`. "What worked for you?"
- **Body:** `text-base font-serif mb-8`. "No cure claims. No judgment. Just practical strategies from one mom to another. Submit a recipe, routine, or review via our Typeform."
- **Button:** Primary Gradient button, large. "Submit a Resource".

## 6. Footer (`components/Footer.tsx`)
- **Layout:** `py-12`, border-top 1px `#E5E5E0`, background `#FAFAF7`.
- **Text:** `text-sm font-body opacity-60 text-center`. "© 2026 Autism Mom Club. This platform shares parent experiences and is not medical advice. We strictly prohibit content promoting unproven biomedical protocols or cures."
