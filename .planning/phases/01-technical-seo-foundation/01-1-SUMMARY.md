---
phase: 01-technical-seo-foundation
plan: 1
subsystem: ui
tags: [nextjs, seo, server-component, json-ld, schema-org, shiki]

# Dependency graph
requires: []
provides:
  - Server-rendered homepage with H1, hero, and feature cards in initial HTML
  - SoftwareApplication JSON-LD structured data inline in page HTML
  - CodePreview client island with auto-cycling code demo
affects: [02-seo-infrastructure-files, 03-og-image-generation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Server Component + client island (island architecture) for interactive demos on static pages"
    - "Inline JSON-LD via dangerouslySetInnerHTML on hardcoded constant — safe pattern for static structured data"

key-files:
  created:
    - src/components/CodePreview.tsx
  modified:
    - src/app/page.tsx

key-decisions:
  - "Removed 1250ms timer-gated content entirely — all indexable text now in server-rendered HTML"
  - "CodePreview extracted as named export client island, imported by server component page.tsx"
  - "Feature card hover effects use Tailwind hover:scale-[1.02] transition-transform instead of motion.div whileHover"
  - "Logo starts in top-left nav position (post-transition state) — no animated intro since transition removed"

patterns-established:
  - "Client islands: use 'use client' + named export, dynamic import for heavy deps (CodeEditor), imported by server component"
  - "JSON-LD: defined as typed const object, serialized with JSON.stringify in dangerouslySetInnerHTML"

requirements-completed: [REQ-1, REQ-5]

# Metrics
duration: 2min
completed: 2026-05-06
---

# Phase 1 Plan 1: Homepage SSR Refactor Summary

**Homepage refactored from 1250ms timer-gated client component to static Server Component with inline SoftwareApplication JSON-LD schema and CodePreview client island**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-05-06T13:34:18Z
- **Completed:** 2026-05-06T13:35:37Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Removed `"use client"`, `useState`, `useEffect`, and `motion` from page.tsx — homepage is now a pure Server Component
- H1 "Animate every highlight. Share every step.", hero paragraph, and all three feature cards render in initial HTML without JavaScript
- SoftwareApplication JSON-LD schema injected inline satisfying REQ-5
- CodePreview client island extracts all interactive state (previewIndex cycling, useHighlighter) and renders the auto-cycling code demo
- Next.js build confirms homepage as `○ (Static)` — prerendered as static content

## Task Commits

Each task was committed atomically:

1. **T-01: Extract CodePreview client island** - `d687eb7` (feat)
2. **T-02: Refactor page.tsx to Server Component with JSON-LD** - `772ffff` (feat)

**Plan metadata:** (committed with SUMMARY)

## Files Created/Modified
- `src/components/CodePreview.tsx` - Client island: useHighlighter, previewIndex state, setInterval cycling, dynamic CodeEditor import
- `src/app/page.tsx` - Server Component: static H1/hero/features, JSON-LD script, imports CodePreview island

## Decisions Made
- Removed 1250ms transition animation entirely — logo starts in top-left nav position (the post-transition state from original), aligning with D-02 and D-03 from context decisions
- Named export `CodePreview` (not default) makes the client-island role explicit at the import site
- JSON-LD constant uses plain JS object (not string literal) for type safety, serialized at render time

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- REQ-1 (server-rendered homepage content) and REQ-5 (JSON-LD structured data) are complete
- Plan 2 can proceed to add sitemap.xml, robots.txt, and canonical meta tags (REQ-2, REQ-3, REQ-4)
- The server component pattern established here (static shell + client island) should be maintained for any future landing pages

## Threat Surface Scan

No new security surface introduced. JSON-LD is a hardcoded constant with no user input — T-01-01 mitigated as planned. Page renders only public marketing content (T-01-02 accepted). CodePreview processes only static PREVIEW_STEPS constants (T-01-03 accepted).

## Self-Check: PASSED
- `src/components/CodePreview.tsx` exists
- `src/app/page.tsx` modified with no "use client", no motion imports, JSON-LD present
- Commit `d687eb7` exists (T-01)
- Commit `772ffff` exists (T-02)
- `npx tsc --noEmit` exits 0
- `next build` completes with homepage as `○ (Static)`

---
*Phase: 01-technical-seo-foundation*
*Completed: 2026-05-06*
