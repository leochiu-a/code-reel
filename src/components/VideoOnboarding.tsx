"use client";

import React, { startTransition, useCallback, useEffect, useState } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";
import { Button } from "./ui/button";

type OnboardingRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type VideoOnboardingProps = {
  open: boolean;
  onClose: () => void;
  targetId: string;
  scrollContainerRef: React.RefObject<HTMLElement>;
};

const VideoOnboarding: React.FC<VideoOnboardingProps> = ({
  open,
  onClose,
  targetId,
  scrollContainerRef,
}) => {
  const [onboardingRect, setOnboardingRect] = useState<OnboardingRect | null>(null);

  const updateOnboardingRect = useCallback(() => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(targetId);
    if (!target) {
      setOnboardingRect(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    const padding = 14;
    setOnboardingRect({
      top: Math.max(rect.top - padding, 12),
      left: Math.max(rect.left - padding, 12),
      width: rect.width + padding * 2,
      height: rect.height + padding * 2,
    });
  }, [targetId]);

  useEffect(() => {
    if (!open) return;

    startTransition(() => {
      updateOnboardingRect();
    });

    const handleResize = () => updateOnboardingRect();
    const scrollContainer = scrollContainerRef.current;

    window.addEventListener("resize", handleResize);
    scrollContainer?.addEventListener("scroll", handleResize);

    const target = document.getElementById(targetId);
    const resizeObserver = target ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(target as Element);

    return () => {
      window.removeEventListener("resize", handleResize);
      scrollContainer?.removeEventListener("scroll", handleResize);
      resizeObserver?.disconnect();
    };
  }, [open, scrollContainerRef, targetId, updateOnboardingRect]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open || !onboardingRect) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="pointer-events-none absolute rounded-[28px] border-2 border-emerald-300/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]"
        style={{
          top: onboardingRect.top,
          left: onboardingRect.left,
          width: onboardingRect.width,
          height: onboardingRect.height,
        }}
      />
      <Popover open>
        <PopoverAnchor asChild>
          <div
            className="absolute h-2 w-2"
            style={{
              top: onboardingRect.top - 8,
              left: onboardingRect.left + onboardingRect.width - 24,
            }}
          />
        </PopoverAnchor>
        <PopoverContent
          side="top"
          align="end"
          className="w-80 border-white/10 bg-[#1b1b1b] text-slate-100 shadow-xl"
        >
          <div className="flex flex-col gap-3 text-sm">
            <div className="text-base font-semibold text-emerald-200">Recording Guide</div>
            <div className="text-slate-300">
              This highlighted area is your CodeSnap capture region. Play the animation, then record
              it with your screen capture tool.
            </div>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <div>1. Click Play Animation.</div>
              <div>2. Start your recorder (CleanShot, OBS, etc.).</div>
              <div>3. Crop/select only the highlighted area.</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default VideoOnboarding;
