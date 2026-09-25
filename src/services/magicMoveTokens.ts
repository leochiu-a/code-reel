import { toKeyedTokens, type KeyedTokensInfo } from "@shikijs/magic-move/core";
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
export const MAGIC_MOVE_DIFF_OPTIONS: MagicMoveDifferOptions = {
  splitTokens: true,
  diffCleanup: diffCleanupSemantic,
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
