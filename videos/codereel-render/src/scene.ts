import { createHighlighter } from "shiki";
import type { KeyedToken, KeyedTokensInfo } from "@shikijs/magic-move/types";
import {
  DEFAULT_BORDER_RADIUS,
  DEFAULT_EDITOR_SETTINGS,
  LANGUAGES,
  resolveShikiThemeName,
  THEME_BACKGROUND_MAP,
  THEMES,
} from "../../../src/constants";
import { FRAME_PRESENTATION, type FrameId } from "../../../src/components/Frame";
import { codeToScopedKeyedTokens, syncMagicMoveStep } from "../../../src/services/magicMoveTokens";
import { normalizeHighlightLines } from "../../../src/utils/highlightLines";
import type { EditorSettings } from "../../../src/types";
import type { Spec } from "./spec";

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

export type Scene = {
  settings: EditorSettings;
  frame?: FrameId;
  themeBackground: string;
  title: string;
  fontFamily: string;
  lineHeight: number;
  codeWidth: number;
  codeHeight: number;
  first: Piece[];
  transitions: Transition[];
  /** Normalized highlight lines of every step. */
  highlights: number[][];
  hold: number;
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

/** Resolves settings the way the editor does when a theme is picked (ThemePicker, App). */
const resolveSettings = (spec: Spec, themeCodeBackground: string): EditorSettings => {
  const themeConfig = THEMES[spec.theme];
  const overrides = Object.fromEntries(
    Object.entries({
      padding: spec.padding,
      background: spec.background,
      showLineNumbers: spec.showLineNumbers,
      windowControls: spec.windowControls,
    }).filter(([, value]) => value !== undefined),
  );
  return {
    ...DEFAULT_EDITOR_SETTINGS,
    ...themeConfig.defaults,
    background:
      THEME_BACKGROUND_MAP[spec.theme] ?? themeConfig.defaults?.background ?? themeCodeBackground,
    ...overrides,
    // Fixed globally in the editor, whatever the theme says.
    fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
    borderRadius: DEFAULT_BORDER_RADIUS,
  };
};

export const buildScene = async (spec: Spec, fontFamily: string): Promise<Scene> => {
  const themeConfig = THEMES[spec.theme];
  const lang = LANGUAGES[spec.language].shiki;
  // Every bundled custom theme (src/themes) carries a name.
  const themeName = resolveShikiThemeName(themeConfig)!;
  const highlighter = await createHighlighter({ themes: [themeConfig.shikiTheme], langs: [lang] });
  const themeBackground = highlighter.getTheme(themeName).bg;
  const settings = resolveSettings(spec, themeBackground);

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
  let previous = tokenize(spec.steps[0].code);
  const first = place(previous, measure);
  const transitions: Transition[] = [];
  for (const step of spec.steps.slice(1)) {
    const { from, to } = syncMagicMoveStep(previous, tokenize(step.code));
    transitions.push({ from: place(from, measure), to: place(to, measure) });
    previous = to;
  }

  const placed = [first, ...transitions.map((t) => t.to)];
  const codeWidth = Math.ceil(
    Math.max(0, ...placed.flat().map((p) => p.x + measure({ content: p.text }))),
  );
  const lines = Math.max(...spec.steps.map((step) => step.code.split("\n").length));
  const lineHeight = Math.round(settings.fontSize * FRAME_PRESENTATION.editorLineHeightMultiplier);

  return {
    settings,
    frame: themeConfig.frame,
    themeBackground,
    title: LANGUAGES[spec.language].label,
    fontFamily,
    lineHeight,
    codeWidth,
    codeHeight: lines * lineHeight,
    first,
    transitions,
    highlights: spec.steps.map((step) => normalizeHighlightLines(step.highlightLines, step.code)),
    hold: spec.hold,
  };
};
