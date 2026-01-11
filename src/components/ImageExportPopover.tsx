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
import ArrowBigDownDashIcon from "@/components/ui/arrow-big-down-dash-icon";

type ImageExportFormat = "png" | "jpeg" | "webp";
type ImageExportScale = 1 | 2 | 3;

type ImageExportPopoverProps = {
  isExporting: boolean;
  format: ImageExportFormat;
  scale: ImageExportScale;
  onFormatChange: (format: ImageExportFormat) => void;
  onScaleChange: (scale: ImageExportScale) => void;
  onExport: () => void;
};

const ImageExportPopover: React.FC<ImageExportPopoverProps> = ({
  isExporting,
  format,
  scale,
  onFormatChange,
  onScaleChange,
  onExport,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleExport = async () => {
    await onExport();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isExporting}
          className="h-8 cursor-pointer gap-2 bg-emerald-500 px-3 text-xs text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-400"
          animatedIcon={<ArrowBigDownDashIcon size={14} className="text-white/90" />}
        >
          {isExporting ? "Exporting..." : "Export Image"}
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
            Format
          </span>
          <ToggleGroup
            type="single"
            value={format}
            onValueChange={(value) => value && onFormatChange(value as ImageExportFormat)}
            className="w-full justify-start gap-2"
          >
            <ToggleGroupItem value="png" className="h-8 flex-1">
              PNG
            </ToggleGroupItem>
            <ToggleGroupItem value="webp" className="h-8 flex-1">
              WEBP
            </ToggleGroupItem>
            <ToggleGroupItem value="jpeg" className="h-8 flex-1">
              JPEG
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            Scale
          </span>
          <ToggleGroup
            type="single"
            value={String(scale)}
            onValueChange={(value) => value && onScaleChange(Number(value) as ImageExportScale)}
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
          className="h-8 w-full cursor-pointer bg-emerald-500 text-xs text-white shadow-lg shadow-emerald-900/25 hover:bg-emerald-400"
        >
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default ImageExportPopover;
