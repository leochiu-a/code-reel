import { useCallback, useState } from "react";
import type { Highlighter } from "shiki";
import { toast } from "sonner";
import { firaCode } from "../fonts";
import { exportReelVideo, VideoEncodingUnsupportedError } from "../reel/exportVideo";
import { buildScene, type ReelInput } from "../reel/scene";

// Each step stays still this long, like the editor's playback leaves it on screen.
const HOLD_SECONDS = 1;

const download = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `codereel-${Date.now()}.mp4`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
};

type UseVideoExportOptions = {
  highlighter: Highlighter | null;
  /** Called instead of exporting when the browser has no video encoder. */
  onUnsupported: () => void;
};

const useVideoExport = ({ highlighter, onUnsupported }: UseVideoExportOptions) => {
  /** Share of the export done, from 0 to 1, or null while no export runs. */
  const [videoProgress, setVideoProgress] = useState<number | null>(null);

  const onExportVideo = useCallback(
    async (settings: ReelInput["settings"], steps: ReelInput["steps"]) => {
      if (!highlighter) return;
      setVideoProgress(0);
      try {
        // Tokens are placed by measuring the code font, so it must be loaded.
        await document.fonts.ready;
        // The frame keeps the width it has in the editor, as image export does.
        const width = document.getElementById("code-capture-area")?.scrollWidth;
        const scene = buildScene(
          { settings, steps, hold: HOLD_SECONDS, width },
          highlighter,
          firaCode.style.fontFamily,
        );
        download(await exportReelVideo(scene, { onProgress: setVideoProgress }));
        toast.success("Video exported.");
      } catch (err) {
        if (err instanceof VideoEncodingUnsupportedError) {
          onUnsupported();
          return;
        }
        console.error("Video export failed:", err);
        toast.error("Video export failed. Please try again.");
      } finally {
        setVideoProgress(null);
      }
    },
    [highlighter, onUnsupported],
  );

  return { onExportVideo, videoProgress };
};

export default useVideoExport;
