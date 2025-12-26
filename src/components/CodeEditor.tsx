"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import type { HighlighterCore } from "shiki/core";
import { ShikiMagicMove } from "shiki-magic-move/react";
import { shikiToMonaco } from "@shikijs/monaco";

import { EditorSettings } from "../types";
import { LANGUAGES, MAGIC_MOVE_DELAY_MOVE_S, MAGIC_MOVE_DURATION_MS, THEMES } from "../constants";
import { getHighlighter, getThemeBackground } from "../services/shiki";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  settings: EditorSettings;
  showPreview?: boolean;
  highlightLines?: number[];
  highlightDelayMs?: number;
  onHighlightLineChange?: (line: number) => void;
  preview?: {
    highlighter: HighlighterCore;
    code: string;
    language: string;
    theme: string;
  };
  minCaptureHeight?: number;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  settings,
  showPreview = false,
  highlightLines,
  highlightDelayMs = 0,
  onHighlightLineChange,
  preview,
  minCaptureHeight,
}) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);

  const highlighterRef = useRef<Awaited<ReturnType<typeof getHighlighter>> | null>(null);

  const sizeListenerRef = useRef<Monaco.IDisposable | null>(null);
  const highlightDecorationsRef = useRef<Monaco.editor.IEditorDecorationsCollection | null>(null);
  const mouseListenerRef = useRef<Monaco.IDisposable | null>(null);

  const highlightLineChangeRef = useRef<((line: number) => void) | null>(null);
  const prevHighlightLinesRef = useRef<number[]>([]);

  const shikiReadyRef = useRef(false);

  const [editorHeight, setEditorHeight] = useState(180);
  const [themeBackground, setThemeBackground] = useState("#0b0b0b");
  const [themeReady, setThemeReady] = useState(false);

  const [highlightCycle, setHighlightCycle] = useState(0);
  const [moveTargets, setMoveTargets] = useState<{ id: number; from: number; to: number }[]>([]);
  const [fadeInLines, setFadeInLines] = useState<number[]>([]);
  const [fadeOutLines, setFadeOutLines] = useState<number[]>([]);
  const [moveActive, setMoveActive] = useState(false);

  const shikiTheme = THEMES[settings.theme].shikiTheme;
  const languageConfig = LANGUAGES[settings.language];

  const lineHeight = Math.round(settings.fontSize * 1.6);
  const editorPadding = { top: 12, bottom: 12 };

  const previewPaddingY = 12;
  const previewOuterPadding = 4;

  const highlightSource = showPreview && preview ? preview.code : code;
  const highlightLineCount =
    highlightSource.length > 0 ? highlightSource.split(/\r\n|\r|\n/).length : 1;

  const highlightLineNumbers = (highlightLines ?? [])
    .filter((line) => Number.isFinite(line) && line > 0 && line <= highlightLineCount)
    .filter((line, index, list) => list.indexOf(line) === index)
    .sort((a, b) => a - b);

  const highlightMoveDurationMs = MAGIC_MOVE_DURATION_MS + 100;

  useEffect(() => {
    highlightLineChangeRef.current = onHighlightLineChange ?? null;
  }, [onHighlightLineChange]);

  const updateEditorHeight = useCallback(() => {
    if (!editorRef.current) return;

    const height = Math.max(24, editorRef.current.getContentHeight());

    setEditorHeight(height);

    editorRef.current.layout({
      width: editorRef.current.getLayoutInfo().width,
      height,
    });
  }, []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    monaco.languages.register({ id: "vue" });

    const setup = async () => {
      const highlighter = await getHighlighter();
      highlighterRef.current = highlighter;

      if (!shikiReadyRef.current) {
        shikiToMonaco(highlighter, monaco);
        shikiReadyRef.current = true;
        setThemeReady(true);
      }

      monaco.editor.setTheme(shikiTheme);
      setThemeBackground(getThemeBackground(highlighter, shikiTheme));

      sizeListenerRef.current?.dispose();
      sizeListenerRef.current = editor.onDidContentSizeChange(() => {
        updateEditorHeight();
      });

      highlightDecorationsRef.current?.clear();
      highlightDecorationsRef.current = editor.createDecorationsCollection();

      mouseListenerRef.current?.dispose();
      mouseListenerRef.current = editor.onMouseDown((event) => {
        const handleChange = highlightLineChangeRef.current;

        if (!handleChange) return;
        if (event.target.type !== monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS) {
          return;
        }

        const lineNumber = event.target.position?.lineNumber;

        if (!lineNumber) return;

        handleChange(lineNumber);
      });
      updateEditorHeight();
    };

    void setup();
  };

  useEffect(() => {
    if (!monacoRef.current || !highlighterRef.current) return;
    monacoRef.current.editor.setTheme(shikiTheme);
    setThemeBackground(getThemeBackground(highlighterRef.current, shikiTheme));
    setThemeReady(true);
  }, [shikiTheme]);

  useEffect(() => {
    updateEditorHeight();
  }, [code, settings.fontSize, settings.showLineNumbers, updateEditorHeight]);

  useEffect(() => {
    if (!showPreview) {
      prevHighlightLinesRef.current = [];
      setMoveTargets([]);
      setFadeInLines([]);
      setFadeOutLines([]);
      setMoveActive(false);
      return;
    }

    // If there are no lines to be highlighted (highlightLineNumbers is empty)
    if (highlightLineNumbers.length === 0) {
      const prevLines = prevHighlightLinesRef.current;

      prevHighlightLinesRef.current = [];

      setMoveTargets([]);
      setFadeInLines([]);
      setFadeOutLines(prevLines); // Show fade-out animation for previously highlighted lines
      setMoveActive(false);
      setHighlightCycle((prev) => prev + 1);

      // The following timeout clears fadeOutLines after the fade-out animation finishes.
      // This allows the fade-out effect to play before completely removing the previous highlights.
      const timeout = window.setTimeout(() => {
        setFadeOutLines([]);
      }, highlightDelayMs + 400);

      return () => {
        window.clearTimeout(timeout);
      };
    }

    const prevLines = prevHighlightLinesRef.current;
    const nextLines = highlightLineNumbers;
    const pairCount = Math.min(prevLines.length, nextLines.length);
    const nextMoveTargets = prevLines.slice(0, pairCount).map((from, index) => ({
      id: index,
      from,
      to: nextLines[index],
    }));

    setMoveTargets(nextMoveTargets);
    setFadeInLines(nextLines.slice(pairCount));
    setFadeOutLines(prevLines.slice(pairCount));
    prevHighlightLinesRef.current = nextLines;
    setMoveActive(false);
    setHighlightCycle((prev) => prev + 1);

    const frame = window.requestAnimationFrame(() => {
      setMoveActive(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [showPreview, highlightDelayMs, highlightLineNumbers.join(",")]);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const decorationsCollection = highlightDecorationsRef.current;
    if (!decorationsCollection) return;

    const decorations = highlightLineNumbers.map((line) => ({
      range: new monaco.Range(line, 1, line, 1),
      options: {
        isWholeLine: true,
        className: "my-line-highlight",
        linesDecorationsClassName: "my-line-number-highlight",
      },
    }));

    decorationsCollection.set(decorations);
  }, [highlightLineNumbers]);

  useEffect(() => {
    return () => {
      sizeListenerRef.current?.dispose();
      mouseListenerRef.current?.dispose();
      highlightDecorationsRef.current?.clear();
    };
  }, []);

  return (
    <div
      className="relative mx-auto flex resize-x items-center justify-center overflow-auto"
      id="code-capture-area"
      style={{
        padding: `${settings.padding}px`,
        background: settings.background,
        borderRadius: "16px",
        minHeight: minCaptureHeight,
        width: "600px",
        maxWidth: "100%",
        minWidth: "320px",
      }}
    >
      <div
        className="relative flex w-full flex-col overflow-hidden"
        style={{
          backgroundColor: themeBackground,
          borderRadius: `${settings.borderRadius}px`,
          fontSize: `${settings.fontSize}px`,
          boxShadow: settings.borderShadow === "border-none" ? "none" : settings.borderShadow,
        }}
      >
        {settings.windowControls && (
          <div className="relative flex h-10 items-center justify-center border-b border-white/5 bg-white/[0.02] px-4">
            <div className="absolute left-4 flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-inner" />
              <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-inner" />
              <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-inner" />
            </div>
            <div className="flex items-center gap-2 opacity-50">
              {/* Optional File Icon could go here */}
              <span className="font-mono text-xs font-medium tracking-wide text-white/70">
                {languageConfig.label}
              </span>
            </div>
          </div>
        )}

        <div
          className="relative overflow-hidden p-1"
          style={{
            borderRadius: `${settings.borderRadius * 1.5}px`,
          }}
        >
          {showPreview &&
            moveTargets.map((target) => (
              <div
                key={`highlight-move-${target.id}-${highlightCycle}`}
                className="pointer-events-none absolute right-0 left-0 z-20"
                style={{
                  top: `${
                    previewOuterPadding +
                    previewPaddingY +
                    ((moveActive ? target.to : target.from) - 1) * lineHeight
                  }px`,
                  height: `${lineHeight}px`,
                  backgroundColor: "rgba(148, 163, 184, 0.18)",
                  transitionProperty: "top",
                  transitionDuration: `${highlightMoveDurationMs}ms`,
                  transitionTimingFunction: "ease",
                  transitionDelay: `${highlightDelayMs}ms`,
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

          {showPreview && preview && (
            <div
              className="relative z-10 px-[28.5px] py-3"
              style={{
                fontSize: settings.fontSize,
                lineHeight: `${lineHeight}px`,
              }}
            >
              <ShikiMagicMove
                className="fira-code"
                highlighter={preview.highlighter}
                lang={preview.language}
                theme={shikiTheme}
                code={preview.code}
                options={{
                  duration: MAGIC_MOVE_DURATION_MS,
                  stagger: 0.2,
                  lineNumbers: settings.showLineNumbers,
                  delayMove: MAGIC_MOVE_DELAY_MOVE_S,
                }}
              />
            </div>
          )}
          <div
            className={
              showPreview ? "pointer-events-none absolute inset-0 z-10 opacity-0" : "relative z-10"
            }
          >
            <Editor
              value={code}
              onChange={(value) => onCodeChange(value ?? "")}
              language={languageConfig.monaco}
              theme={themeReady ? shikiTheme : "vs-dark"}
              onMount={handleMount}
              height={editorHeight}
              loading={null}
              options={{
                fontFamily: "Fira Code, monospace",
                fontSize: settings.fontSize,
                fontLigatures: true,
                lineHeight,
                lineNumbers: settings.showLineNumbers ? "on" : "off",
                lineDecorationsWidth: settings.showLineNumbers ? 18 : 28,
                lineNumbersMinChars: 4,
                wordWrap: "on",
                guides: { indentation: false },
                scrollBeyondLastLine: false,
                minimap: { enabled: false },
                folding: false,
                renderLineHighlight: "none",
                overviewRulerLanes: 0,
                overviewRulerBorder: false,
                scrollbar: { vertical: "hidden", horizontal: "hidden" },
                glyphMargin: false,
                padding: editorPadding,
                tabSize: 2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
