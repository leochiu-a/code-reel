"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import type { HighlighterCore } from "shiki/core";
import { useLocalStorage } from "usehooks-ts";
import { EditorSettings } from "../types";
import {
  DEFAULT_EDITOR_SETTINGS,
  HIGHLIGHT_STEP_DELAY_MS,
  LANGUAGES,
  PLAY_ANIMATION_INTERVAL_MS,
  THEMES,
} from "../constants";
import { getHighlighter } from "../services/shiki";
import useStepState from "../hooks/useStepState";
import useImageExport from "../hooks/useImageExport";
import useVideoExport from "../hooks/useVideoExport";
import useVideoExportGlobals from "../hooks/useVideoExportGlobals";
import SnippetControls from "./SnippetControls";
import SettingsPanel from "./SettingsPanel";
import CodeEditor from "./CodeEditor";
import VideoOnboarding from "./VideoOnboarding";

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeSnap!");
  
  const greeting = {
    message: "Create beautiful snippets",
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
    handleHighlightLinesChange,
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
  const [isVideoOnboardingOpen, setIsVideoOnboardingOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);
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

  const { isExportingVideo, videoStatus, exportProgress, exportEtaMs } =
    useVideoExport({
      snippets,
      settings,
      intervalMs: PLAY_ANIMATION_INTERVAL_MS,
    });

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const themeConfig =
    THEMES[settings.theme] ?? THEMES[DEFAULT_EDITOR_SETTINGS.theme];
  const shikiTheme = themeConfig.shikiTheme;
  const languageConfig = LANGUAGES[settings.language];
  const shouldShowPreview = Boolean(highlighter) && (isPlaying || isExportMode);

  const handleOpenVideoOnboarding = useCallback(() => {
    setIsVideoOnboardingOpen(true);
  }, []);

  const handleHighlightLineChange = useCallback(
    (line: number) => {
      const currentLines = activeSnippet.highlightLines ?? [];
      const nextLines = currentLines.includes(line)
        ? currentLines.filter((item) => item !== line)
        : [...currentLines, line];
      handleHighlightLinesChange(nextLines);
    },
    [activeSnippet.highlightLines, handleHighlightLinesChange]
  );

  const currentHighlightLines =
    (shouldShowPreview
      ? previewSnippet.highlightLines
      : activeSnippet.highlightLines) ?? [];
  const highlightDelayMs = previewIndex * HIGHLIGHT_STEP_DELAY_MS;

  useEffect(() => {
    setStoredSettings(settings);
  }, [settings, setStoredSettings]);

  useVideoExportGlobals({
    ready: Boolean(highlighter),
    onPlay: handlePlay,
    isPlaying,
    previewIndex,
  });

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
    <div className="flex h-screen w-full overflow-hidden bg-[#0f0f0f] text-neutral-100 selection:bg-emerald-400/30 selection:text-emerald-100">
      {/* Settings Panel on the Left */}
      {!isExportMode && (
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onExport={onExport}
          onExportVideo={handleOpenVideoOnboarding}
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
      <main
        ref={mainRef}
        className="flex flex-1 items-center justify-center overflow-y-auto bg-[#212121] p-8 lg:p-12"
      >
        <div className="relative flex w-full max-w-5xl flex-col gap-6 duration-700">
          {!isExportMode && (
            <div className="mb-4 text-center">
              <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[#f5f5f5] drop-shadow-sm">
                CodeSnap
              </h1>
              <p className="text-[#b3b3b3]">
                Transform your code into professional sharing-ready images.
              </p>
            </div>
          )}

          <div id="onboarding-highlight-area" className="flex flex-col gap-6">
            <CodeEditor
              code={activeSnippet.code}
              onCodeChange={handleSnippetChange}
              settings={settings}
              showPreview={shouldShowPreview}
              highlightLines={currentHighlightLines}
              highlightDelayMs={highlightDelayMs}
              onHighlightLineChange={handleHighlightLineChange}
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
        </div>
      </main>

      {!isExportMode && (
        <VideoOnboarding
          open={isVideoOnboardingOpen}
          onClose={() => setIsVideoOnboardingOpen(false)}
          targetId="onboarding-highlight-area"
          scrollContainerRef={mainRef}
        />
      )}
    </div>
  );
};

export default App;
