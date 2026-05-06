# Phase 1: Technical SEO Foundation - Context

**Gathered:** 2026-05-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Build complete SEO infrastructure for CodeReel: server-render the homepage static content, add sitemap.xml + robots.txt, enrich `layout.tsx` metadata with OG/Twitter/canonical, inject JSON-LD SoftwareApplication schema, and generate an `opengraph-image.tsx` for social sharing previews.

</domain>

<spec_lock>
## Requirements (locked via SPEC.md)

**5 requirements are locked.** See `01-SPEC.md` for full requirements, boundaries, and acceptance criteria.

Downstream agents MUST read `01-SPEC.md` before planning or implementing. Requirements are not duplicated here.

**In scope (from SPEC.md):**
- `src/app/page.tsx` SSR refactor — extract static content (H1, hero paragraph, feature cards) into a Server Component
- `src/app/sitemap.ts` — generates `/sitemap.xml` with `/` and `/app` entries
- `src/app/robots.ts` — generates `/robots.txt` allowing all routes with sitemap directive
- `src/app/layout.tsx` — add `metadataBase`, `openGraph`, `twitter`, `alternates.canonical`
- JSON-LD `SoftwareApplication` schema injected on the homepage

**Out of scope (from SPEC.md):**
- SEO for `/code-screenshot` and `/code-animation` pages — those are phases 999.2 and 999.3
- Lighthouse Performance / Core Web Vitals (LCP, CLS, FID) — only SEO score is targeted here
- Google Search Console account setup, property verification, sitemap submission — manual step, not code
- Blog or content-based SEO strategy — no blog exists
- Per-page metadata for `/app` — the editor is a tool page; no specific OG metadata needed beyond global defaults

</spec_lock>

<decisions>
## Implementation Decisions

### SSR Component Split

- **D-01:** `page.tsx` becomes a **Server Component** — renders logo (static, no animation), H1, hero paragraph, "Get started" button, feature cards, and footer as plain HTML.
- **D-02:** The **1250ms transition timer is removed entirely** — all content visible immediately; no `useState` or `useEffect` for the intro sequence.
- **D-03:** The **logo draw animation is removed** — `LogoText` renders as a static SVG (or plain text element) in the top-left from the start. No `motion.svg` draw effect.
- **D-04:** A **`<CodePreview>` client island** is extracted to handle the auto-cycling code demo (`useHighlighter`, `previewIndex` state, `setInterval`, `CodeEditor`). This is the only client-side component remaining on the homepage.
- **D-05:** The **`"use client"` directive, `useState`, `useEffect`, and all `motion` imports are removed** from `page.tsx`.

### H1 and Hero Animations

- **D-06:** The H1 **per-character `motion.span` animation is removed** — H1 renders as a plain server-rendered `<h1>` with the full text immediately visible.
- **D-07:** The hero paragraph renders as a plain `<p>` — no motion animation.
- **D-08:** Feature cards use **CSS hover transition** (`hover:scale-[1.02] transition-transform`) instead of `motion.div whileHover`. No framer-motion dependency for cards.

### OG Image

- **D-09:** Use **Next.js `opengraph-image.tsx`** (`src/app/opengraph-image.tsx`) with `ImageResponse` API — no static PNG to maintain.
- **D-10:** Image content: **"CodeReel" logo text + tagline** ("Animate your code. Share your story.") on `#181818` dark background. Matches homepage color. Dimensions: 1200×630.
- **D-11:** `twitter.card` stays as **`"summary_large_image"`** — `opengraph-image.tsx` provides the image that makes this card type work.

### JSON-LD Placement

- **D-12:** JSON-LD `<script type="application/ld+json">` is injected **directly in `page.tsx`** as a Server Component inline script — no `next/script` wrapper needed for synchronous structured data.

### Claude's Discretion

- Exact font/weight/layout of `opengraph-image.tsx` — use Inter (available via `next/og`), white text, centered. Keep it minimal.
- Whether to keep the `LogoText` component with `draw={false}` or replace with a plain SVG text element — either works; prefer the simpler path.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Spec
- `.planning/phases/01-technical-seo-foundation/01-SPEC.md` — Locked requirements, boundaries, and acceptance criteria. **MUST read before planning.**

### Key Source Files to Modify
- `src/app/page.tsx` — Homepage; currently `"use client"` — refactor target
- `src/app/layout.tsx` — Root layout metadata; add OG/Twitter/canonical
- `src/components/LogoText.tsx` — Logo SVG component using `motion.svg`; will be simplified or replaced

### Next.js References
- `next.config.ts` — Has `experimental.viewTransition: true`; keep unchanged
- Next.js App Router docs: `sitemap.ts` and `robots.ts` file conventions at `/sitemap.xml` and `/robots.txt`
- Next.js `ImageResponse` API for `opengraph-image.tsx`

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/LogoText.tsx` — SVG-based logo; currently uses `motion.svg`. With `draw={false}`, animations are inert. Can be used as-is or replaced with a plain SVG element.
- `src/components/CodeEditor.tsx` — Already `dynamic({ ssr: false })` in some contexts; safe to use in a client island.
- `src/hooks/useHighlighter.tsx` — Client hook for Shiki highlighter; needed in `<CodePreview>` island.
- `src/constants.tsx` — Contains `PREVIEW_STEPS`, `DEFAULT_EDITOR_SETTINGS`, `HIGHLIGHT_STEP_DELAY_MS`, `PLAY_ANIMATION_INTERVAL_MS` — all importable from a Server Component (no client APIs).
- `FEATURES` array in `page.tsx` — Static data; can be moved to `constants.tsx` or kept inline in the Server Component.

### Established Patterns
- `/app` route (`src/app/app/page.tsx`) uses `dynamic({ ssr: false })` pattern for the full editor — confirms the project already uses this pattern for client-only components.
- Tailwind CSS for all styling — feature card hover effect should use Tailwind hover variant, not inline styles.
- `"use client"` + `dynamic` for heavy client components is the project's established pattern.

### Integration Points
- `src/app/layout.tsx` — OG/Twitter metadata added here affects all pages (global defaults). Page-level metadata in `page.tsx` overrides as needed.
- `src/app/opengraph-image.tsx` — New file; Next.js auto-discovers it and generates `/og?...` route for social previews.
- `src/app/sitemap.ts` and `src/app/robots.ts` — New files; auto-served by Next.js at `/sitemap.xml` and `/robots.txt`.

</code_context>

<specifics>
## Specific Ideas

- OG image: dark `#181818` background, "CodeReel" as large text, tagline below — minimal, on-brand.
- Feature card hover: Tailwind `hover:scale-[1.02] transition-transform duration-200` — no JS.
- The `<CodePreview>` client island should be self-contained: `useHighlighter`, `previewIndex` state, `setInterval` cycling, and `CodeEditor` all live inside it.
- The existing `sr-only` pattern on the H1 (`<span className="sr-only">`) can be removed since the H1 will be server-rendered plain text — no need for the accessibility workaround.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-technical-seo-foundation*
*Context gathered: 2026-05-06*
