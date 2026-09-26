"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useResizeObserver } from "usehooks-ts";
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

// The preview renders at a fixed size and scales down as a whole on narrow
// screens, so the font, line height and padding keep their proportions.
const PREVIEW_WIDTH = 860;
const PREVIEW_HEIGHT = 420;

export function CodePreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width = PREVIEW_WIDTH } = useResizeObserver({ ref: containerRef });
  const scale = Math.min(1, width / PREVIEW_WIDTH);
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
    () => (previewIndex === 0 ? HIGHLIGHT_STEP_DELAY_MS : previewIndex * HIGHLIGHT_STEP_DELAY_MS),
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
    // aspect-ratio reserves the scaled height in CSS, before hydration, so the
    // page does not shift when the scale is measured.
    <div
      ref={containerRef}
      className="flex w-full justify-center"
      style={{ aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}`, maxHeight: PREVIEW_HEIGHT }}
    >
      <div
        className="shrink-0 origin-top"
        style={{ width: PREVIEW_WIDTH, transform: scale < 1 ? `scale(${scale})` : undefined }}
      >
        <CodeEditor
          code={previewCode}
          settings={previewSettings}
          showPreview={shouldShowPreview}
          highlightLines={previewHighlightLines}
          highlightDelayMs={highlightDelayMs}
          highlighter={highlighter}
          containerWidth={PREVIEW_WIDTH}
          containerHeight={PREVIEW_HEIGHT}
          scale={scale}
        />
      </div>
    </div>
  );
}
