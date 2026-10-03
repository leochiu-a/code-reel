import type React from "react";

/**
 * A brand frame: the canvas and window chrome around the code. `style` carries
 * the canvas padding, background and radius; `children` is the code window;
 * `title` is the window title (the language) for frames whose header shows one.
 */
export type FrameComponent = React.FC<{
  style: React.CSSProperties;
  title: string;
  children: React.ReactNode;
}>;
