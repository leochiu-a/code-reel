# 999.2 /code-screenshot Landing Page — Notes

## 關鍵字策略

- 主：`code screenshot`
- 次：`code image`、`code snippet screenshot`、`code to image`
- 擇一頁面，不分開做（搜尋意圖重疊）

## 頁面設計

- 路由：`/code-screenshot`，純 Server Component，無 `"use client"`
- H1: "Beautiful Code Screenshots, Instantly"
- Code preview：`codeToHtml()` from shiki server-side render，靜態 HTML 可被 Googlebot 索引
- 頁面結構：Header → Hero + CTA → Shiki Code Preview → Feature Cards → How It Works → Footer CTA
- Feature Cards：30+ themes、12 languages、one-click export

## Metadata

```
title: "Code Screenshot Generator — Beautiful Code Images | CodeReel"
description: "Turn any code snippet into a beautiful, shareable code screenshot. 30+ themes, syntax highlighting for 12+ languages. Free online code image generator."
```

## 競品參考

carbon.now.sh、ray.so
