import { syncTokenKeys, toKeyedTokens, type KeyedTokensInfo } from "@shikijs/magic-move/core";
import type { MagicMoveDifferOptions } from "@shikijs/magic-move/types";
import { diffCleanupSemantic } from "diff-match-patch-es";
import type { BundledLanguage, Highlighter, ThemedToken } from "shiki";

/**
 * Magic Move pairs tokens inside each unchanged diff range with only one token
 * of lookahead, so a range that starts mid-token on one side misaligns and
 * everything after it fades. Splitting tokens at the range edges keeps both
 * sides aligned; the semantic cleanup stops that split from matching stray
 * characters, such as the `e` and `r` shared by `Before` and `After`.
 */
const DIFF_OPTIONS: MagicMoveDifferOptions = {
  splitTokens: true,
  diffCleanup: diffCleanupSemantic,
};

let generation = 0;

/**
 * Diff one step against the next. Split pieces are keyed `${key}-${n}`, so
 * splitting a piece left over from an earlier step can mint a key another
 * piece already holds, and the renderer then reuses one element for both.
 * Re-keying the previous step first keeps every key unique.
 *
 * The new keys must also never have been used before: the renderer keeps its
 * elements by key across steps without checking their tag, so reusing a key
 * can pour a text token into a leftover `<br>` (or a newline into a `<span>`)
 * and scramble the lines. A fresh generation per step rules that out. The
 * renderer rebuilds its DOM from `from` before animating, so the new keys cost
 * nothing visible.
 */
export const syncMagicMoveStep = (previous: KeyedTokensInfo, next: KeyedTokensInfo) => {
  const prefix = `step${++generation}`;
  return syncTokenKeys(
    {
      ...previous,
      tokens: previous.tokens.map((token, index) => ({ ...token, key: `${prefix}-${index}` })),
    },
    next,
    DIFF_OPTIONS,
  );
};

/**
 * Magic Move keeps a token in place only when its text matches across steps.
 * TextMate merges adjacent scopes that resolve to the same colour, so with a
 * sparse theme `@media (` and `@media (300px <=` become different tokens and
 * `@media` fades out. Splitting on scope boundaries instead keeps the tokens
 * aligned with the grammar, independent of how many colours the theme has.
 */
export const codeToScopedKeyedTokens = (
  highlighter: Highlighter,
  code: string,
  lang: BundledLanguage,
  theme: string,
  lineNumbers = false,
): KeyedTokensInfo => {
  const result = highlighter.codeToTokens(code, {
    lang,
    theme,
    includeExplanation: "scopeName",
  });

  const tokens = result.tokens.map((line) =>
    line.flatMap(({ explanation, ...token }) => {
      let offset = token.offset;
      return (explanation ?? [{ content: token.content }]).map(({ content }): ThemedToken => {
        const part = { ...token, content, offset };
        offset += content.length;
        return part;
      });
    }),
  );

  return {
    // Lang and theme join the hash, as in Magic Move's own codeToKeyedTokens,
    // because they change the tokenization.
    ...toKeyedTokens(code, tokens, JSON.stringify([lang, theme]), lineNumbers),
    bg: result.bg,
    fg: result.fg,
    rootStyle: result.rootStyle,
    themeName: result.themeName,
    lang,
  };
};
