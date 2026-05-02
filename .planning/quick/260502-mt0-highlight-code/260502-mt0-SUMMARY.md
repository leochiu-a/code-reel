---
phase: 260502-mt0-highlight-code
plan: 01
subsystem: ui/overlay
tags: [tdd, highlight, overlay, button, header]
dependency_graph:
  requires: []
  provides: [highlight-region-overlay]
  affects: [App.tsx, header]
tech_stack:
  added: []
  patterns: [TDD red-green, computeHighlightRect pure function, ResizeObserver, Escape key listener]
key_files:
  created:
    - src/utils/highlightRegion.ts
    - src/utils/highlightRegion.test.ts
    - src/components/HighlightRegionOverlay.tsx
  modified:
    - src/components/App.tsx
decisions:
  - Toggle button (user controls open/close) instead of auto-dismiss after timeout
  - Reuse existing onboarding-highlight-area target id from VideoOnboarding
  - computeHighlightRect extracted as pure utility to enable TDD without DOM
metrics:
  duration: ~8 minutes
  completed_date: 2026-05-02
  tasks_completed: 3
  files_changed: 4
---

# Phase 260502-mt0 Plan 01: Highlight Capture Region Button Summary

**One-liner:** Toggle button with emerald border overlay + dark backdrop showing exact capture region before screen recording

## What Was Built

- `src/utils/highlightRegion.ts` — Pure function `computeHighlightRect` with `HIGHLIGHT_PADDING_PX=14`, `OnboardingRect` type. Applies padding around a DOM rect and clamps top/left to min 12px to keep the overlay on-screen.
- `src/utils/highlightRegion.test.ts` — 4 vitest tests: null input, normal padding, off-screen clamp, constant export.
- `src/components/HighlightRegionOverlay.tsx` — Stateful overlay component. Uses `useEffect` + `ResizeObserver` to track the target element's `getBoundingClientRect`. Calls `computeHighlightRect` (no inline math). Renders: full-screen backdrop div (click-to-close) + padded emerald border div with dark box-shadow. Closes on Escape key.
- `src/components/App.tsx` — Added `isHighlightRegionOpen` state, `handleToggleHighlightRegion` callback, "Highlight Region" button with `Crosshair` lucide icon. Button shows active state (`border-emerald-300/40 bg-emerald-300/10 text-emerald-100`) when open. Overlay gated by `!isExportMode`.

## TDD Cycle

| Step | Result | Time to complete |
| ---- | ------ | --------------- |
| RED  | 1 test file, 4 tests, import error (no impl) | ~2 min |
| GREEN | All 4 tests pass after writing highlightRegion.ts | ~1 min |

## Decisions Made

1. **Toggle vs auto-dismiss:** Button toggles the overlay open/close on click so the user can study the capture region for as long as needed before starting their recorder.
2. **Reuse onboarding-highlight-area:** The same `id` is already wrapping the code editor and snippet controls — no DOM changes needed.
3. **Pure utility function:** `computeHighlightRect` is extracted from the component to be purely testable without JSDOM, keeping the TDD cycle fast (188ms per run).
4. **No scrollContainerRef:** Unlike `VideoOnboarding`, `HighlightRegionOverlay` only listens to `window resize` (no scroll container ref needed) since the capture area is centered and not within a separately scrolling container.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check

- `src/utils/highlightRegion.ts` — created, exports confirmed
- `src/utils/highlightRegion.test.ts` — created, 4 tests pass
- `src/components/HighlightRegionOverlay.tsx` — created, lint clean
- `src/components/App.tsx` — modified, button + overlay wired
- Commits: 377ce0f (test), cd1ecda (feat impl), 0eb382a (feat component+wire)
