# Roadmap: CodeReel

## Overview

CodeReel 是一個讓開發者把程式碼轉成精美動畫影片的工具。

## Milestones

- 📋 **v1.1 SEO Landing Pages** - Phases TBD (planned)

## Phases

### 📋 v1.1 SEO Landing Pages (Planned)

**Milestone Goal:** 建立 SEO 基礎設施與關鍵字 landing pages，讓 Google 能正確索引 CodeReel 並帶入自然流量。

_No phases committed yet. Promote from backlog when ready._


## Backlog

### Phase 999.1: Technical SEO Foundation (BACKLOG)

**Goal:** 建立 SEO 基礎設施，讓 Google 能正確認識和索引 CodeReel。目前首頁是純 client-side render，Googlebot 爬到的幾乎是空頁。
**Requirements:** TBD
**Plans:** 0 plans

Ideas:
- `src/app/sitemap.ts` — 自動生成 sitemap.xml，列出所有頁面 URL
- `src/app/robots.ts` — robots.txt，告訴 Google 哪些可以爬
- `src/app/layout.tsx` — 補完整 metadata：`openGraph`、`twitter`、`metadataBase`、`canonical`
- JSON-LD structured data（SoftwareApplication schema）加在 layout
- 首頁 SSR 問題：H1 和 features 藏在 1250ms transition 後，Googlebot 等不到；考慮把靜態內容抽成 Server Component

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.2: /code-screenshot Landing Page (BACKLOG)

**Goal:** 建立針對 "code screenshot"（主）和 "code image"（次）關鍵字的 SEO landing page，讓搜尋這些詞的用戶找到 CodeReel。
**Requirements:** TBD
**Plans:** 0 plans

Ideas:
- 路由：`/code-screenshot`，純 Server Component（無 `"use client"`），Googlebot 完整爬取
- H1: "Beautiful Code Screenshots, Instantly"，自然帶入 "code image" 作為次要關鍵字
- Code preview 用 `codeToHtml()` from shiki server-side render，靜態 HTML 可被索引
- 頁面結構：Header → Hero + CTA → Shiki Code Preview → Feature Cards（30+ themes, 12 languages, one-click export）→ How It Works → Footer CTA
- Metadata: title "Code Screenshot Generator — Beautiful Code Images | CodeReel"
- 競品比較對象：carbon.now.sh、ray.so

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

### Phase 999.3: /code-animation Landing Page (BACKLOG)

**Goal:** 建立針對 "code animation"（主）和 "animated code snippet"、"code walkthrough" 關鍵字的 SEO landing page，展示 CodeReel 的核心動畫差異化功能。
**Requirements:** TBD
**Plans:** 0 plans

Ideas:
- 路由：`/code-animation`，純 Server Component
- H1: "Animate Your Code. Explain Every Step."
- 顯示兩個 Shiki-rendered code block（before/after），視覺展示 highlight step 的概念
- 頁面結構：Header → Hero + CTA → Step Preview（2個 code block）→ Feature Cards（Step Highlights, Smooth Transitions, Video Export）→ Use Cases（Developers, Educators, Content Creators）→ Footer CTA
- 強調與 /code-screenshot 的差異：動畫、步驟、影片匯出
- Metadata: title "Code Animation Tool — Animated Code Walkthroughs | CodeReel"

Plans:
- [ ] TBD (promote with /gsd:review-backlog when ready)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
