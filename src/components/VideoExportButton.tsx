"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import ClapperboardIcon from "@/components/ui/clapperboard-icon";

type VideoExportButtonProps = {
  /** Share of the export done, from 0 to 1, or null while no export runs. */
  progress: number | null;
  disabled: boolean;
  onExport: () => void;
};

/** Exports the reel as MP4; while it renders, the button fills up as its progress bar. */
const VideoExportButton: React.FC<VideoExportButtonProps> = ({ progress, disabled, onExport }) => {
  const isExporting = progress !== null;
  const percent = Math.round((progress ?? 0) * 100);

  return (
    <Button
      onClick={onExport}
      disabled={disabled || isExporting}
      variant="secondary"
      animatedIcon={<ClapperboardIcon size={14} className="text-slate-200" />}
      className="relative h-8 min-w-28 cursor-pointer overflow-hidden border border-white/10 bg-white/5 px-3 text-xs text-slate-100 hover:bg-white/10 hover:text-white disabled:opacity-100"
    >
      {isExporting && (
        <progress
          aria-label="Video export progress"
          max={100}
          value={percent}
          className="absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-progress-bar]:bg-emerald-500/30 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-emerald-500/30"
        />
      )}
      <span className="relative tabular-nums">
        {isExporting ? `Rendering ${percent}%` : "Export Video"}
      </span>
    </Button>
  );
};

export default VideoExportButton;
