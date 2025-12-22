"use client";

import React, { useState, useCallback, useEffect } from "react";
import { domToPng } from "modern-screenshot";
import type { HighlighterCore } from "shiki/core";
import CodeEditor from "./CodeEditor";
import SettingsPanel from "./SettingsPanel";
import { EditorSettings } from "../types";
import { PLAY_ANIMATION_INTERVAL_MS, THEMES } from "../constants";
import { getHighlighter } from "../services/shiki";
import useStepState from "../hooks/useStepState";

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeSnap AI!");
  
  const greeting = {
    message: "Create beautiful snippets",
    poweredBy: "Gemini 3"
  };
  
  return greeting;
}`;

const App: React.FC = () => {
  const {
    snippets,
    activeSnippet,
    previewSnippet,
    isPlaying,
    isResetOpen,
    setIsResetOpen,
    handleSnippetChange,
    handleAddSnippet,
    handleRemoveSnippet,
    handlePlay,
    handleSelectSnippet,
    handleResetConfirm,
  } = useStepState({
    defaultCode: DEFAULT_CODE,
    intervalMs: PLAY_ANIMATION_INTERVAL_MS,
  });
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null);
  const [isCopying, setIsCopying] = useState(false);
  const [copyStatus, setCopyStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [settings, setSettings] = useState<EditorSettings>({
    theme: "one-dark",
    language: "javascript",
    padding: 64,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    showLineNumbers: false,
    windowControls: true,
    fontSize: 16,
    borderRadius: 16,
  });
  const [isCopySupported, setIsCopySupported] = useState(false);

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const shikiTheme = THEMES[settings.theme].shikiTheme;

  const handleExport = useCallback(() => {
    const node = document.getElementById("code-capture-area");
    if (!node) return;

    const exportWidth = Math.ceil(node.scrollWidth);
    const exportHeight = Math.ceil(node.scrollHeight);

    domToPng(node, {
      quality: 1,
      scale: 2,
      width: exportWidth,
      height: exportHeight,
      style: {
        width: `${exportWidth}px`,
        height: `${exportHeight}px`,
      },
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `codesnap-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed:", err);
      });
  }, []);

  const handleCopyImage = useCallback(async () => {
    if (!("clipboard" in navigator) || !("ClipboardItem" in window)) {
      setCopyStatus({
        tone: "error",
        message: "Clipboard image copy is not supported in this browser.",
      });
      return;
    }
    const node = document.getElementById("code-capture-area");
    if (!node) return;

    setIsCopying(true);
    const exportWidth = Math.ceil(node.scrollWidth);
    const exportHeight = Math.ceil(node.scrollHeight);

    try {
      const dataUrl = await domToPng(node, {
        quality: 1,
        scale: 2,
        width: exportWidth,
        height: exportHeight,
        style: {
          width: `${exportWidth}px`,
          height: `${exportHeight}px`,
        },
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopyStatus({ tone: "success", message: "Image copied to clipboard." });
    } catch (err) {
      console.error("Copy failed:", err);
      setCopyStatus({
        tone: "error",
        message: "Copy failed. Please try again.",
      });
    } finally {
      setIsCopying(false);
    }
  }, []);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => {
      setCopyStatus(null);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    setIsCopySupported(
      typeof window !== "undefined" &&
        "clipboard" in navigator &&
        "ClipboardItem" in window
    );
  }, []);

  useEffect(() => {
    let mounted = true;
    getHighlighter().then((loaded) => {
      if (!mounted) return;
      setHighlighter(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden">
      {/* Settings Panel on the Left */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onExport={handleExport}
        onCopyImage={handleCopyImage}
        isCopying={isCopying}
        isCopySupported={isCopySupported}
        copyStatus={copyStatus}
      />

      {/* Main Preview Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in duration-700">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              CodeSnap
            </h1>
            <p className="text-slate-400">
              Transform your code into professional sharing-ready images.
            </p>
          </div>

          <CodeEditor
            code={activeSnippet.code}
            onCodeChange={handleSnippetChange}
            settings={settings}
            showPreview={isPlaying && Boolean(highlighter)}
            preview={
              highlighter
                ? {
                    highlighter,
                    code: previewSnippet.code,
                    language: settings.language,
                    theme: shikiTheme,
                  }
                : undefined
            }
          />

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {snippets.map((snippet, index) => (
                  <button
                    key={snippet.id}
                    onClick={() => {
                      handleSelectSnippet(snippet.id, index);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      snippet.id === activeSnippet.id
                        ? "border-blue-400 bg-blue-500/10 text-blue-200"
                        : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {snippet.title}
                  </button>
                ))}
                <button
                  onClick={handleAddSnippet}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  + Add Step
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemoveSnippet}
                  disabled={snippets.length === 1}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsResetOpen((prev) => !prev)}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
                  >
                    Reset
                  </button>
                  {isResetOpen && (
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-slate-200 shadow-2xl">
                      <p className="mb-3 text-slate-300">
                        Reset all steps and start over?
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setIsResetOpen(false)}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleResetConfirm}
                          className="rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-400"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handlePlay}
                  disabled={snippets.length < 2 || !highlighter}
                  className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPlaying ? "Playing..." : "Play Animation"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
