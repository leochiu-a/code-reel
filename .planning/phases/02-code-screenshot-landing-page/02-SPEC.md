# Phase 2: /code-screenshot Landing Page — Specification

**Created:** 2026-05-07
**Ambiguity score:** 0.12 (gate: ≤ 0.20)
**Requirements:** 6 locked

## Goal

A new SSR-only route `/code-screenshot` is published, fully indexable by Googlebot without JavaScript, targeting the `code screenshot` / `code image` keyword cluster — and the page achieves Lighthouse SEO ≥ 90.

## Background

Phase 1 established SEO infrastructure on `/` (SSR refactor, sitemap, robots, OG/Twitter metadata, JSON-LD). Today only `/` and `/app` exist as routes; `src/app/sitemap.ts` enumerates exactly those two URLs. There is no `/code-screenshot` directory, no static shiki rendering pattern in the codebase (the existing `services/shiki.ts` uses `createHighlighter()` for client-side runtime highlighting via `useHighlighter`), and the homepage's `CodePreview` is a `"use client"` island with `dynamic({ ssr: false })`. This phase introduces the project's first server-rendered shiki pattern using `codeToHtml()`, plus the structural scaffolding for keyword-targeted landing pages.

## Requirements

1. **Route exists as Server Component**: A new route `/code-screenshot` is reachable and is a pure Server Component.
   - Current: No `src/app/code-screenshot/` directory exists; route 404s
   - Target: `src/app/code-screenshot/page.tsx` exists, contains no `"use client"` directive, contains no client-only hooks (`useState`, `useEffect`, etc.), and contains no `dynamic(..., { ssr: false })` imports
   - Acceptance: `grep -r "use client" src/app/code-screenshot/` returns no matches; `curl http://localhost:5566/code-screenshot` (after `next build && next start`) returns HTML containing the H1 text "Beautiful Code Screenshots, Instantly"

2. **Server-rendered shiki preview**: A static code block is rendered server-side via shiki's `codeToHtml()`.
   - Current: All shiki rendering in the project uses `createHighlighter()` runtime via `useHighlighter` hook (client-side); no `codeToHtml` usage
   - Target: The `/code-screenshot` page renders one fixed code block using shiki `codeToHtml()` with `lang: "typescript"` and `theme: "vesper"`; the output `<pre>` HTML is present in the initial server response, framed by a window-chrome element (rounded corners, subtle border, traffic-light dots) to read as an exported screenshot
   - Acceptance: `curl /code-screenshot | grep -c 'shiki'` returns ≥ 1 (the `<pre class="shiki">` block is in the raw HTML); the rendered block visually presents inside a framed container

3. **Themes Gallery section**: A grid of 4–6 mini code-screenshot previews showing the same TypeScript snippet across different shiki themes.
   - Current: No themes-gallery UI exists anywhere in the project
   - Target: A `<section>` titled "30+ themes, one snippet" renders 6 mini preview cards. Each card calls `codeToHtml()` server-side with the shared snippet and one theme from: `vesper`, `vercel`, `tailwind`, `prisma`, `trigger`, plus one shiki built-in (e.g., `github-dark` or `tokyo-night`). Each card displays the theme name as a label.
   - Acceptance: `curl /code-screenshot | grep -c '<pre class="shiki' ` returns ≥ 7 (1 main preview + 6 gallery previews); each gallery card label text appears in the HTML

4. **How It Works section**: A 3-step explanation of the screenshot creation flow renders as plain SSR HTML.
   - Current: No such content exists in the project
   - Target: A `<section>` titled "How It Works" renders 3 numbered steps: (1) "Paste your code" with brief description, (2) "Pick a theme" with brief description, (3) "Export the image" with brief description. Each step is plain HTML — no interactivity.
   - Acceptance: The HTML response contains all three step headings ("Paste your code", "Pick a theme", "Export the image"); no `"use client"` directives in the section's source

5. **Page metadata + WebPage JSON-LD + BreadcrumbList**: The page exports complete Next.js Metadata and includes `WebPage` + `BreadcrumbList` JSON-LD.
   - Current: No `metadata` export for `/code-screenshot`; falls back to `layout.tsx` defaults; no per-page JSON-LD anywhere except homepage `SoftwareApplication`
   - Target: `src/app/code-screenshot/page.tsx` exports `metadata` with `title: "Code Screenshot Generator — Beautiful Code Images | CodeReel"`, `description: "Turn any code snippet into a beautiful, shareable code screenshot. 30+ themes, syntax highlighting for 12+ languages. Free online code image generator."`, `alternates.canonical: "/code-screenshot"`, and `openGraph` overrides for title + description (image inherits from `layout.tsx`). The page injects two `<script type="application/ld+json">` blocks: a `WebPage` schema (`name`, `description`, `url: "https://codereel.dev/code-screenshot"`) and a `BreadcrumbList` schema linking Home → Code Screenshot.
   - Acceptance: `<head>` of `/code-screenshot` contains `<title>Code Screenshot Generator — Beautiful Code Images | CodeReel</title>` and `<link rel="canonical" href="https://codereel.dev/code-screenshot">`; HTML contains exactly two JSON-LD blocks, one with `"@type": "WebPage"` and one with `"@type": "BreadcrumbList"`; Google's Rich Results Test accepts both without errors

6. **Sitemap inclusion**: `/code-screenshot` appears in `/sitemap.xml`.
   - Current: `src/app/sitemap.ts` returns 2 entries (`/` and `/app`)
   - Target: `src/app/sitemap.ts` returns 3 entries — adds `https://codereel.dev/code-screenshot` with `changeFrequency: "monthly"` and `priority: 0.8`
   - Acceptance: `GET /sitemap.xml` returns XML containing `<loc>https://codereel.dev/code-screenshot</loc>`

