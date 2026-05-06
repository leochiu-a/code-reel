# Phase 999.1: Technical SEO Foundation — Specification

**Created:** 2026-05-06
**Ambiguity score:** 0.12 (gate: ≤ 0.20)
**Requirements:** 5 locked

## Goal

The CodeReel homepage renders fully indexable HTML content without JavaScript execution, and the site has complete SEO infrastructure (sitemap.xml, robots.txt, OG/Twitter metadata, canonical URL, JSON-LD structured data) — enabling Googlebot to correctly index the site and achieving Lighthouse SEO ≥ 90.

## Background

The homepage (`src/app/page.tsx`) is entirely `"use client"` with all content — H1, hero paragraph, and feature cards — gated behind a 1250ms `setTimeout` transition. Googlebot sees an empty page. `layout.tsx` metadata only contains `title` and `description`; no `openGraph`, `twitter`, `metadataBase`, or canonical. No `sitemap.ts`, `robots.ts`, or JSON-LD exists in the project. The production domain is `codereel.dev`.

## Requirements

1. **Homepage SSR**: The homepage H1, hero paragraph, and feature cards render in server-side HTML.
   - Current: `page.tsx` is `"use client"` — all content is hidden until 1250ms JS timer fires; raw HTML response is empty
   - Target: Static content (H1 "Animate every highlight. Share every step.", hero paragraph, 3 feature cards) is extracted into a Server Component and present in the initial HTML response; the logo animation and `CodeEditor` preview remain as client-only components
   - Acceptance: `curl https://codereel.dev` (or local `next build && next start`) returns HTML containing the H1 text and at least one feature card title without JavaScript execution

2. **sitemap.xml**: The site exposes a valid sitemap at `/sitemap.xml`.
   - Current: No `sitemap.ts` exists; no sitemap served
   - Target: `src/app/sitemap.ts` generates sitemap.xml with entries for `/` and `/app`, using `https://codereel.dev` as the base URL
   - Acceptance: `GET /sitemap.xml` returns a valid XML sitemap containing `<loc>https://codereel.dev/</loc>` and `<loc>https://codereel.dev/app</loc>`

3. **robots.txt**: The site exposes a robots.txt that allows all routes.
   - Current: No `robots.ts` exists; no robots.txt served
   - Target: `src/app/robots.ts` generates a robots.txt that allows all user-agents to crawl all paths, with a `Sitemap:` directive pointing to `https://codereel.dev/sitemap.xml`
   - Acceptance: `GET /robots.txt` returns a response with `User-agent: *`, `Allow: /`, and `Sitemap: https://codereel.dev/sitemap.xml`

4. **Enhanced metadata**: `layout.tsx` exports complete Next.js Metadata with OG, Twitter Card, metadataBase, and canonical.
   - Current: `metadata` in `layout.tsx` only has `title` and `description`; no OG or Twitter fields; no metadataBase
   - Target: `metadata` includes `metadataBase: new URL("https://codereel.dev")`, `openGraph` (title, description, url, type: "website"), `twitter` (card: "summary_large_image", title, description), and `alternates.canonical: "/"`
   - Acceptance: The rendered `<head>` contains `<meta property="og:title">`, `<meta name="twitter:card" content="summary_large_image">`, and `<link rel="canonical" href="https://codereel.dev/">`

5. **JSON-LD structured data**: The homepage includes a SoftwareApplication schema.
   - Current: No structured data exists anywhere in the project
   - Target: A `<script type="application/ld+json">` is injected on the homepage with `@type: SoftwareApplication`, `name: "CodeReel"`, `description`, `url: "https://codereel.dev"`, `applicationCategory: "MultimediaApplication"`, `operatingSystem: "Web"`, and `offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }`
   - Acceptance: The homepage HTML contains a `<script type="application/ld+json">` block with valid JSON matching the SoftwareApplication schema fields above; Google's Rich Results Test accepts it without errors

## Boundaries

