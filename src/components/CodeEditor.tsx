"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Highlighter } from "shiki";
import { Fira_Code } from "next/font/google";

import { EditorSettings } from "../types";
import {
  LANGUAGES,
  MAGIC_MOVE_DELAY_MOVE_S,
  MAGIC_MOVE_DURATION_MS,
  resolveShikiThemeName,
  THEMES,
} from "../constants";
import { getThemeBackground, getThemeForeground } from "../services/shiki";
import Frame, { FRAME_PRESENTATION } from "./Frame";
import CodeTextarea from "./CodeTextarea";
import MagicMoveCode from "./MagicMoveCode";

const firaCode = Fira_Code();

/**
 * A bar with `from === to` stays put. Preview needs those: the steady-state
 * bars only render while editing, so a line with no move / fade entry has
 * nothing drawn for it at all.
 */
type HighlightMoveTarget = { id: number; from: number; to: number };

interface CodeEditorProps {
  code: string;
  onCodeChange?: (code: string) => void;
  settings: EditorSettings;
  /** When true, render the preview code for playback/export and disable editing. */
  showPreview?: boolean;
  highlightLines?: number[];
  highlightDelayMs?: number;
  onHighlightLineChange?: (line: number) => void;
  highlighter?: Highlighter | null;
  minCaptureHeight?: number;
  containerWidth?: number | string;
  containerHeight?: number;
  minWidth?: number | string;
  resizable?: boolean;
  /** CSS transform scale applied by an ancestor; magic-move divides its measurements by it. */
  scale?: number;
  debugHighlight?: boolean;
}

// The capture frame's closest ancestors shrink-wrap to their content, so their
// width just mirrors the frame's own. Measure the scroll container instead and
// subtract the padding between it and the frame, leaving room for the handles.
const RESIZE_HANDLE_GUTTER = 64;