## Boundaries

**In scope:**
- New route `src/app/code-screenshot/page.tsx` (Server Component, no `"use client"`)
- Page sections: Hero → Framed static screenshot preview → Themes Gallery (6 mini previews) → How It Works (3 steps) → Footer CTA linking to `/app`
- Server-side shiki rendering using `codeToHtml()` with TypeScript snippet across multiple themes
- Page-level metadata (title, description, canonical, OG override)
- `WebPage` + `BreadcrumbList` JSON-LD blocks
- Sitemap entry for `/code-screenshot`
- The CTA links to plain `/app` — no query params

**Out of scope:**
- Editor query-param API (e.g., `/app?intent=screenshot`) — would require editor changes; deferred to a future phase
- Per-page OG image (`opengraph-image.tsx` for `/code-screenshot`) — reuse global OG from `layout.tsx`; the marginal social-share gain isn't worth a second `ImageResponse` route this phase
- Any client-side interactivity on `/code-screenshot` — no theme switcher, no language switcher, no scroll animations — all interactivity stays in `/app`
- `/code-animation` landing page — that is Phase 999.3, still in backlog
- Ranking outcome — Google ranking is uncontrollable and not a falsifiable phase exit criterion
- Comparison/competitor section (carbon.now.sh, ray.so) — content writing, deferred
- Use cases section (Twitter, blog, docs, slides) — content writing, deferred

## Constraints

- The page must contain zero `"use client"` directives — pure SSR for maximum indexability and Lighthouse SEO score
- Shiki rendering must use `codeToHtml()` (synchronous-style server API), NOT `createHighlighter()` (which is the existing client pattern in `services/shiki.ts`) — these can coexist; do not refactor the existing client pattern
- Shiki theme `vesper` is the canonical "hero preview" theme; the gallery includes 5 additional themes drawn from existing project themes (`vercel`, `tailwind`, `prisma`, `trigger`) plus one shiki built-in to demonstrate the "30+ themes" claim
- The TypeScript snippet used in both the hero preview and the gallery must be a single shared constant (~10–14 lines, real-looking code)
- Base URL is `https://codereel.dev` — same as Phase 1; canonical and JSON-LD must use it
- Must reuse the existing `Button` component from `@/components/animate-ui/components/buttons/button` for CTAs to stay consistent with homepage

## Acceptance Criteria

- [ ] `grep -rn "use client" src/app/code-screenshot/` returns zero matches
- [ ] `curl http://localhost:5566/code-screenshot` (after `next build && next start`) returns HTML containing "Beautiful Code Screenshots, Instantly"
- [ ] HTML response contains `<pre class="shiki` ≥ 7 times (1 hero preview + 6 gallery previews)
- [ ] HTML response contains "Paste your code", "Pick a theme", and "Export the image" step headings
- [ ] `<head>` contains `<title>Code Screenshot Generator — Beautiful Code Images | CodeReel</title>` and `<link rel="canonical" href="https://codereel.dev/code-screenshot">`
- [ ] HTML response contains exactly 2 JSON-LD blocks — one `"@type": "WebPage"` and one `"@type": "BreadcrumbList"`
- [ ] Both JSON-LD blocks pass Google's Rich Results Test without errors
- [ ] `GET /sitemap.xml` contains `<loc>https://codereel.dev/code-screenshot</loc>`
- [ ] Lighthouse SEO score ≥ 90 on `/code-screenshot` (run via `npx lighthouse http://localhost:5566/code-screenshot --only-categories=seo`)

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                                                         |
|--------------------|-------|------|--------|---------------------------------------------------------------|
| Goal Clarity       | 0.92  | 0.75 | ✓      | SSR-only + Lighthouse ≥ 90 + indexable HTML — falsifiable     |
| Boundary Clarity   | 0.90  | 0.70 | ✓      | 7 explicit out-of-scope items with reasoning                  |
| Constraint Clarity | 0.80  | 0.65 | ✓      | Theme/language/snippet locked; CTA destination locked         |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | 9 pass/fail checkboxes, all greppable or Lighthouse-verifiable |
| **Ambiguity**      | 0.12  | ≤0.20| ✓      |                                                               |

## Interview Log

| Round | Perspective      | Question summary                                | Decision locked                                                                                       |
|-------|------------------|-------------------------------------------------|-------------------------------------------------------------------------------------------------------|
| 1     | Researcher       | Primary success metric?                         | Indexable HTML + Lighthouse SEO ≥ 90; ranking is not a phase exit criterion                           |
| 1     | Researcher       | Page interactivity model?                       | Pure SSR, zero client islands                                                                         |
| 1     | Researcher       | CTA destination?                                | Plain `/app` — no query params, no editor API surface                                                 |
| 2     | Simplifier       | Demo block theme + language?                    | TypeScript + `vesper` theme for the hero; 5 additional themes for gallery                             |
| 2     | Boundary Keeper  | Page sections — MVP?                            | User flagged my initial answer as "too similar to homepage" — pivoted to Themes Gallery + How It Works |
| 2     | Boundary Keeper  | Per-page OG + JSON-LD?                          | Reuse global OG; add `WebPage` + `BreadcrumbList` JSON-LD                                             |
| 2     | Simplifier       | Differentiator from homepage?                   | Themes Gallery (6 mini previews) + How It Works (3 steps) — both unique to this page                  |

---

*Phase: 02-code-screenshot-landing-page*
*Spec created: 2026-05-07*
*Next step: /gsd-discuss-phase 2 — implementation decisions (codeToHtml integration, framed-screenshot styling, gallery layout, etc.)*
