# Phase 1: Technical SEO Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-06
**Phase:** 01-technical-seo-foundation
**Areas discussed:** SSR component split, OG image strategy, H1 animation fate

---

## SSR Component Split

| Option | Description | Selected |
|--------|-------------|----------|
| Server shell + HomeClient island | page.tsx becomes Server Component for static content; HomeClient handles logo + preview | ✓ |
| Full extract to HomeClient | Thin Server wrapper with entire current logic in HomeClient | |
| Keep client, fix visibility | Keep "use client", remove 1250ms gate — content visible faster but HTML still empty | |

**User's choice:** Server shell + HomeClient island

---

| Option | Description | Selected |
|--------|-------------|----------|
| Static content always visible, logo animates on top | Static H1/features render immediately; logo animation runs independently | |
| Logo animation controls visibility | Static content hidden until 1250ms transition — original UX preserved | |
| Remove the 1250ms delay entirely | Show everything immediately, logo goes straight to top-left, no centered intro | ✓ |

**User's choice:** Remove the 1250ms delay entirely

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep the draw animation | Logo draws itself from top-left — signature ink effect preserved | |
| Remove draw animation too | Logo renders immediately as static SVG text — simplest | ✓ |

**User's choice:** Remove draw animation too

---

| Option | Description | Selected |
|--------|-------------|----------|
| Keep the code preview | CodeEditor preview stays as client island — shows the product | ✓ |
| Remove the code preview too | Fully static homepage, maximum simplicity | |

**User's choice:** Keep the code preview (client island)

---

## OG Image Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Next.js opengraph-image.tsx | ImageResponse API — dynamic generation, no PNG to maintain | ✓ |
| Static PNG | 1200×630 PNG in /public — simple but requires design work | |
| Downgrade to summary card | twitter.card = "summary" — no image needed | |

**User's choice:** Next.js opengraph-image.tsx

---

| Option | Description | Selected |
|--------|-------------|----------|
| Logo + tagline on dark background | "CodeReel" + tagline on #181818 — matches homepage aesthetic | ✓ |
| Logo + code snippet preview | Show rendered code block — more complex | |
| You decide | Claude picks simplest professional option | |

**User's choice:** Logo + tagline on dark background

---

## H1 Animation Fate

| Option | Description | Selected |
|--------|-------------|----------|
| Plain static H1 — no animation | Server-rendered `<h1>` with full text, zero JS for hero | ✓ |
| CSS animation on static H1 | Server-renders text, CSS fade-in on page load | |
| Keep character animation as client island | Extract HeroTitle client component, sr-only server fallback | |

**User's choice:** Plain static H1 — no animation

---

| Option | Description | Selected |
|--------|-------------|----------|
| Remove hover effect — plain divs | Consistent simplification, fully server-rendered feature cards | |
| Keep hover via CSS | CSS transition on scale, no JS — keeps tactile feel | ✓ |
| Keep motion.div hover | Client island just for hover — adds bundle for small UX detail | |

**User's choice:** Keep hover via CSS (`hover:scale-[1.02] transition-transform`)

---

## Claude's Discretion

- Exact font/layout of `opengraph-image.tsx` — Claude picks minimal, on-brand design
- Whether to keep `LogoText` component or replace with plain SVG element

## Deferred Ideas

None — discussion stayed within phase scope.
