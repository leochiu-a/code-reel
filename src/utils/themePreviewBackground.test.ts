import { describe, expect, test } from "vitest";
import { computeThemePreviewBackground } from "./themePreviewBackground";

describe("computeThemePreviewBackground", () => {
  test("uses mappedBackground when available", () => {
    expect(computeThemePreviewBackground("gradient-pink", undefined, "#272822")).toBe("gradient-pink");
  });

  test("uses themeDefaultBackground when no mappedBackground", () => {
    expect(computeThemePreviewBackground(undefined, "#1a1a2e", "#272822")).toBe("#1a1a2e");
  });

  test("falls back to codeBackground when neither mapped nor default exist", () => {
    expect(computeThemePreviewBackground(undefined, undefined, "#272822")).toBe("#272822");
  });
});