**In scope:**
- `src/app/page.tsx` SSR refactor — extract static content (H1, hero paragraph, feature cards) into a Server Component
- `src/app/sitemap.ts` — generates `/sitemap.xml` with `/` and `/app` entries
- `src/app/robots.ts` — generates `/robots.txt` allowing all routes with sitemap directive
- `src/app/layout.tsx` — add `metadataBase`, `openGraph`, `twitter`, `alternates.canonical`
- JSON-LD `SoftwareApplication` schema injected on the homepage

**Out of scope:**
- SEO for `/code-screenshot` and `/code-animation` pages — those are phases 999.2 and 999.3
- Lighthouse Performance / Core Web Vitals (LCP, CLS, FID) — only SEO score is targeted here
- Google Search Console account setup, property verification, sitemap submission — manual step, not code
- Blog or content-based SEO strategy — no blog exists
- Per-page metadata for `/app` — the editor is a tool page; no specific OG metadata needed beyond global defaults

## Constraints

- Base URL is `https://codereel.dev` — hardcoded in `metadataBase`, sitemap, robots.txt, and JSON-LD
- SSR refactor must not break the existing logo animation and code preview — client-side behavior is preserved by keeping those components as `"use client"` or `dynamic({ ssr: false })`
- JSON-LD must be valid per schema.org SoftwareApplication spec — no extra fields that would cause Rich Results Test warnings

## Acceptance Criteria

- [ ] `curl https://codereel.dev` (or `curl http://localhost:3000` after `next build && next start`) returns HTML containing the H1 text without JS execution
- [ ] `GET /sitemap.xml` returns valid XML with entries for `https://codereel.dev/` and `https://codereel.dev/app`
- [ ] `GET /robots.txt` contains `User-agent: *`, `Allow: /`, and `Sitemap: https://codereel.dev/sitemap.xml`
- [ ] `<head>` contains `<meta property="og:title">`, `<meta property="og:description">`, `<meta name="twitter:card" content="summary_large_image">`, and `<link rel="canonical" href="https://codereel.dev/">`
- [ ] Homepage HTML contains a `<script type="application/ld+json">` block with `SoftwareApplication` schema including all 6 required fields
- [ ] Lighthouse SEO score ≥ 90 on the homepage (run via `npx lighthouse https://codereel.dev --only-categories=seo`)

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                                              |
|--------------------|-------|------|--------|----------------------------------------------------|
| Goal Clarity       | 0.90  | 0.75 | ✓      | Domain, SSR split, and Lighthouse target locked    |
| Boundary Clarity   | 0.90  | 0.70 | ✓      | 4 explicit out-of-scope items with reasoning       |
| Constraint Clarity | 0.85  | 0.65 | ✓      | JSON-LD fields enumerated, base URL confirmed      |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | 6 pass/fail checkboxes covering all 5 requirements |
| **Ambiguity**      | 0.12  | ≤0.20| ✓      |                                                    |

## Interview Log

| Round | Perspective      | Question summary                        | Decision locked                                                      |
|-------|------------------|-----------------------------------------|----------------------------------------------------------------------|
| 1     | Researcher       | Production domain?                      | `codereel.dev`                                                       |
| 1     | Researcher       | Should /app be indexed?                 | Yes — allow all routes, no disallow rules in robots.txt             |
| 1     | Researcher       | SSR split — what stays client?          | Logo animation + CodeEditor preview = client; H1/features = server  |
| 2     | Simplifier       | Which pages in sitemap?                 | Only `/` and `/app` — future landing pages are 999.2/999.3          |
| 2     | Simplifier       | JSON-LD schema type?                    | SoftwareApplication                                                  |
| 2     | Simplifier       | Minimum success metric?                 | Lighthouse SEO ≥ 90                                                  |
| 3     | Boundary Keeper  | What's explicitly NOT this phase?       | Landing page SEO, Perf/CWV, GSC setup, blog SEO                     |
| 3     | Boundary Keeper  | JSON-LD required fields?                | name, description, url, applicationCategory, operatingSystem, offers |

---

*Phase: 999.1-technical-seo-foundation*
*Spec created: 2026-05-06*
*Next step: /gsd-discuss-phase 999.1 — implementation decisions (how to build what's specified above)*
