import { createHighlighter, type Highlighter } from 'shiki';
import { THEMES } from '../constants';

const SHIKI_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'rust',
  'go',
  'cpp'
] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

export const getHighlighter = () => {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: Object.values(THEMES).map((theme) => theme.shikiTheme),
      langs: [...SHIKI_LANGUAGES]
    });
  }

  return highlighterPromise;
};

export const getThemeBackground = (highlighter: Highlighter, themeName: string) => {
  const theme = highlighter.getTheme(themeName);
  return theme.bg || '#0b0b0b';
};
