/**
 * A bar with `from === to` stays put. Preview needs those: the steady-state
 * bars only render while editing, so a line with no move / fade entry has
 * nothing drawn for it at all.
 */
export type HighlightMove = { id: number; from: number; to: number };

export type HighlightTransition = {
  move: HighlightMove[];
  fadeIn: number[];
  fadeOut: number[];
};

export const countLines = (code: string) => (code.length > 0 ? code.split(/\r\n|\r|\n/).length : 1);

/** Drops lines outside the code, removes duplicates and sorts, as the editor draws them. */
export const normalizeHighlightLines = (lines: number[] | undefined, code: string) => {
  const lineCount = countLines(code);
  return (lines ?? [])
    .filter((line) => Number.isFinite(line) && line > 0 && line <= lineCount)
    .filter((line, index, list) => list.indexOf(line) === index)
    .sort((a, b) => a - b);
};

/**
 * Bars pair up by order between two steps: the nth bar slides from the nth
 * previous line to the nth next line, and the leftovers fade out or in.
 */
export const diffHighlightLines = (prev: number[], next: number[]): HighlightTransition => {
  const commonLen = Math.min(prev.length, next.length);
  return {
    // from === to kept deliberately: dropping those left a highlight that does
    // not change line between two steps with no element at all, so it blinked
    // out for the whole of the second step.
    move: Array.from({ length: commonLen }, (_, index) => ({
      id: index,
      from: prev[index],
      to: next[index],
    })),
    fadeIn: next.slice(commonLen),
    fadeOut: prev.slice(commonLen),
  };
};
