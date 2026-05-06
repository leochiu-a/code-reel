"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  DEFAULT_EDITOR_SETTINGS,
  HIGHLIGHT_STEP_DELAY_MS,
  PREVIEW_STEPS,
  PLAY_ANIMATION_INTERVAL_MS,
} from "@/constants";
import useHighlighter from "@/hooks/useHighlighter";
import { EditorSettings } from "@/types";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
});

export function CodePreview() {
  const [previewIndex, setPreviewIndex] = useState(0);
  const highlighter = useHighlighter();

  const previewCode = PREVIEW_STEPS[previewIndex].code;
  const previewHighlightLines = PREVIEW_STEPS[previewIndex].highlightLines;
  const shouldShowPreview = Boolean(highlighter);

  const previewSettings = useMemo<EditorSettings>(
    () => ({
      ...DEFAULT_EDITOR_SETTINGS,
      language: "typescript",
      fontSize: 16,
    }),
    [],
  );

  const highlightDelayMs = useMemo(
    () =>
      previewIndex === 0 ? HIGHLIGHT_STEP_DELAY_MS : previewIndex * HIGHLIGHT_STEP_DELAY_MS,
    [previewIndex],
  );

  useEffect(() => {
    if (!shouldShowPreview) return;

    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % PREVIEW_STEPS.length);
    }, PLAY_ANIMATION_INTERVAL_MS + 300);

    return () => clearInterval(interval);
  }, [shouldShowPreview]);

  return (
    <div className="flex min-h-[420px] justify-center">
      <CodeEditor
        code={previewCode}
        settings={previewSettings}
        showPreview={shouldShowPreview}
        highlightLines={previewHighlightLines}
        highlightDelayMs={highlightDelayMs}
        highlighter={highlighter}
        containerWidth={860}
        containerHeight={420}
        resizable={false}
      />
    </div>
  );
}
