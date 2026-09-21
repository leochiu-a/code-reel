"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
import SnippetControls from "./SnippetControls";
import SettingsPanel from "./SettingsPanel";
import ThemeSidebar from "./ThemeSidebar";
import CodeEditor from "./CodeEditor";
import VideoOnboarding from "./VideoOnboarding";
import LogoText from "./LogoText";
import { FRAME_PRESENTATION } from "./Frame";
import { Button } from "@/components/ui/button";
import ImageExportPopover from "./ImageExportPopover";
import BulbSvg from "@/components/ui/bulb-svg";
import CopyIcon from "@/components/ui/copy-icon";
import MessageCircleIcon from "@/components/ui/message-circle-icon";

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeReel!");
  
  const greeting = {
    message: "Create beautiful snippets",
  };
  
  return greeting;
}`;

const DEBUG_HIGHLIGHT = false;
const DEFAULT_BORDER_RADIUS = 16;

const countLines = (code: string) => (code || "").split(/\r\n|\r|\n/).length || 1;

const App: React.FC = () => {
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
    fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
    borderRadius: DEFAULT_BORDER_RADIUS,
  });
  const { onExport, onCopyImage, isCopying, isExporting, copyStatus, isCopySupported } =
    useImageExport();
  const [imageExportFormat, setImageExportFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [imageExportScale, setImageExportScale] = useState<1 | 2 | 3>(2);
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

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      // Font size is fixed globally; ignore stored/theme overrides.
      fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
      borderRadius: DEFAULT_BORDER_RADIUS,
    }));
  };

  const shouldShowPreview = Boolean(highlighter) && isPlaying;

  const handleOpenVideoOnboarding = useCallback(() => {
    setIsVideoOnboardingOpen(true);
  }, []);

  const handleImageExport = useCallback(async () => {
    await onExport({ format: imageExportFormat, scale: imageExportScale });
  }, [imageExportFormat, imageExportScale, onExport]);

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
    setStoredSettings({
      ...settings,
      fontSize: DEFAULT_EDITOR_SETTINGS.fontSize,
      borderRadius: DEFAULT_BORDER_RADIUS,
    });
  }, [settings, setStoredSettings]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#181818] text-neutral-100 selection:bg-emerald-400/30 selection:text-emerald-100">
      <header className="flex items-center justify-between bg-[#212121] px-6 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight text-[#f5f5f5]">
            <Link href="/" className="transition hover:text-white">
              <LogoText size="sm" className="codereel-logo-text" />
            </Link>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            asChild
            animatedIcon={<MessageCircleIcon size={14} className="text-slate-200" />}
          >
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
            animatedIcon={<CopyIcon size={14} className="text-slate-200" />}
            className="h-8 cursor-pointer border border-white/10 bg-white/5 px-3 text-xs text-slate-100 hover:bg-white/10 hover:text-white"
          >
            {isCopying ? "Copying..." : "Copy"}
          </Button>

          <Button
            onClick={handleOpenVideoOnboarding}
            variant="secondary"
            animatedIcon={<BulbSvg size={14} className="text-emerald-100" />}
            className="h-8 cursor-pointer border border-white/10 bg-white/5 px-3 text-xs text-slate-100 hover:bg-white/10 hover:text-white"
          >
            Export Video
          </Button>

          <ImageExportPopover
            isExporting={isExporting}
            format={imageExportFormat}
            scale={imageExportScale}
            onFormatChange={setImageExportFormat}
            onScaleChange={setImageExportScale}
            onExport={handleImageExport}
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Settings Panel on the Left */}
        <SettingsPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          copyStatus={copyStatus}
        />

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
            </div>
          </div>
        </main>

        <ThemeSidebar
          settings={settings}
          onSettingsChange={handleSettingsChange}
          highlighter={highlighter}
        />
      </div>

      <VideoOnboarding
        open={isVideoOnboardingOpen}
        onClose={() => setIsVideoOnboardingOpen(false)}
        targetId="onboarding-highlight-area"
        scrollContainerRef={mainRef}
      />
    </div>
  );
};

export default App;
