import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorSettings } from "../types";
import {
  EXPORT_CAPTURE_FORMAT,
  EXPORT_CAPTURE_QUALITY,
  EXPORT_DEVICE_SCALE,
  EXPORT_PAGE_PATH,
  EXPORT_PROCESSING_BUFFER_MS,
  EXPORT_VIDEO_FPS,
  PLAY_ANIMATION_INTERVAL_MS,
} from "../constants";

type CodeSnippet = {
  id: string;
  title: string;
  code: string;
};

type VideoStatus = {
  tone: "success" | "error";
  message: string;
} | null;

type UseVideoExportOptions = {
  snippets: CodeSnippet[];
  settings: EditorSettings;
  intervalMs?: number;
};

const useVideoExport = ({
  snippets,
  settings,
  intervalMs = PLAY_ANIMATION_INTERVAL_MS,
}: UseVideoExportOptions) => {
  const [isExportingVideo, setIsExportingVideo] = useState(false);
  const [videoStatus, setVideoStatus] = useState<VideoStatus>(null);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportEtaMs, setExportEtaMs] = useState<number | null>(null);
  const exportTimerRef = useRef<number | null>(null);

  const startExportProgress = useCallback((estimateMs: number) => {
    if (exportTimerRef.current) {
      window.clearInterval(exportTimerRef.current);
    }
    const start = window.performance.now();
    setExportProgress(0);
    setExportEtaMs(estimateMs);
    exportTimerRef.current = window.setInterval(() => {
      const elapsed = window.performance.now() - start;
      const ratio = Math.min(elapsed / estimateMs, 0.95);
      setExportProgress(ratio);
      setExportEtaMs(Math.max(0, estimateMs - elapsed));
    }, 120);
  }, []);

  const stopExportProgress = useCallback((success: boolean) => {
    if (exportTimerRef.current) {
      window.clearInterval(exportTimerRef.current);
      exportTimerRef.current = null;
    }
    setExportProgress(success ? 1 : 0);
    setExportEtaMs(null);
  }, []);

  const exportRequestPayload = useMemo(
    () => ({
      snippets: snippets.map((snippet) => ({
        id: snippet.id,
        code: snippet.code,
        title: snippet.title,
      })),
      settings,
      intervalMs,
      pagePath: EXPORT_PAGE_PATH,
      fps: EXPORT_VIDEO_FPS,
      captureFormat: EXPORT_CAPTURE_FORMAT,
      captureQuality: EXPORT_CAPTURE_QUALITY,
      deviceScaleFactor: EXPORT_DEVICE_SCALE,
    }),
    [intervalMs, settings, snippets]
  );

  const handleExportVideo = useCallback(async () => {
    if (snippets.length === 0) return;
    setIsExportingVideo(true);
    setVideoStatus(null);
    const transitions = Math.max(snippets.length - 1, 0);
    const estimateMs = transitions * intervalMs + EXPORT_PROCESSING_BUFFER_MS;
    startExportProgress(Math.max(1000, estimateMs));
    try {
      const response = await fetch("/api/export-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportRequestPayload),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error ?? "Video export failed.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `codesnap-${Date.now()}.mp4`;
      link.click();
      URL.revokeObjectURL(url);
      setVideoStatus({ tone: "success", message: "Video exported." });
      stopExportProgress(true);
    } catch (err) {
      console.error("Video export failed:", err);
      setVideoStatus({
        tone: "error",
        message: "Video export failed. Please try again.",
      });
      stopExportProgress(false);
    } finally {
      setIsExportingVideo(false);
    }
  }, [
    exportRequestPayload,
    intervalMs,
    snippets.length,
    startExportProgress,
    stopExportProgress,
  ]);

  useEffect(() => {
    if (!videoStatus) return;
    const timer = window.setTimeout(() => {
      setVideoStatus(null);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [videoStatus]);

  useEffect(() => {
    return () => {
      if (exportTimerRef.current) {
        window.clearInterval(exportTimerRef.current);
        exportTimerRef.current = null;
      }
    };
  }, []);

  return {
    handleExportVideo,
    isExportingVideo,
    videoStatus,
    exportProgress,
    exportEtaMs,
  };
};

export default useVideoExport;
