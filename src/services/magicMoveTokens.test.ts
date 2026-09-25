import { syncTokenKeys } from "@shikijs/magic-move/core";
import { createHighlighter } from "shiki";
import { describe, expect, test } from "vitest";
import VERCEL_SHIKI_THEME from "../themes/vercel";
import { codeToScopedKeyedTokens, MAGIC_MOVE_DIFF_OPTIONS } from "./magicMoveTokens";

const BEFORE = `/* Before */
.section {
  @media (min-width: 300px) and (max-width: 500px) {
    /* styles for the card */
  }
}`;

const AFTER = `/* After */
.section {
  @media (300px <= width <= 500px) {
    /* styles for the card */
  }
}`;

describe("codeToScopedKeyedTokens", () => {
  test("fades only the changed tokens with a sparse theme", async () => {
    const highlighter = await createHighlighter({ themes: [VERCEL_SHIKI_THEME], langs: ["css"] });
    const from = codeToScopedKeyedTokens(highlighter, BEFORE, "css", "vercel");
    const to = codeToScopedKeyedTokens(highlighter, AFTER, "css", "vercel");

    const synced = syncTokenKeys(from, to, MAGIC_MOVE_DIFF_OPTIONS);
    const fromKeys = new Set(synced.from.tokens.map((token) => token.key));
    const faded = synced.to.tokens
      .filter((token) => !fromKeys.has(token.key) && token.content.trim())
      .map((token) => token.content);

    // Only the text that actually changed enters; `@media`, the untouched
    // comment and the closing braces all stay in place.
    expect(faded).toEqual(["After", "px", "<=", "<=", " 500"]);
  });

  test("preserves the source text and colours", async () => {
    const highlighter = await createHighlighter({ themes: [VERCEL_SHIKI_THEME], langs: ["css"] });
    const info = codeToScopedKeyedTokens(highlighter, AFTER, "css", "vercel");

    expect(info.tokens.map((token) => token.content).join("")).toBe(`${AFTER}\n`);
    expect(info.tokens.find((token) => token.content === "width")?.color).toBe("#47A8FF");
  });
});
