"use client";

import React, { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { HighlighterCore } from "shiki/core";
import { useLocalStorage } from "usehooks-ts";
import { EditorSettings } from "../types";
import {
  DEFAULT_EDITOR_SETTINGS,
  LANGUAGES,
  PLAY_ANIMATION_INTERVAL_MS,
  THEMES,
} from "../constants";
import { getHighlighter } from "../services/shiki";
import useStepState from "../hooks/useStepState";
import useImageExport from "../hooks/useImageExport";
import useVideoExport from "../hooks/useVideoExport";
import SnippetControls from "./SnippetControls";
import SettingsPanel from "./SettingsPanel";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="mx-auto w-full max-w-4xl">
      <div className="rounded-2xl border border-white/10 bg-slate-950/60" />
    </div>
  ),
});

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeSnap AI!");
  
  const greeting = {
    message: "Create beautiful snippets",
    poweredBy: "Gemini 3"
  };
  
  return greeting;
}`;

const countLines = (code: string) =>
  (code || "").split(/\r\n|\r|\n/).length || 1;

const App: React.FC = () => {
  const searchParams = useSearchParams();
  const isExportMode = searchParams?.get("export") === "1";
  const {
    snippets,
    activeSnippet,
    previewSnippet,
    previewIndex,
    isPlaying,
    isResetOpen,
    setIsResetOpen,
    handleSnippetChange,
    handleAddSnippet,
    handleRemoveSnippet,
    handleReorderSnippet,
    handlePlay,
    handleSelectSnippet,
    handleResetConfirm,
  } = useStepState({
    defaultCode: DEFAULT_CODE,
    intervalMs: PLAY_ANIMATION_INTERVAL_MS,
  });
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null);
  const [storedSettings, setStoredSettings] = useLocalStorage<EditorSettings>(
    "codesnap-settings",
    DEFAULT_EDITOR_SETTINGS
  );
  const [settings, setSettings] = useState<EditorSettings>(storedSettings);
  const { onExport, onCopyImage, isCopying, copyStatus, isCopySupported } =
    useImageExport();
  const maxLineCount = useMemo(
    () => Math.max(1, ...snippets.map((snippet) => countLines(snippet.code))),
    [snippets]
  );
  const lineHeight = Math.round(settings.fontSize * 1.6);
  const maxCaptureHeight =
    settings.padding * 2 +
    (settings.windowControls ? 48 : 0) +
    maxLineCount * lineHeight +
    52;

  const {
    handleExportVideo,
    isExportingVideo,
    videoStatus,
    exportProgress,
    exportEtaMs,
  } = useVideoExport({
    snippets,
    settings,
    intervalMs: PLAY_ANIMATION_INTERVAL_MS,
  });

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const shikiTheme = THEMES[settings.theme].shikiTheme;
  const languageConfig = LANGUAGES[settings.language];
  const shouldShowPreview = Boolean(highlighter) && (isPlaying || isExportMode);

  useEffect(() => {
    setStoredSettings(settings);
  }, [settings, setStoredSettings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__codesnap_ready = Boolean(highlighter);
    return () => {
      delete (window as any).__codesnap_ready;
    };
  }, [highlighter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__codesnap_play = handlePlay;
    return () => {
      delete (window as any).__codesnap_play;
    };
  }, [handlePlay]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__codesnap_playing = isPlaying;
    return () => {
      delete (window as any).__codesnap_playing;
    };
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__codesnap_previewIndex = previewIndex;
    return () => {
      delete (window as any).__codesnap_previewIndex;
    };
  }, [previewIndex]);

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
    <div className="flex h-screen w-full overflow-hidden bg-[#0f172a]">
      {/* Settings Panel on the Left */}
      {!isExportMode && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onExport={onExport}
          onExportVideo={handleExportVideo}
          onCopyImage={onCopyImage}
          isCopying={isCopying}
          isExportingVideo={isExportingVideo}
          exportProgress={exportProgress}
          exportEtaMs={exportEtaMs}
          isCopySupported={isCopySupported}
          copyStatus={copyStatus}
          videoStatus={videoStatus}
        />
      )}

      {/* Main Preview Area */}
      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-8 lg:p-12">
        <div className="relative flex w-full max-w-5xl flex-col gap-6 duration-700">
          {!isExportMode && (
            <div className="mb-4 text-center">
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-white">
                CodeSnap
              </h1>
              <p className="text-slate-400">
                Transform your code into professional sharing-ready images.
              </p>
            </div>
          )}

          <CodeEditor
            code={activeSnippet.code}
            onCodeChange={handleSnippetChange}
            settings={settings}
            showPreview={shouldShowPreview}
            minCaptureHeight={maxCaptureHeight}
            preview={
              highlighter
                ? {
                    highlighter,
                    code: previewSnippet.code,
                    language: languageConfig.shiki,
                    theme: shikiTheme,
                  }
                : undefined
            }
          />

          {!isExportMode && (
            <SnippetControls
              snippets={snippets}
              activeSnippetId={activeSnippet.id}
              isResetOpen={isResetOpen}
              setIsResetOpen={setIsResetOpen}
              onSelectSnippet={handleSelectSnippet}
              onAddSnippet={handleAddSnippet}
              onRemoveSnippet={handleRemoveSnippet}
              onReorderSnippet={handleReorderSnippet}
              onResetConfirm={handleResetConfirm}
              onPlay={handlePlay}
              isPlaying={isPlaying}
              isPlayDisabled={snippets.length < 2 || !highlighter}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
