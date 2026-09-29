import type { Highlighter } from "shiki";
import type { KeyedToken, KeyedTokensInfo } from "@shikijs/magic-move/types";
import { LANGUAGES, resolveShikiThemeName, THEMES } from "../constants";
import { FRAME_PRESENTATION, type FrameId } from "../components/Frame";
import { codeToScopedKeyedTokens, syncMagicMoveStep } from "../services/magicMoveTokens";
import { normalizeHighlightLines } from "../utils/highlightLines";
import type { EditorSettings } from "../types";

/** What a reel is made of: the editor's settings and its steps. */
export type ReelInput = {
  settings: EditorSettings;
  steps: { code: string; highlightLines?: number[] }[];
  /** Seconds each step stays still before the next transition starts. */
  hold: number;
  /** The frame's width in px, as resized in the editor; it fits the code when omitted. */
  width?: number;
};

/** A token placed on the code grid: `x` in px from the line start, `line` from 0. */
export type Piece = {
  key: string;
  text: string;
  color: string;
  italic: boolean;
  bold: boolean;
  lineNumber: boolean;
  x: number;
  line: number;
};

export type Transition = { from: Piece[]; to: Piece[] };

/** Everything a frame of the reel renders from, laid out once up front. */
export type Scene = {
  settings: EditorSettings;
  frame?: FrameId;
  themeBackground: string;
  title: string;
  fontFamily: string;
  lineHeight: number;
  codeWidth: number;
  /** Line count of every step: the window grows and shrinks with the code. */
  lineCounts: number[];
  first: Piece[];
  transitions: Transition[];
  /** Normalized highlight lines of every step. */
  highlights: number[][];
  hold: number;
  width?: number;
};

// Shiki's FontStyle bit flags.
const ITALIC = 1;
const BOLD = 2;

const place = (info: KeyedTokensInfo, measure: (token: KeyedToken) => number): Piece[] => {
  const pieces: Piece[] = [];
  let line = 0;
  let x = 0;
  for (const token of info.tokens) {
    if (token.content === "\n") {
      line++;
      x = 0;
      continue;
    }
    pieces.push({
      key: token.key,
      text: token.content,
      color: token.color ?? info.fg ?? "#ededed",
      italic: Boolean((token.fontStyle ?? 0) & ITALIC),
      bold: Boolean((token.fontStyle ?? 0) & BOLD),
      lineNumber: token.htmlClass === "shiki-magic-move-line-number",
      x,
      line,
    });
    // Magic Move renders every token as its own inline-block, so a line is as
    // wide as its tokens measured one by one.
    x += measure(token);
  }
  return pieces;
};

/**
 * Tokenizes and lays out every step. `fontFamily` must already be loaded:
 * tokens are placed by their measured width.
 */
export const buildScene = (
  { settings, steps, hold, width }: ReelInput,
  highlighter: Highlighter,
  fontFamily: string,
): Scene => {
  const themeConfig = THEMES[settings.theme];
  const lang = LANGUAGES[settings.language].shiki;
  // Every bundled custom theme (src/themes) carries a name.
  const themeName = resolveShikiThemeName(themeConfig)!;

  const ctx = new OffscreenCanvas(1, 1).getContext("2d")!;
  const measure = (token: Pick<KeyedToken, "content" | "fontStyle">) => {
    const style = (token.fontStyle ?? 0) & ITALIC ? "italic " : "";
    const weight = (token.fontStyle ?? 0) & BOLD ? "700 " : "400 ";
    ctx.font = `${style}${weight}${settings.fontSize}px ${fontFamily}`;
    return ctx.measureText(token.content).width;
  };

  const tokenize = (code: string) =>
    codeToScopedKeyedTokens(highlighter, code, lang, themeName, settings.showLineNumbers);

  // The same step-to-step diff the editor's playback runs, so tokens pair up
  // exactly as they do in the app.
  let previous = tokenize(steps[0].code);
  const first = place(previous, measure);
  const transitions: Transition[] = [];
  for (const step of steps.slice(1)) {
    const { from, to } = syncMagicMoveStep(previous, tokenize(step.code));
    transitions.push({ from: place(from, measure), to: place(to, measure) });
    previous = to;
  }

  const placed = [first, ...transitions.map((t) => t.to)];
  const codeWidth = Math.ceil(
    Math.max(0, ...placed.flat().map((p) => p.x + measure({ content: p.text }))),
  );
  const lineHeight = Math.round(settings.fontSize * FRAME_PRESENTATION.editorLineHeightMultiplier);

  return {
    settings,
    frame: themeConfig.frame,
    themeBackground: highlighter.getTheme(themeName).bg,
    title: LANGUAGES[settings.language].label,
    fontFamily,
    lineHeight,
    codeWidth,
    lineCounts: steps.map((step) => step.code.split("\n").length),
    first,
    transitions,
    highlights: steps.map((step) => normalizeHighlightLines(step.highlightLines, step.code)),
    hold,
    width,
  };
};
