import { createHighlighter } from "shiki";
import { describe, expect, test } from "vitest";
import VERCEL_SHIKI_THEME from "../themes/vercel";
import { codeToScopedKeyedTokens, syncMagicMoveStep } from "./magicMoveTokens";

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

    const synced = syncMagicMoveStep(from, to);
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

  test("keeps keys unique within and across consecutive edits", async () => {
    const highlighter = await createHighlighter({ themes: [VERCEL_SHIKI_THEME], langs: ["css"] });
    // Deterministic pseudo-random edits, like typing and deleting in place.
    let seed = 7;
    const random = (n: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      return seed % n;
    };

    let code = BEFORE;
    let previous = codeToScopedKeyedTokens(highlighter, code, "css", "vercel", true);
    let previousKeys = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const at = random(code.length + 1);
      code = random(2)
        ? code.slice(0, at) + "05 x-;{".charAt(random(7)) + code.slice(at)
        : code.slice(0, Math.max(0, at - 1)) + code.slice(at);

      const next = codeToScopedKeyedTokens(highlighter, code, "css", "vercel", true);
      const { from, to } = syncMagicMoveStep(previous, next);
      for (const tokens of [from.tokens, to.tokens]) {
        const keys = tokens.map((token) => token.key);
        expect(new Set(keys).size).toBe(keys.length);
      }
      // The renderer keeps elements by key across steps, so a step must not
      // reuse any key the last one rendered.
      expect(from.tokens.filter((token) => previousKeys.has(token.key))).toEqual([]);
      previousKeys = new Set([...from.tokens, ...to.tokens].map((token) => token.key));
      previous = to;
    }
  });
});
