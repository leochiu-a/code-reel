"use client";

import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/components/radix/toggle-group";
import { Button } from "@/components/ui/button";
import { ClapIcon } from "@/components/ui/clap";

type VideoExportScale = 1 | 2 | 3;

type VideoExportPopoverProps = {
  /** Share of the export done, from 0 to 1, or null while no export runs. */
  progress: number | null;
  disabled: boolean;
  scale: VideoExportScale;
  onScaleChange: (scale: VideoExportScale) => void;
  onExport: () => Promise<void>;
};

const PROGRESS_CLASS =
  "absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-progress-bar]:bg-emerald-500/30 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-emerald-500/30";

/**
 * Video export options, like ImageExportPopover: the panel stays open while
 * the video renders and closes when it is done. The trigger fills up as a
 * progress bar too, so progress stays visible if the panel is dismissed.
 */
const VideoExportPopover: React.FC<VideoExportPopoverProps> = ({
  progress,
  disabled,
  scale,
  onScaleChange,
  onExport,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const isExporting = progress !== null;
  const percent = Math.round((progress ?? 0) * 100);

  const handleExport = async () => {
    await onExport();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled || isExporting}
          variant="secondary"
          animatedIcon={<ClapIcon size={14} className="text-slate-200" />}
          className="relative h-8 min-w-28 cursor-pointer overflow-hidden border border-white/10 bg-white/5 px-3 text-xs text-slate-100 hover:bg-white/10 hover:text-white disabled:opacity-100"
        >
          {isExporting && (
            <progress
              aria-label="Video export progress"
              max={100}
              value={percent}
              className={PROGRESS_CLASS}
            />
          )}
          <span className="relative tabular-nums">
            {isExporting ? `Rendering ${percent}%` : "Export Video"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-64 space-y-4 rounded-xl border border-white/10 bg-[#1b1b1b] p-4 text-xs text-slate-200 shadow-2xl"
      >
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Resolution
          </span>
          <ToggleGroup
            type="single"
            value={String(scale)}
            onValueChange={(value) => value && onScaleChange(Number(value) as VideoExportScale)}
            className="w-full justify-start gap-2"
          >
            <ToggleGroupItem value="1" className="h-8 flex-1">
              1x
            </ToggleGroupItem>
            <ToggleGroupItem value="2" className="h-8 flex-1">
              2x
            </ToggleGroupItem>
            <ToggleGroupItem value="3" className="h-8 flex-1">
              3x
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          className="relative h-8 w-full cursor-pointer overflow-hidden bg-emerald-500 text-xs text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-400 disabled:opacity-100"
        >
          {isExporting && (
            <progress
              aria-hidden
              max={100}
              value={percent}
              className="absolute inset-0 h-full w-full appearance-none bg-transparent [&::-moz-progress-bar]:bg-white/25 [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-white/25"
            />
          )}
          <span className="relative tabular-nums">
            {isExporting ? `Rendering ${percent}%` : "Export"}
          </span>
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default VideoExportPopover;
