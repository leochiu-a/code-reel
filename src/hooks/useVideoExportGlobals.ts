import { useEffect } from "react";

type VideoExportGlobalsOptions = {
  ready: boolean;
  onPlay: () => void;
  isPlaying: boolean;
  previewIndex: number;
};

const useVideoExportGlobals = ({
  ready,
  onPlay,
  isPlaying,
  previewIndex,
}: VideoExportGlobalsOptions) => {
  // Expose a minimal, stable window API for the export flow.
  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__codesnap_ready = ready;
    return () => {
      delete (window as any).__codesnap_ready;
    };
  }, [ready]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__codesnap_play = onPlay;
    return () => {
      delete (window as any).__codesnap_play;
    };
  }, [onPlay]);

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
};

export default useVideoExportGlobals;
