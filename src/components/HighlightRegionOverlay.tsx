"use client";

import React, { startTransition, useCallback, useEffect, useState } from "react";
import { computeHighlightRect, HIGHLIGHT_PADDING_PX, type OnboardingRect } from "../utils/highlightRegion";

type HighlightRegionOverlayProps = {
  open: boolean;
  onClose: () => void;
  targetId: string;
};

const HighlightRegionOverlay: React.FC<HighlightRegionOverlayProps> = ({
  open,
  onClose,
  targetId,
}) => {
  const [rect, setRect] = useState<OnboardingRect | null>(null);

  const updateRect = useCallback(() => {
    if (typeof window === "undefined") return;
    const target = document.getElementById(targetId);
    if (!target) {
      setRect(null);
      return;
    }
    const domRect = target.getBoundingClientRect();
    const computed = computeHighlightRect(
      { top: domRect.top, left: domRect.left, width: domRect.width, height: domRect.height },
      HIGHLIGHT_PADDING_PX,
    );
    setRect(computed);
  }, [targetId]);

  useEffect(() => {
    if (!open) return;

    startTransition(() => {
      updateRect();
    });

    const handleResize = () => updateRect();
    window.addEventListener("resize", handleResize);

    const target = document.getElementById(targetId);
    const resizeObserver = target ? new ResizeObserver(handleResize) : null;
    resizeObserver?.observe(target as Element);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver?.disconnect();
    };
  }, [open, targetId, updateRect]);

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

  if (!open || !rect) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0" onClick={onClose} />
      <div
        className="pointer-events-none absolute rounded-[28px] border-2 border-emerald-300/90 shadow-[0_0_0_9999px_rgba(2,6,23,0.72)]"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        }}
      />
    </div>
  );
};

export default HighlightRegionOverlay;
