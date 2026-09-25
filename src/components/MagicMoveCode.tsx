"use client";

import React, { useMemo, useState } from "react";
import type { BundledLanguage, Highlighter } from "shiki";
import { createMagicMoveMachine } from "@shikijs/magic-move/core";
import { ShikiMagicMoveRenderer } from "@shikijs/magic-move/react";
import type { MagicMoveDifferOptions, MagicMoveRenderOptions } from "@shikijs/magic-move/types";
import { codeToScopedKeyedTokens, MAGIC_MOVE_DIFF_OPTIONS } from "../services/magicMoveTokens";

interface MagicMoveCodeProps {
  highlighter: Highlighter;
  code: string;
  lang: BundledLanguage;
  theme: string;
  options: MagicMoveRenderOptions & MagicMoveDifferOptions;
  className?: string;
}

/**
 * `ShikiMagicMove` with scope-split tokens and MAGIC_MOVE_DIFF_OPTIONS.
 * Lang and theme are fixed per instance; the caller remounts it via `key`
 * when either changes.
 */
const MagicMoveCode: React.FC<MagicMoveCodeProps> = ({
  highlighter,
  code,
  lang,
  theme,
  options,
  className,
}) => {
  const [machine] = useState(() =>
    createMagicMoveMachine((nextCode, lineNumbers) =>
      codeToScopedKeyedTokens(highlighter, nextCode, lang, theme, lineNumbers),
    ),
  );

  const lineNumbers = options.lineNumbers ?? false;
  const result = useMemo(() => {
    if (code === machine.current.code && lineNumbers === machine.current.lineNumbers) {
      return machine;
    }
    return machine.commit(code, { ...options, ...MAGIC_MOVE_DIFF_OPTIONS });
  }, [machine, code, lineNumbers, options]);

  return (
    <ShikiMagicMoveRenderer
      tokens={result.current}
      previous={result.previous}
      options={options}
      className={className}
    />
  );
};

export default MagicMoveCode;
