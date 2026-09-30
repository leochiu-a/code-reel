import { createHighlighter, type Highlighter } from "shiki";
import { LANGUAGES, THEMES } from "../constants";

const SHIKI_LANGUAGES = Array.from(
  new Set(Object.values(LANGUAGES).map((language) => language.shiki)),
);

let highlighterPromise: Promise<Highlighter> | null = null;
let loadedHighlighter: Highlighter | null = null;

export const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: Object.values(THEMES).map((theme) => theme.shikiTheme),
      langs: [...SHIKI_LANGUAGES],
    }).then((highlighter) => {
      loadedHighlighter = highlighter;
      return highlighter;
    });
  }

  return highlighterPromise;
};

/** The highlighter once it has loaded, for renders that must not wait a tick for it. */
export const getLoadedHighlighter = () => loadedHighlighter;

export const getThemeBackground = (highlighter: Highlighter, themeName: string) => {
  const theme = highlighter.getTheme(themeName);
  return theme.bg || "#0b0b0b";
};

export const getThemeForeground = (highlighter: Highlighter, themeName: string) => {
  const theme = highlighter.getTheme(themeName);
  return theme.fg || "#ededed";
};
