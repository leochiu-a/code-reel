import React, { useCallback, useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import type { HighlighterCore } from "shiki/core";
import { ShikiMagicMove } from "shiki-magic-move/react";
import { shikiToMonaco } from "@shikijs/monaco";

import { EditorSettings } from "../types";
import { THEMES } from "../constants";
import { getHighlighter, getThemeBackground } from "../services/shiki";

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  settings: EditorSettings;
  showPreview?: boolean;
  preview?: {
    highlighter: HighlighterCore;
    code: string;
    language: string;
    theme: string;
  };
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onCodeChange,
  settings,
  showPreview = false,
  preview,
}) => {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const highlighterRef = useRef<Awaited<
    ReturnType<typeof getHighlighter>
  > | null>(null);
  const sizeListenerRef = useRef<Monaco.IDisposable | null>(null);
  const shikiReadyRef = useRef(false);
  const [editorHeight, setEditorHeight] = useState(180);
  const [themeBackground, setThemeBackground] = useState("#0b0b0b");
  const [themeReady, setThemeReady] = useState(false);
  const shikiTheme = THEMES[settings.theme].shikiTheme;
  const lineHeight = Math.round(settings.fontSize * 1.6);

  const updateEditorHeight = useCallback(() => {
    if (!editorRef.current) return;
    const height = Math.max(120, editorRef.current.getContentHeight());
    setEditorHeight(height);
    editorRef.current.layout({
      width: editorRef.current.getLayoutInfo().width,
      height,
    });
  }, []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

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
    return () => {
      sizeListenerRef.current?.dispose();
    };
  }, []);

  return (
    <div
      className="relative w-full max-w-4xl mx-auto shadow-2xl overflow-hidden transition-all duration-300"
      id="code-capture-area"
      style={{
        padding: `${settings.padding}px`,
        background: settings.background,
        borderRadius: "16px",
      }}
    >
      <div
        className="relative shadow-2xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: themeBackground,
          borderRadius: `${settings.borderRadius}px`,
          fontSize: `${settings.fontSize}px`,
        }}
      >
        {settings.windowControls && (
          <div className="flex items-center gap-2 p-4 border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div className="ml-2 text-xs opacity-40 font-mono tracking-widest uppercase">
              {settings.language}
            </div>
          </div>
        )}

        <div className="relative flex min-h-[100px] fira-code">
          <div
            className="relative flex-1"
            style={{ backgroundColor: themeBackground }}
          >
            {showPreview && preview && (
              <div
                style={{
                  fontSize: settings.fontSize,
                  lineHeight: `${lineHeight}px`,
                  padding: "12px 20px",
                }}
              >
                <ShikiMagicMove
                  className="fira-code"
                  highlighter={preview.highlighter}
                  lang={preview.language}
                  theme={shikiTheme}
                  code={preview.code}
                  options={{
                    duration: 800,
                    stagger: 0.2,
                    lineNumbers: settings.showLineNumbers,
                    delayMove: 0.4,
                  }}
                />
              </div>
            )}
            <div
              className={
                showPreview
                  ? "absolute inset-0 opacity-0 pointer-events-none"
                  : ""
              }
            >
              <Editor
                value={code}
                onChange={(value) => onCodeChange(value ?? "")}
                language={settings.language}
                theme={themeReady ? shikiTheme : "vs-dark"}
                onMount={handleMount}
                height={editorHeight}
                options={{
                  fontFamily: "Fira Code, monospace",
                  fontSize: settings.fontSize,
                  lineHeight,
                  lineNumbers: settings.showLineNumbers ? "on" : "off",
                  lineDecorationsWidth: 20,
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
                  padding: { top: 12, bottom: 12 },
                  tabSize: 2,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
