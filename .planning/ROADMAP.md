# Roadmap: CodeReel

## Overview

CodeReel 是一個讓開發者把程式碼轉成精美動畫影片的工具。

## Milestones

- 📋 **v1.1 SEO Landing Pages** - Phases TBD (planned)

## Phases

### 📋 v1.1 SEO Landing Pages (Planned)

**Milestone Goal:** 建立 SEO 基礎設施與關鍵字 landing pages，讓 Google 能正確索引 CodeReel 並帶入自然流量。

### Phase 1: Technical SEO Foundation

**Goal:** 建立 SEO 基礎設施，讓 Google 能正確索引 CodeReel。
**Status:** ✅ Complete
**Spec:** [01-SPEC.md](.planning/phases/01-technical-seo-foundation/01-SPEC.md) — 5 requirements locked
**Plans:** 3 plans (3/3 complete)

Plans:
- [x] 01-PLAN-01.md — Homepage SSR refactor: page.tsx becomes Server Component, CodePreview client island extracted, JSON-LD injected
- [x] 01-PLAN-02.md — SEO infrastructure: sitemap.ts, robots.ts, layout.tsx enhanced metadata (OG/Twitter/canonical)
- [x] 01-PLAN-03.md — OG image: opengraph-image.tsx with ImageResponse API (1200x630 dark background)

### Phase 2: /code-screenshot Landing Page

**Goal:** 建立針對 "code screenshot" / "code image" 關鍵字的 SEO landing page。
**Status:** 📋 Planned
**Depends on:** Phase 1
**Plans:** 0 plans (TBD — run /gsd-spec-phase 2 to start)

Plans:
- [ ] TBD


## Backlog

### Phase 999.3: /code-animation Landing Page (BACKLOG)

**Goal:** 建立針對 "code animation" / "animated code snippet" 關鍵字的 SEO landing page。
**Plans:** 0 plans

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1 — Technical SEO Foundation | 3/3 | ✅ Complete | 2026-05-07 |
| 2 — /code-screenshot Landing Page | 0/0 | 📋 Planned | — |
