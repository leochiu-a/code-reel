"use client";

import React, { useState } from "react";
import type { BundledLanguage, Highlighter } from "shiki";
import type { KeyedTokensInfo } from "@shikijs/magic-move/core";
import { ShikiMagicMoveRenderer } from "@shikijs/magic-move/react";
import type { MagicMoveRenderOptions } from "@shikijs/magic-move/types";
import { codeToScopedKeyedTokens, syncMagicMoveStep } from "../services/magicMoveTokens";

interface MagicMoveCodeProps {
  highlighter: Highlighter;
  code: string;
  lang: BundledLanguage;
  theme: string;
  lineNumbers: boolean;
  options: MagicMoveRenderOptions;
  className?: string;
}

/**
 * `ShikiMagicMove` with scope-split tokens and our own step diffing (see
 * syncMagicMoveStep). Lang and theme are fixed per instance; the caller
 * remounts it via `key` when either changes.
 */
const MagicMoveCode: React.FC<MagicMoveCodeProps> = ({
  highlighter,
  code,
  lang,
  theme,
  lineNumbers,
  options,
  className,
}) => {
  const tokenize = () => codeToScopedKeyedTokens(highlighter, code, lang, theme, lineNumbers);
  const [step, setStep] = useState<{
    from?: KeyedTokensInfo;
    to: KeyedTokensInfo;
  }>(() => ({ to: tokenize() }));

  // Each step is diffed against the previous one, so it is derived from the
  // last rendered step during render rather than memoised from props alone.
  if (step.to.code !== code || step.to.lineNumbers !== lineNumbers) {
    setStep(syncMagicMoveStep(step.to, tokenize()));
  }

  return (
    <ShikiMagicMoveRenderer
      tokens={step.to}
      previous={step.from}
      options={options}
      className={className}
    />
  );
};

export default MagicMoveCode;
