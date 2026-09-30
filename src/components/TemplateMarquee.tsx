"use client";

import { memo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

import {
  DEFAULT_EDITOR_SETTINGS,
  EDITOR_VIEW_TRANSITION,
  LANGUAGES,
  THEMES,
  getThemeSettings,
} from "@/constants";
import useHighlighter from "@/hooks/useHighlighter";
import { storeTheme } from "@/services/editorSettings";
import type { EditorSettings, Language, Theme } from "@/types";
import type { Highlighter } from "shiki";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), { ssr: false });

// A row of looks that scrolls on its own, after Jitter's template gallery.
// Each card is the real renderer in one theme; hovering it plays its two steps
// and clicking opens the editor in that theme.

type Snippet = {
  language: Language;
  steps: { code: string; highlightLines: number[] }[];
};

const SNIPPETS: Snippet[] = [
  {
    language: "typescript",
    steps: [
      {
        code: `const greet = (name: string) => {
  return "Hello, " + name;
};`,
        highlightLines: [2],
      },
      {
        code: `const greet = (name: string) => {
  return \`Hello, \${name}!\`;
};`,
        highlightLines: [2],
      },
    ],
  },
  {
    language: "css",
    steps: [
      {
        code: `.card {
  padding: 16px;
}`,
        highlightLines: [2],
      },
      {
        code: `.card {
  padding: 16px;
  border-radius: 12px;
}`,
        highlightLines: [3],
      },
    ],
  },
  {
    language: "rust",
    steps: [
      {
        code: `fn main() {
    println!("Hello");
}`,
        highlightLines: [2],
      },
      {
        code: `fn main() {
    let name = "Reel";
    println!("Hello, {name}");
}`,
        highlightLines: [2, 3],
      },
    ],
  },
  {
    language: "python",
    steps: [
      {
        code: `def total(items):
    return sum(items)`,
        highlightLines: [1],
      },
      {
        code: `def total(items, tax=0.1):
    subtotal = sum(items)
    return subtotal * (1 + tax)`,
        highlightLines: [2, 3],
      },
    ],
  },
];

// Themes that bring their own canvas, so each card reads as a distinct look.
const TEMPLATE_THEMES: Theme[] = [
  "vercel",
  "tailwind",
  "prisma",
  "trigger",
  "dracula",
  "synthwave-84",
  "github-dark",
  "poimandres",
];

const CARD_PADDING = 32;

const TEMPLATES = TEMPLATE_THEMES.map((theme, index) => {
  const snippet = SNIPPETS[index % SNIPPETS.length];
  const settings: EditorSettings = {
    ...DEFAULT_EDITOR_SETTINGS,
    ...getThemeSettings(theme, DEFAULT_EDITOR_SETTINGS.background),
    language: snippet.language,
    fontSize: 16,
    // Theme paddings (up to 96px) would leave the code a sliver once the card
    // scales down; a tighter frame keeps it readable.
    padding: CARD_PADDING,
  };
  return { theme, settings, steps: snippet.steps };
});

// Cards render the editor at a fixed size and scale it down as a whole, so
// every theme keeps its proportions. The size fits the longest snippet with
// line numbers and window controls.
const RENDER_WIDTH = 460;
const RENDER_HEIGHT = 250;
// The card's 8px inner padding frames the preview on both sides.
const PREVIEW_WIDTH = 300 - 16;
const PREVIEW_SCALE = PREVIEW_WIDTH / RENDER_WIDTH;

type TemplateCardProps = {
  theme: Theme;
  settings: EditorSettings;
  steps: Snippet["steps"];
  highlighter: Highlighter | null;
  /** False for the marquee's second copy, which screen readers and Tab skip. */
  focusable: boolean;
  id: string;
  /** The clicked card, whose preview morphs into the editor frame. */
  opening: boolean;
  onOpen: (id: string) => void;
};

// Memoised so a click re-renders only the card whose `opening` flips: each card
// is a live editor, and re-rendering all of them delays the navigation.
const TemplateCard = memo(function TemplateCard({
  theme,
  settings,
  steps,
  highlighter,
  focusable,
  id,
  opening,
  onOpen,
}: TemplateCardProps) {
  const [playing, setPlaying] = useState(false);
  const step = steps[playing ? 1 : 0];

  return (
    <Link
      href="/app"
      tabIndex={focusable ? undefined : -1}
      className="group block w-[300px] shrink-0 rounded-2xl border border-white/10 bg-[#212121] p-2 transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-white/25 focus-visible:border-white/40 focus-visible:outline-none"
      onPointerEnter={() => setPlaying(true)}
      onPointerLeave={() => setPlaying(false)}
      onFocus={() => setPlaying(true)}
      onBlur={() => setPlaying(false)}
      onClick={() => {
        storeTheme(theme);
        onOpen(id);
      }}
    >
      <div
        className="overflow-hidden rounded-xl"
        style={{ width: PREVIEW_WIDTH, height: RENDER_HEIGHT * PREVIEW_SCALE }}
        aria-hidden="true"
      >
        <div
          className="origin-top-left"
          style={{ width: RENDER_WIDTH, transform: `scale(${PREVIEW_SCALE})` }}
        >
          <CodeEditor
            code={step.code}
            settings={settings}
            showPreview={Boolean(highlighter)}
            highlightLines={step.highlightLines}
            highlighter={highlighter}
            containerWidth={RENDER_WIDTH}
            containerHeight={RENDER_HEIGHT}
            scale={PREVIEW_SCALE}
            // Only the clicked card takes the shared name: the loop repeats
            // every card, and two elements with one name would abort it.
            viewTransitionName={opening ? EDITOR_VIEW_TRANSITION : undefined}
          />
        </div>
      </div>
      <div className="flex items-center justify-between px-2 pt-3 pb-1 text-sm">
        <span className="text-white">
          {THEMES[theme].label}
          <span className="ml-2 text-white/40">{LANGUAGES[settings.language].label}</span>
        </span>
        <span className="text-xs text-white/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          Open in editor ↗
        </span>
      </div>
    </Link>
  );
});

export function TemplateMarquee() {
  const highlighter = useHighlighter();
  const [openingCard, setOpeningCard] = useState<string | null>(null);

  return (
    <div className="reel-marquee-mask relative overflow-hidden motion-reduce:overflow-x-auto">
      <div className="reel-marquee flex w-max gap-3 py-2" style={{ animationDuration: "60s" }}>
        {[0, 1].map((copy) => (
          // The second copy only closes the loop. Half the time it is the copy on
          // screen, so it must stay clickable (not inert); it only leaves the
          // accessibility tree and the tab order.
          <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3">
            {TEMPLATES.map((template) => {
              const id = `${copy}-${template.theme}`;
              return (
                <li key={template.theme}>
                  <TemplateCard
                    {...template}
                    highlighter={highlighter}
                    focusable={copy === 0}
                    id={id}
                    opening={openingCard === id}
                    onOpen={setOpeningCard}
                  />
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    </div>
  );
}
