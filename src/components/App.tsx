"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";
import { EditorSettings } from "../types";
import {
  DEFAULT_EDITOR_SETTINGS,
  HIGHLIGHT_STEP_DELAY_MS,
  PLAY_ANIMATION_INTERVAL_MS,
  PREVIEW_STEPS,
} from "../constants";
import useStepState from "../hooks/useStepState";
import useImageExport from "../hooks/useImageExport";
import useHighlighter from "../hooks/useHighlighter";
import useVideoExport from "../hooks/useVideoExport";
import useVideoExportGlobals from "../hooks/useVideoExportGlobals";
import SnippetControls from "./SnippetControls";
import SettingsPanel from "./SettingsPanel";
import CodeEditor from "./CodeEditor";
import VideoOnboarding from "./VideoOnboarding";
import { FRAME_PRESENTATION } from "./Frame";
import { Button } from "@/components/ui/button";

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeReel!");
  
  const greeting = {
    message: "Create beautiful snippets",
  };
  
  return greeting;
}`;

const DEBUG_HIGHLIGHT = false;

const countLines = (code: string) => (code || "").split(/\r\n|\r|\n/).length || 1;

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
    defaultSnippets: PREVIEW_STEPS,
    intervalMs: PLAY_ANIMATION_INTERVAL_MS,
  });
  const highlighter = useHighlighter();
  const [storedSettings, setStoredSettings] = useLocalStorage<EditorSettings>(
    "codesnap-settings",
    DEFAULT_EDITOR_SETTINGS,
  );
  const [settings, setSettings] = useState<EditorSettings>({
    ...DEFAULT_EDITOR_SETTINGS,
    ...storedSettings,
  });
  const { onExport, onCopyImage, isCopying, isExporting, copyStatus, isCopySupported } =
    useImageExport();
  const [isVideoOnboardingOpen, setIsVideoOnboardingOpen] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const maxLineCount = useMemo(
    () => Math.max(1, ...snippets.map((snippet) => countLines(snippet.code))),
    [snippets],
  );
  const lineHeight = Math.round(settings.fontSize * FRAME_PRESENTATION.editorLineHeightMultiplier);
  const chromeHeight = settings.windowControls ? 40 : 0;
  const editorVerticalPadding = FRAME_PRESENTATION.editorPaddingY * 2;
  const maxCaptureHeight =
    settings.padding * 2 + chromeHeight + editorVerticalPadding + maxLineCount * lineHeight;

  const { isExportingVideo, videoStatus, exportProgress, exportEtaMs } = useVideoExport({
    snippets,
    settings,
    intervalMs: PLAY_ANIMATION_INTERVAL_MS,
  });

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

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
    [activeSnippet.highlightLines, handleHighlightLinesChange],
  );

  const currentHighlightLines =
    (shouldShowPreview ? previewSnippet.highlightLines : activeSnippet.highlightLines) ?? [];
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

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#181818] text-neutral-100 selection:bg-emerald-400/30 selection:text-emerald-100">
      {!isExportMode && (
        <header className="flex items-center justify-between bg-[#212121] px-6 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold tracking-tight text-[#f5f5f5]">
              <Link href="/" className="transition hover:text-white">
                CodeReel
              </Link>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" asChild>
              <a
                href="https://forms.gle/KJSCGjiNPxRqjbrg6"
                target="_blank"
                rel="noreferrer"
                className="h-8 cursor-pointer border border-white/10 bg-white/5 px-3 text-xs text-slate-100 hover:bg-white/10 hover:text-white"
              >
                Feedback
              </a>
            </Button>
            <Button
              onClick={onCopyImage}
              disabled={isCopying || !isCopySupported}
              variant="secondary"
              className="h-8 cursor-pointer border border-white/10 bg-white/5 px-3 text-xs text-slate-100 hover:bg-white/10 hover:text-white"
            >
              {isCopying ? "Copying..." : "Copy"}
            </Button>
            <Button
              onClick={onExport}
              disabled={isExporting}
              className="h-8 cursor-pointer bg-emerald-500 px-3 text-xs text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-400"
            >
              {isExporting ? "Exporting..." : "Export Image"}
            </Button>
            <Button
              onClick={handleOpenVideoOnboarding}
              disabled={isExportingVideo}
              className="h-8 cursor-pointer border border-emerald-600/30 bg-emerald-600/10 px-3 text-xs text-emerald-300 transition-all duration-300 hover:bg-emerald-600 hover:text-white"
            >
              {isExportingVideo ? "Exporting..." : "Export Video"}
            </Button>
          </div>
        </header>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Settings Panel on the Left */}
        {!isExportMode && (
          <SettingsPanel
            settings={settings}
            onSettingsChange={handleSettingsChange}
            isExportingVideo={isExportingVideo}
            exportProgress={exportProgress}
            exportEtaMs={exportEtaMs}
            copyStatus={copyStatus}
            videoStatus={videoStatus}
          />
        )}

        {/* Main Preview Area */}
        <main
          ref={mainRef}
          className="flex flex-1 items-center justify-center overflow-y-auto bg-[#212121] px-3"
        >
          <div className="relative flex min-h-full w-full flex-col items-center justify-center gap-6 rounded-t-2xl border border-white/10 bg-[#181818] p-8 duration-700 lg:p-12">
            <div id="onboarding-highlight-area" className="flex flex-col gap-6">
              <CodeEditor
                code={shouldShowPreview ? previewSnippet.code : activeSnippet.code}
                onCodeChange={handleSnippetChange}
                settings={settings}
                showPreview={shouldShowPreview}
                highlightLines={currentHighlightLines}
                highlightDelayMs={highlightDelayMs}
                onHighlightLineChange={handleHighlightLineChange}
                minCaptureHeight={maxCaptureHeight}
                containerHeight={maxCaptureHeight}
                highlighter={highlighter}
                debugHighlight={DEBUG_HIGHLIGHT}
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
      </div>

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
