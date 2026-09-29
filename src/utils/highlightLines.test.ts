import { describe, expect, test } from "vitest";
import { diffHighlightLines, normalizeHighlightLines } from "./highlightLines";

describe("normalizeHighlightLines", () => {
  test("drops lines outside the code, duplicates, and sorts", () => {
    expect(normalizeHighlightLines([3, 0, 2, 3, 9, Number.NaN], "a\nb\nc")).toEqual([2, 3]);
  });

  test("treats empty code as one line", () => {
    expect(normalizeHighlightLines([1, 2], "")).toEqual([1]);
  });

  test("returns no lines when none are given", () => {
    expect(normalizeHighlightLines(undefined, "a")).toEqual([]);
  });
});

describe("diffHighlightLines", () => {
  test("pairs bars by order and keeps bars that stay on the same line", () => {
    expect(diffHighlightLines([2, 4], [2, 5])).toEqual({
      move: [
        { id: 0, from: 2, to: 2 },
        { id: 1, from: 4, to: 5 },
      ],
      fadeIn: [],
      fadeOut: [],
    });
  });

  test("fades in the bars the next step adds", () => {
    expect(diffHighlightLines([1], [3, 4])).toEqual({
      move: [{ id: 0, from: 1, to: 3 }],
      fadeIn: [4],
      fadeOut: [],
    });
  });

  test("fades out every bar when the next step has none", () => {
    expect(diffHighlightLines([1, 2], [])).toEqual({ move: [], fadeIn: [], fadeOut: [1, 2] });
  });
});
