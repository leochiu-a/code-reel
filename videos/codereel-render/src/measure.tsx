import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { Reel } from "./CodeReel";
import type { Scene } from "./scene";

const even = (n: number) => Math.ceil(n / 2) * 2;

/**
 * The frame's size comes from its CSS (padding, window controls, the branded
 * frames' own chrome), so it is laid out once off-screen and measured rather
 * than recomputed here. Rounded up to even numbers, as H.264 requires.
 */
export const measureReel = (scene: Scene) => {
  const host = document.createElement("div");
  host.style.cssText =
    "position: absolute; top: 0; left: 0; width: max-content; visibility: hidden";
  document.body.append(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<Reel scene={scene} frame={0} />));
    const { width, height } = host.getBoundingClientRect();
    return { width: even(width), height: even(height) };
  } finally {
    root.unmount();
    host.remove();
  }
};
