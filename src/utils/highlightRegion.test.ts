import { describe, expect, test } from "vitest";
import { computeHighlightRect, HIGHLIGHT_PADDING_PX, type OnboardingRect } from "./highlightRegion";

describe("computeHighlightRect", () => {
  test("returns null when rect is null", () => {
    const result: OnboardingRect | null = computeHighlightRect(null, 14);
    expect(result).toBe(null);
  });

  test("applies padding around the rect", () => {
    const rect = { top: 100, left: 200, width: 400, height: 300 };
    const result = computeHighlightRect(rect, 14);
    expect(result).toEqual({ top: 86, left: 186, width: 428, height: 328 });
  });

  test("clamps top/left to minimum of 12 (avoid off-screen)", () => {
    const rect = { top: 5, left: 5, width: 400, height: 300 };
    const result = computeHighlightRect(rect, 14);
    expect(result).toEqual({ top: 12, left: 12, width: 428, height: 328 });
  });

  test("HIGHLIGHT_PADDING_PX is exported and equals 14", () => {
    expect(HIGHLIGHT_PADDING_PX).toBe(14);
  });
});
