"use client";

import React, { useLayoutEffect, useRef, useState } from "react";

type ScaleToFitProps = {
  /** Room kept free on the sides, e.g. for handles that sit outside the content. */
  gutter?: number;
  children: (scale: number) => React.ReactNode;
};

/**
 * Shows its content at its natural size, or scaled down when it is wider than
 * the space available. Only the view scales: the content keeps its real size,
 * which is what image and video export capture.
 */
const ScaleToFit = ({ gutter = 0, children }: ScaleToFitProps) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ available: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    // Fires once on observe, then on every resize of either box. Offset sizes
    // ignore the transform, so the content is always measured unscaled.
    const observer = new ResizeObserver(() =>
      setSize({
        available: outer.clientWidth - gutter,
        width: inner.offsetWidth,
        height: inner.offsetHeight,
      }),
    );
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [gutter]);

  const scale = size.width > 0 && size.available > 0 ? Math.min(1, size.available / size.width) : 1;

  return (
    <div ref={outerRef} className="flex w-full justify-center">
      {/* Holds the scaled size in the layout, which a transform alone does not. */}
      <div
        style={
          size.width > 0 ? { width: size.width * scale, height: size.height * scale } : undefined
        }
      >
        <div
          ref={innerRef}
          className="w-max origin-top-left"
          style={scale < 1 ? { transform: `scale(${scale})` } : undefined}
        >
          {children(scale)}
        </div>
      </div>
    </div>
  );
};

export default ScaleToFit;
