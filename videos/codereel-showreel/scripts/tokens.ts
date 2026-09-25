// Pre-tokenizes the demo snippet with Shiki so the video renders real CodeReel
// highlighting without running Shiki inside the Remotion bundle.
import { writeFileSync } from "node:fs";
import { createHighlighter } from "shiki";
import VERCEL from "../../../src/themes/vercel.ts";
import TAILWIND from "../../../src/themes/tailwind.ts";
import PRISMA from "../../../src/themes/prisma.ts";
import TRIGGER from "../../../src/themes/trigger.ts";

const STEPS = [
  `export function reel(code: string) {
  return highlight(code);
}`,
  `export async function reel(code: string) {
  const steps = split(code);
  return highlight(steps);
}`,
  `export async function reel(code: string) {
  const steps = split(code);
  const frames = await animate(steps, { fps: 60 });
  return share(frames);
}`,
];

const MONTAGE = [
  { id: "vercel", label: "Vercel", theme: VERCEL },
  { id: "tailwind", label: "Tailwind", theme: TAILWIND },
  { id: "prisma", label: "Prisma", theme: PRISMA },
  { id: "trigger", label: "Trigger.dev", theme: TRIGGER },
  { id: "synthwave-84", label: "Synthwave '84", theme: "synthwave-84" },
  { id: "poimandres", label: "Poimandres", theme: "poimandres" },
  { id: "dracula", label: "Dracula", theme: "dracula" },
  { id: "night-owl", label: "Night Owl", theme: "night-owl" },
] as const;

const hl = await createHighlighter({ themes: MONTAGE.map((m) => m.theme), langs: ["typescript"] });

type Piece = { t: string; c: string; l: number; x: number; i?: boolean };
type Tok = Piece & { k: string };

// Split Shiki tokens into word / punctuation pieces laid out on a monospace
// grid, so the renderer can place every piece by line and column.
const pieces = (code: string, theme: string) => {
  const r = hl.codeToTokens(code, { lang: "typescript", theme });
  const out: Piece[] = [];
  r.tokens.forEach((line, l) => {
    let col = 0;
    for (const tk of line) {
      for (const m of tk.content.matchAll(/\w+|[^\w\s]+/g)) {
        out.push({
          t: m[0],
          c: tk.color ?? r.fg!,
          l,
          x: col + m.index!,
          ...(tk.fontStyle === 1 ? { i: true } : {}),
        });
      }
      col += tk.content.length;
    }
  });
  return { fg: r.fg!, bg: r.bg!, tokens: out };
};

// Magic Move style pairing: the longest common subsequence of piece texts
// keeps its key across steps and glides; everything else fades.
let uid = 0;
const pair = (a: Piece[], b: Piece[]) => {
  const n = a.length;
  const m = b.length;
  const dp = Array.from({ length: n + 1 }, () => Array.from({ length: m + 1 }, () => 0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i][j] = a[i].t === b[j].t ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const from: Tok[] = a.map((t) => ({ ...t, k: `k${uid++}` }));
  const to: Tok[] = b.map((t) => ({ ...t, k: `k${uid++}` }));
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i].t === b[j].t) {
      to[j].k = from[i].k;
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return { from, to };
};

const stepPieces = STEPS.map((code) => pieces(code, "vercel").tokens);
const pairs = stepPieces.slice(1).map((next, i) => pair(stepPieces[i], next));

const themes = MONTAGE.map((m) => {
  const r = pieces(STEPS[2], typeof m.theme === "string" ? m.theme : m.theme.name!);
  return {
    id: m.id,
    label: m.label,
    fg: r.fg,
    bg: r.bg,
    tokens: r.tokens.map((t, n) => ({ ...t, k: `t${n}` })),
  };
});

writeFileSync(
  new URL("../src/tokens.json", import.meta.url),
  JSON.stringify({ steps: STEPS, pairs, themes }),
);
