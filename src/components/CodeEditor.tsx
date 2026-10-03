"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Highlighter } from "shiki";

import { EditorSettings } from "../types";
import {
  LANGUAGES,
  MAGIC_MOVE_DELAY_MOVE_S,
  MAGIC_MOVE_DURATION_MS,
  resolveShikiThemeName,
  THEMES,
} from "../constants";
import { getThemeBackground, getThemeForeground } from "../services/shiki";
import { firaCode } from "../fonts";
import Frame, { FRAME_PRESENTATION } from "./Frame";
import CodeTextarea from "./CodeTextarea";
import MagicMoveCode from "./MagicMoveCode";
import { measureCodeWidth } from "../utils/measureCode";
import {
  countLines,
  diffHighlightLines,
  normalizeHighlightLines,
  type HighlightMove,
} from "../utils/highlightLines";

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
  /** The frame's width, for previews that render it at a fixed size. */
  containerWidth?: number | string;
  containerHeight?: number;
  minWidth?: number | string;
  /**
   * The code window's width, with the frame grown around it by its padding and
   * chrome; `null` fits the widest line of `autoWidthCodes`. Takes the place
   * of `containerWidth`.
   */
  windowWidth?: number | null;
  /** Every step's code, so an auto width holds still from step to step. */
  autoWidthCodes?: string[];
  /** Makes the window resizable from its side handles; `null` goes back to auto width. */
  onWindowWidthChange?: (width: number | null) => void;
  /** CSS transform scale applied by an ancestor; magic-move divides its measurements by it. */
  scale?: number;
  debugHighlight?: boolean;
  /** Shared view transition name for the frame; see Frame. */
  viewTransitionName?: string;
}

// The code's inset from the window on every side.
const EDITOR_INSET = 16;

export const MIN_WINDOW_WIDTH = 320;
export const MAX_WINDOW_WIDTH = 1600;

const clampWindowWidth = (width: number) =>
  Math.round(Math.min(Math.max(width, MIN_WINDOW_WIDTH), MAX_WINDOW_WIDTH));

/** Resolves once the code font has loaded, so text can be measured in it. */
const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);
  return ready;
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
  windowWidth,
  autoWidthCodes,
  onWindowWidthChange,
  scale = 1,
  debugHighlight = false,
  viewTransitionName,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [dynamicEditorHeight, setDynamicEditorHeight] = useState(180);

  const [highlightCycle, setHighlightCycle] = useState(0);
  const [moveTargets, setMoveTargets] = useState<HighlightMove[]>([]);
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
    top: EDITOR_INSET,
    bottom: EDITOR_INSET,
    left: EDITOR_INSET,
    right: EDITOR_INSET,
  };
  const lineNumberGutterWidth = settings.showLineNumbers ? 48 : 0;

  const fontsReady = useFontsReady();
  const fitsWindow = windowWidth !== undefined;
  const autoWidthKey = (autoWidthCodes ?? [code]).join("\u0000");
  // The widest line plus the editor's own insets, never narrower than the
  // minimum. Only measured once the code font has loaded: its fallback has
  // other widths.
  const autoWindowWidth = useMemo(() => {
    if (!fitsWindow || !fontsReady) return MIN_WINDOW_WIDTH;
    const font = `${settings.fontSize}px ${firaCode.style.fontFamily}`;
    const codeWidth = measureCodeWidth(autoWidthKey.split("\u0000"), font);
    return Math.max(MIN_WINDOW_WIDTH, codeWidth + 2 * EDITOR_INSET + lineNumberGutterWidth);
  }, [autoWidthKey, fitsWindow, fontsReady, settings.fontSize, lineNumberGutterWidth]);
  const resolvedWindowWidth =
    windowWidth === undefined ? undefined : (windowWidth ?? autoWindowWidth);

  const previewPaddingY = editorPadding.top;
  const previewOuterPadding = 0;
  const borderRadius = settings.borderRadius ?? 16;

  const displayedLanguage = languageConfig.shiki;
  const displayedCode = code;
  const highlightLineNumbers = normalizeHighlightLines(highlightLines, displayedCode);

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

    const prevLines = prevHighlightLinesRef.current;
    if (arraysEqual(prevLines, highlightLineNumbers)) {
      return;
    }
    const { move, fadeIn, fadeOut } = diffHighlightLines(prevLines, highlightLineNumbers);

    setFadeInLines(fadeIn);
    setFadeOutLines(fadeOut);
    setMoveTargets(move);
    setMoveActive(false);
    setHighlightCycle((prev) => prev + 1);
    prevHighlightLinesRef.current = highlightLineNumbers;

    if (debugHighlight) {
      setDebugSnapshot({
        prev: prevLines,
        next: highlightLineNumbers,
        move,
        fadeIn,
        fadeOut,
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

  const resizeBy = (delta: number) => {
    if (resolvedWindowWidth === undefined) return;
    onWindowWidthChange?.(clampWindowWidth(resolvedWindowWidth + delta));
  };

  const startResize =
    (edge: "left" | "right") => (event: React.PointerEvent<HTMLButtonElement>) => {
      if (resolvedWindowWidth === undefined) return;
      event.preventDefault();

      const startX = event.clientX;
      const startWidth = resolvedWindowWidth;
      const direction = edge === "right" ? 1 : -1;
      setIsResizing(true);

      const onMove = (moveEvent: PointerEvent) => {
        // The frame stays centred, so each edge only travels half of any width
        // change; doubling the delta keeps the bar under the pointer. Pointer
        // travel is on screen, so it is undone by the view's scale.
        const delta = ((moveEvent.clientX - startX) * 2) / scale;
        onWindowWidthChange?.(clampWindowWidth(startWidth + direction * delta));
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

    // The rect is on screen, scaled with the view; line positions are not.
    const rect = event.currentTarget.getBoundingClientRect();
    const offsetY = (event.clientY - rect.top) / scale - editorPadding.top;
    const nextLine = Math.floor(offsetY / lineHeight) + 1;
    const lineNumber = Math.max(1, Math.min(nextLine, countLines(displayedCode)));

    onHighlightLineChange(lineNumber);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative mx-auto"
      style={
        resolvedWindowWidth === undefined
          ? {
              width: typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth,
              maxWidth: "100%",
              minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
            }
          : // The frame wraps the window, whose width is set below.
            { width: "max-content" }
      }
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
          viewTransitionName={viewTransitionName}
        >
          <div
            className={FRAME_PRESENTATION.editorShellClassName}
            style={resolvedWindowWidth === undefined ? undefined : { width: resolvedWindowWidth }}
          >
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
                  // Editing or switching steps swaps the code in place; only playback animates.
                  animate={showPreview}
                  options={{
                    duration: MAGIC_MOVE_DURATION_MS,
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

      {onWindowWidthChange && (
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
