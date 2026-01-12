"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Highlighter } from "shiki";
import { ShikiMagicMove } from "shiki-magic-move/react";

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
  debugHighlight?: boolean;
}

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
  debugHighlight = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [dynamicEditorHeight, setDynamicEditorHeight] = useState(180);

  const [highlightCycle, setHighlightCycle] = useState(0);
  const [moveTargets, setMoveTargets] = useState<{ id: number; from: number; to: number }[]>([]);
  const [fadeInLines, setFadeInLines] = useState<number[]>([]);
  const [fadeOutLines, setFadeOutLines] = useState<number[]>([]);
  const [moveActive, setMoveActive] = useState(false);
  const moveFrameRef = useRef<number | null>(null);
  const prevHighlightLinesRef = useRef<number[]>([]);

  const themeConfig = THEMES[settings.theme];
  const shikiTheme = resolveShikiThemeName(themeConfig);
  const languageConfig = LANGUAGES[settings.language];

  const themeBackground = useMemo(
    () => (highlighter ? getThemeBackground(highlighter, shikiTheme) : "#0b0b0b"),
    [highlighter, shikiTheme]
  );
  const themeForeground = useMemo(
    () => (highlighter ? getThemeForeground(highlighter, shikiTheme) : "#ededed"),
    [highlighter, shikiTheme]
  );

  const lineHeight = Math.round(settings.fontSize * FRAME_PRESENTATION.editorLineHeightMultiplier);
  const editorPadding = {
    top: 16,
    bottom: 16,
    left: 16,
    right: 16,
  };
  const lineNumberGutterWidth = settings.showLineNumbers ? 48 : 0;
  const editorFontFamily = FRAME_PRESENTATION.editorFontFamily;

  const previewPaddingY = editorPadding.top;
  const previewOuterPadding = 0;

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
    [containerHeight]
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
    if (!showPreview) {
      prevHighlightLinesRef.current = [];
      setMoveTargets((prev) => (prev.length === 0 ? prev : []));
      setFadeInLines((prev) => (prev.length === 0 ? prev : []));
      setFadeOutLines((prev) => (prev.length === 0 ? prev : []));
      setMoveActive((prev) => (prev ? false : prev));
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

    const moveTargets = Array.from({ length: commonLen }, (_, index) => ({
      id: index,
      from: prevLines[index],
      to: nextLines[index],
    })).filter((target) => target.from !== target.to);

    const newFadeOut = prevLines.slice(commonLen);
    const newFadeIn = nextLines.slice(commonLen);

    setFadeInLines(newFadeIn);
    setFadeOutLines(newFadeOut);
    setMoveTargets(moveTargets);
    setMoveActive(false);
    setHighlightCycle((prev) => prev + 1);
    prevHighlightLinesRef.current = highlightLineNumbers;

    if (debugHighlight) {
      setDebugSnapshot({
        prev: prevLines,
        next: highlightLineNumbers,
        move: moveTargets,
        fadeIn: newFadeIn,
        fadeOut: newFadeOut,
      });
    }
  }, [debugHighlight, highlightLineNumbers, showPreview]);

  useLayoutEffect(() => {
    if (!showPreview || moveTargets.length === 0) {
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
      className={`relative mx-auto flex items-center justify-center overflow-hidden ${
        resizable ? "resize-x" : ""
      }`}
      id="code-capture-area"
      style={{
        borderRadius: `${FRAME_PRESENTATION.editorContainerRadius}px`,
        minHeight: minCaptureHeight,
        height: containerHeight ? `${containerHeight}px` : undefined,
        width: typeof containerWidth === "number" ? `${containerWidth}px` : containerWidth,
        maxWidth: "100%",
        minWidth: typeof minWidth === "number" ? `${minWidth}px` : minWidth,
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
        borderRadius={settings.borderRadius}
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
                fontFamily: editorFontFamily,
                fontVariantLigatures: "normal",
                padding: `${editorPadding.top}px ${editorPadding.right}px ${editorPadding.bottom}px ${editorPadding.left}px`,
              }}
            >
              <ShikiMagicMove
                key={`${shikiTheme}-${displayedLanguage}`}
                highlighter={highlighter}
                lang={displayedLanguage}
                theme={shikiTheme}
                code={displayedCode}
                options={{
                  // duration: 0 means no animation; when the user updates the code snippet,
                  // no animation should be shown. Animation should only play when the play button is clicked.
                  duration: showPreview ? MAGIC_MOVE_DURATION_MS : 0,
                  stagger: 0.2,
                  lineNumbers: settings.showLineNumbers,
                  delayMove: MAGIC_MOVE_DELAY_MOVE_S,
                }}
              />
            </div>
          )}

          <CodeTextarea
            ref={textareaRefCallback}
            value={code}
            onValueChange={handleCodeChange}
            showPreview={showPreview}
            className="codesnap-code-textarea absolute inset-0 z-20 m-0 resize-none border-none bg-transparent"
            style={{
              height: editorHeight,
              padding: `${editorPadding.top}px ${editorPadding.right}px ${editorPadding.bottom}px ${
                editorPadding.left + lineNumberGutterWidth
              }px`,
              fontFamily: editorFontFamily,
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
  );
};

export default CodeEditor;