const getAvailableWidth = (wrapper: HTMLElement) => {
  const container = wrapper.closest("main");
  if (!container) return Number.POSITIVE_INFINITY;

  let inset = 0;
  for (let node = wrapper.parentElement; node && node !== container; node = node.parentElement) {
    const style = getComputedStyle(node);
    inset +=
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.paddingRight) +
      Number.parseFloat(style.borderLeftWidth) +
      Number.parseFloat(style.borderRightWidth);
  }
  const containerStyle = getComputedStyle(container);
  inset +=
    Number.parseFloat(containerStyle.paddingLeft) + Number.parseFloat(containerStyle.paddingRight);

  return Math.max(0, container.clientWidth - inset - RESIZE_HANDLE_GUTTER);
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  settings,
  showPreview = false,
  highlightLines,
  highlightDelayMs = 0,
  onHighlightLineChange,
  highlighter,
  minCaptureHeight,
  containerWidth = 860,
  containerHeight,
  minWidth = "320px",
  resizable = true,
  scale = 1,
  debugHighlight = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [resizedWidth, setResizedWidth] = useState<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [dynamicEditorHeight, setDynamicEditorHeight] = useState(180);

  const [highlightCycle, setHighlightCycle] = useState(0);
  const [moveTargets, setMoveTargets] = useState<HighlightMoveTarget[]>([]);
  const [fadeInLines, setFadeInLines] = useState<number[]>([]);
  const [fadeOutLines, setFadeOutLines] = useState<number[]>([]);
  const [moveActive, setMoveActive] = useState(false);
  const moveFrameRef = useRef<number | null>(null);
  const prevHighlightLinesRef = useRef<number[]>([]);
  const wasPreviewingRef = useRef(false);

  const themeConfig = THEMES[settings.theme];
  const shikiTheme = resolveShikiThemeName(themeConfig);
  const languageConfig = LANGUAGES[settings.language];

  const themeBackground = useMemo(
    () => (highlighter ? getThemeBackground(highlighter, shikiTheme) : "#0b0b0b"),
    [highlighter, shikiTheme],
  );
  const themeForeground = useMemo(
    () => (highlighter ? getThemeForeground(highlighter, shikiTheme) : "#ededed"),
    [highlighter, shikiTheme],
  );

  const lineHeight = Math.round(settings.fontSize * FRAME_PRESENTATION.editorLineHeightMultiplier);
  const editorPadding = {
    top: 16,
    bottom: 16,
    left: 16,
    right: 16,
  };
  const lineNumberGutterWidth = settings.showLineNumbers ? 48 : 0;

  const previewPaddingY = editorPadding.top;
  const previewOuterPadding = 0;
  const borderRadius = settings.borderRadius ?? 16;

  const displayedLanguage = languageConfig.shiki;
  const displayedCode = code;
  const highlightLineCount =
    displayedCode.length > 0 ? displayedCode.split(/\r\n|\r|\n/).length : 1;

  const rawHighlightLineNumbers = (highlightLines ?? [])
    .filter((line) => Number.isFinite(line) && line > 0 && line <= highlightLineCount)
    .filter((line, index, list) => list.indexOf(line) === index)
    .sort((a, b) => a - b);

  const highlightLineNumbers = rawHighlightLineNumbers;

  const [debugSnapshot, setDebugSnapshot] = useState<{
    prev: number[];
    next: number[];
    move: { from: number; to: number }[];
    fadeIn: number[];
    fadeOut: number[];
  } | null>(null);

  const computedHighlightMoveDurationMs = MAGIC_MOVE_DURATION_MS;
  const arraysEqual = (a: number[], b: number[]) =>
    a.length === b.length && a.every((value, index) => value === b[index]);

  /**
   * Calculate height from containerHeight (no DOM needed)
   */
  const computedEditorHeight = useMemo(() => {
    if (containerHeight) {
      const chromeHeight = settings.windowControls ? 40 : 0;
      const padding = settings.padding * 2;
      return Math.max(120, containerHeight - chromeHeight - padding);
    }
    return null; // Will use dynamic height from DOM measurement
  }, [containerHeight, settings.padding, settings.windowControls]);

  const editorHeight = computedEditorHeight ?? dynamicEditorHeight;

  /**
   * Use ref callback to measure DOM height when containerHeight is not provided
   */
  const textareaRefCallback = useCallback(
    (element: HTMLTextAreaElement | null) => {
      textareaRef.current = element;
      if (!element || containerHeight) return;

      // Measure and update height
      const height = Math.max(24, element.scrollHeight);
      setDynamicEditorHeight(height);
    },
    [containerHeight],
  );

  // Update dynamic height when code or settings change (only if not using containerHeight)
  useLayoutEffect(() => {
    if (containerHeight || !textareaRef.current) return;

    // Use requestAnimationFrame to defer state update and avoid cascading renders
    const rafId = requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const height = Math.max(24, textareaRef.current.scrollHeight);
      setDynamicEditorHeight(height);
    });

    return () => cancelAnimationFrame(rafId);
  }, [code, settings.fontSize, settings.showLineNumbers, containerHeight]);

  useEffect(() => {
    const enteringPreview = showPreview && !wasPreviewingRef.current;
    wasPreviewingRef.current = showPreview;

    if (!showPreview) {
      prevHighlightLinesRef.current = [];
      // The highlight animation is a state machine driven by prop changes:
      // each transition is computed against the previous step, so it cannot be
      // derived during render.
      // oxlint-disable-next-line react/set-state-in-effect
      setMoveTargets((prev) => (prev.length === 0 ? prev : []));
      setFadeInLines((prev) => (prev.length === 0 ? prev : []));
      setFadeOutLines((prev) => (prev.length === 0 ? prev : []));
      setMoveActive((prev) => (prev ? false : prev));
      return;
    }

    if (enteringPreview) {
      // Playback positions the reel at its first step; it does not animate into
      // it. The editor may have been sitting on any step, so treat whatever the
      // first step highlights as already in place: bars that carry over must not
      // fade back in from zero, and bars on other lines must not slide in from
      // the step that happened to be open.
      prevHighlightLinesRef.current = highlightLineNumbers;
      setMoveTargets(
        highlightLineNumbers.map((line, index) => ({ id: index, from: line, to: line })),
      );
      setFadeInLines([]);
      setFadeOutLines([]);
      setMoveActive(false);
      return;
    }

    if (highlightLineNumbers.length === 0) {
      if (prevHighlightLinesRef.current.length > 0) {
        setMoveTargets((prev) => (prev.length === 0 ? prev : []));
        setFadeInLines((prev) => (prev.length === 0 ? prev : []));
        setFadeOutLines(prevHighlightLinesRef.current);
        setMoveActive(false);
        setHighlightCycle((prev) => prev + 1);
      }
      prevHighlightLinesRef.current = [];
      return;
    }

    const prevLines = prevHighlightLinesRef.current;
    if (arraysEqual(prevLines, highlightLineNumbers)) {
      return;
    }
    const nextLines = highlightLineNumbers;
    const prevLen = prevLines.length;
    const nextLen = nextLines.length;
    const commonLen = Math.min(prevLen, nextLen);

    // from === to kept deliberately: dropping those left a highlight that does
    // not change line between two steps with no element at all, so it blinked
    // out for the whole of the second step.
    const nextMoveTargets: HighlightMoveTarget[] = Array.from(
      { length: commonLen },
      (_, index) => ({ id: index, from: prevLines[index], to: nextLines[index] }),
    );

    const newFadeOut = prevLines.slice(commonLen);
    const newFadeIn = nextLines.slice(commonLen);

    setFadeInLines(newFadeIn);
    setFadeOutLines(newFadeOut);
    setMoveTargets(nextMoveTargets);
    setMoveActive(false);
    setHighlightCycle((prev) => prev + 1);
    prevHighlightLinesRef.current = highlightLineNumbers;

    if (debugHighlight) {
      setDebugSnapshot({
        prev: prevLines,
        next: highlightLineNumbers,
        move: nextMoveTargets,
        fadeIn: newFadeIn,
        fadeOut: newFadeOut,
      });
    }
  }, [debugHighlight, highlightLineNumbers, showPreview]);

  useLayoutEffect(() => {
    if (!showPreview || moveTargets.length === 0) {
      // Bars must paint at their start position before the next frame flips
      // them to active; that ordering is the animation.
      // oxlint-disable-next-line react/set-state-in-effect
      setMoveActive(false);
      return;
    }

    setMoveActive(false);
    if (moveFrameRef.current) {
      cancelAnimationFrame(moveFrameRef.current);
    }
    moveFrameRef.current = requestAnimationFrame(() => {
      setMoveActive(true);
    });

    return () => {
      if (moveFrameRef.current) {
        cancelAnimationFrame(moveFrameRef.current);
      }
    };
  }, [moveTargets, showPreview]);

  const resolvedWidth = resizedWidth ?? containerWidth;
  const minResizeWidth = typeof minWidth === "number" ? minWidth : Number.parseFloat(minWidth) || 0;

  const resizeBy = useCallback(
    (delta: number) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const max = getAvailableWidth(wrapper);
      setResizedWidth((previous) => {
        const current = previous ?? wrapper.getBoundingClientRect().width;
        return Math.round(Math.min(Math.max(current + delta, minResizeWidth), max));
      });
    },
    [minResizeWidth],
  );

  const startResize =
    (edge: "left" | "right") => (event: React.PointerEvent<HTMLButtonElement>) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      event.preventDefault();

      const startX = event.clientX;
      const startWidth = wrapper.getBoundingClientRect().width;
      const max = getAvailableWidth(wrapper);
      const direction = edge === "right" ? 1 : -1;
      setIsResizing(true);

      const onMove = (moveEvent: PointerEvent) => {
        // The frame stays centred, so each edge only travels half of any width
        // change. Doubling the delta keeps the bar under the pointer.
        const next = startWidth + direction * (moveEvent.clientX - startX) * 2;
        setResizedWidth(Math.round(Math.min(Math.max(next, minResizeWidth), max)));
      };
      const onEnd = () => {
        setIsResizing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    };

  const handleResizeKeyDown = (edge: "left" | "right") => (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 64 : 16;
    const direction = edge === "right" ? 1 : -1;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      resizeBy(direction * step * 2);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      resizeBy(-direction * step * 2);
    }
  };

  const handleCodeChange = (nextCode: string) => {
    if (onCodeChange) {
      onCodeChange(nextCode);
    }
    // Height will be updated by useLayoutEffect or ref callback
  };

  const handleLineNumberMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (showPreview) return;
    if (!onHighlightLineChange) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = event.clientY - rect.top - editorPadding.top;
    const nextLine = Math.floor(offsetY / lineHeight) + 1;
    const lineNumber = Math.max(1, Math.min(nextLine, highlightLineCount));

    onHighlightLineChange(lineNumber);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto"
      style={{
        width: typeof resolvedWidth === "number" ? `${resolvedWidth}px` : resolvedWidth,
        maxWidth: "100%",
        minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
      }}
    >
      <div
        className="relative flex w-full items-center justify-center overflow-hidden"
        id="code-capture-area"
        style={{
          borderRadius: `${FRAME_PRESENTATION.editorContainerRadius}px`,
          minHeight: minCaptureHeight,
          height: containerHeight ? `${containerHeight}px` : undefined,
        }}
      >
        {debugHighlight && debugSnapshot && (
          <div className="pointer-events-none absolute top-3 left-3 z-50 rounded-xl bg-black/70 px-3 py-2 text-[11px] text-white/80">
            <div>prev: {debugSnapshot.prev.join(",") || "-"}</div>
            <div>next: {debugSnapshot.next.join(",") || "-"}</div>
            <div>
              move:{" "}
              {debugSnapshot.move.length
                ? debugSnapshot.move.map((item) => `${item.from}->${item.to}`).join(", ")
                : "-"}
            </div>
            <div>fadeIn: {debugSnapshot.fadeIn.join(",") || "-"}</div>
            <div>fadeOut: {debugSnapshot.fadeOut.join(",") || "-"}</div>
          </div>
        )}
        <Frame
          frame={themeConfig.frame}
          borderRadius={borderRadius}
          padding={settings.padding}
          background={settings.background}
          themeBackground={themeBackground}
          fontSize={settings.fontSize}
          borderShadow={settings.borderShadow}
          windowControls={settings.windowControls}
          windowTitle={languageConfig.label}
        >
          <div className={FRAME_PRESENTATION.editorShellClassName}>
            {!showPreview && settings.showLineNumbers && (
              <div
                className="absolute top-0 bottom-0 left-0 z-30 w-11 cursor-pointer"
                onMouseDown={handleLineNumberMouseDown}
              />
            )}
            {!showPreview &&
              highlightLineNumbers.map((line) => (
                <div
                  key={`highlight-static-${line}`}
                  className="pointer-events-none absolute right-0 left-0 z-20"
                  style={{
                    top: `${editorPadding.top + (line - 1) * lineHeight}px`,
                    height: `${lineHeight}px`,
                    backgroundColor: "rgba(148, 163, 184, 0.18)",
                  }}
                />
              ))}
            {showPreview &&
              moveTargets.map((target) => (
                <div
                  key={`highlight-move-${target.id}-${highlightCycle}`}
                  className="pointer-events-none absolute right-0 left-0 z-20"
                  style={{
                    top: `${previewOuterPadding + previewPaddingY}px`,
                    transform: `translate3d(0, ${
                      ((moveActive ? target.to : target.from) - 1) * lineHeight
                    }px, 0)`,
                    height: `${lineHeight}px`,
                    backgroundColor: debugHighlight
                      ? "rgba(255, 90, 90, 0.35)"
                      : "rgba(148, 163, 184, 0.18)",
                    outline: debugHighlight ? "1px dashed rgba(255, 90, 90, 0.7)" : undefined,
                    transitionProperty: "transform",
                    transitionDuration: `${computedHighlightMoveDurationMs}ms`,
                    transitionTimingFunction: "ease",
                    transitionDelay: `${highlightDelayMs}ms`,
                    willChange: "transform",
                  }}
                />
              ))}
            {showPreview &&
              fadeInLines.map((line) => (
                <div
                  key={`highlight-fade-in-${line}-${highlightCycle}`}
                  className="pointer-events-none absolute right-0 left-0 z-20"
                  style={{
                    top: `${previewOuterPadding + previewPaddingY + (line - 1) * lineHeight}px`,
                    height: `${lineHeight}px`,
                    backgroundColor: "rgba(148, 163, 184, 0.18)",
                    animationName: "codesnap-highlight-fade",
                    animationDuration: "400ms",
                    animationTimingFunction: "ease",
                    animationDelay: `${highlightDelayMs}ms`,
                    animationFillMode: "both",
                  }}
                />
              ))}
            {showPreview &&
              fadeOutLines.map((line) => (
                <div
                  key={`highlight-fade-out-${line}-${highlightCycle}`}
                  className="pointer-events-none absolute right-0 left-0 z-20"
                  style={{
                    top: `${previewOuterPadding + previewPaddingY + (line - 1) * lineHeight}px`,
                    height: `${lineHeight}px`,
                    backgroundColor: "rgba(148, 163, 184, 0.18)",
                    animationName: "codesnap-highlight-fade-out",
                    animationDuration: "400ms",
                    animationTimingFunction: "ease",
                    animationDelay: `${highlightDelayMs}ms`,
                    animationFillMode: "both",
                  }}
                />
              ))}

            {highlighter && (
              <div
                className="relative z-10"
                style={{
                  fontSize: settings.fontSize,
                  lineHeight: `${lineHeight}px`,
                  padding: `${editorPadding.top}px ${editorPadding.right}px ${editorPadding.bottom}px ${editorPadding.left}px`,
                }}
              >
                <MagicMoveCode
                  className={firaCode.className}
                  key={`${shikiTheme}-${displayedLanguage}`}
                  highlighter={highlighter}
                  lang={displayedLanguage}
                  theme={shikiTheme}
                  code={displayedCode}
                  lineNumbers={settings.showLineNumbers}
                  options={{
                    // duration: 0 means no animation; when the user updates the code snippet,
                    // no animation should be shown. Animation should only play when the play button is clicked.
                    duration: showPreview ? MAGIC_MOVE_DURATION_MS : 0,
                    stagger: 0.2,
                    delayMove: MAGIC_MOVE_DELAY_MOVE_S,
                    globalScale: scale,
                  }}
                />
              </div>
            )}

            <CodeTextarea
              ref={textareaRefCallback}
              value={code}
              onValueChange={handleCodeChange}
              showPreview={showPreview}
              className={`codesnap-code-textarea absolute inset-0 z-20 m-0 resize-none border-none bg-transparent ${firaCode.className}`}
              style={{
                height: editorHeight,
                padding: `${editorPadding.top}px ${editorPadding.right}px ${editorPadding.bottom}px ${
                  editorPadding.left + lineNumberGutterWidth
                }px`,
                fontSize: settings.fontSize,
                lineHeight: `${lineHeight}px`,
                color: "transparent",
                WebkitTextFillColor: "transparent",
                caretColor: themeForeground,
                outline: "none",
                pointerEvents: showPreview ? "none" : "auto",
              }}
            />
          </div>
        </Frame>
      </div>

      {resizable && (
        <>
          {(["left", "right"] as const).map((edge) => (
            <button
              key={edge}
              type="button"
              aria-label={`Resize capture area from the ${edge}`}
              onPointerDown={startResize(edge)}
              onKeyDown={handleResizeKeyDown(edge)}
              className={`group absolute top-1/2 z-30 flex h-20 w-6 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
                edge === "right" ? "-right-7" : "-left-7"
              }`}
            >
              <span
                className={`h-14 w-1.5 rounded-full transition-colors ${
                  isResizing ? "bg-emerald-400" : "bg-white/25 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </>
      )}
    </div>
  );
};

export default CodeEditor;
