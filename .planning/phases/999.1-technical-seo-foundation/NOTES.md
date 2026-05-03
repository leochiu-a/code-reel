# 999.1 Technical SEO Foundation — Notes

## 問題背景

首頁是 `"use client"` + 內容藏在 1250ms transition 後，Googlebot 幾乎爬不到任何內容。
`layout.tsx` 的 metadata 只有 title 和 description，缺 OG、Twitter Card、canonical。

## 想做的事

- `src/app/sitemap.ts` — 自動生成 sitemap.xml
- `src/app/robots.ts` — robots.txt
- `src/app/layout.tsx` — 補 `openGraph`、`twitter`、`metadataBase`、`canonical`
- JSON-LD structured data（SoftwareApplication schema）
- 首頁 SSR：把靜態內容（H1、features）抽成 Server Component，動畫留 client
