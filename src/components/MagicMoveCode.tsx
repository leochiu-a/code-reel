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
  /** When false, steps swap in place instead of running the leave/enter/move transition. */
  animate: boolean;
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
  animate,
  options,
  className,
}) => {
  const tokenize = () => codeToScopedKeyedTokens(highlighter, code, lang, theme, lineNumbers);
  // The mount goes through the renderer's animated path: with nothing on
  // screen yet it shows the code in place, and it clears the renderer's
  // first-render flag, which in-place swaps never do. Left set, the first
  // animated step would skip its enter transition.
  const [step, setStep] = useState<{
    from?: KeyedTokensInfo;
    to: KeyedTokensInfo;
    animate: boolean;
  }>(() => ({ to: tokenize(), animate: true }));
  const [wasAnimating, setWasAnimating] = useState(animate);

  if (animate !== wasAnimating) {
    setWasAnimating(animate);
  }

  // Each step is diffed against the previous one, so it is derived from the
  // last rendered step during render rather than memoised from props alone.
  // Only a change made while animation was already on animates: the step that
  // arrives together with `animate` turning on (playback jumping to its first
  // step) swaps in place, so it costs none of the playback's time.
  if (step.to.code !== code || step.to.lineNumbers !== lineNumbers) {
    setStep({ ...syncMagicMoveStep(step.to, tokenize()), animate: animate && wasAnimating });
  }

  return (
    <ShikiMagicMoveRenderer
      animate={step.animate}
      tokens={step.to}
      previous={step.from}
      options={options}
      className={className}
    />
  );
};

export default MagicMoveCode;
