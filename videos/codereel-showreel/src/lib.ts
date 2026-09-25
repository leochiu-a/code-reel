import { Easing, interpolate } from "remotion";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

export const SANS = loadGeist("normal", {
  weights: ["400", "500", "600", "800", "900"],
  subsets: ["latin"],
}).fontFamily;
export const MONO = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
export const SERIF = loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;

export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.87, 0, 0.13, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
};

/** Clamped tween from frame a to b. */
export const tw = (
  f: number,
  a: number,
  b: number,
  from = 0,
  to = 1,
  e: (t: number) => number = ease.out,
) =>
  interpolate(f, [a, b], [from, to], {
    easing: e,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Damped shake that decays after an impact at frame `at`. */
export const shake = (f: number, at: number, amp: number, len = 18) => {
  const t = f - at;
  if (t < 0 || t > len) return { x: 0, y: 0 };
  const k = amp * (1 - t / len) ** 2;
  return { x: Math.sin(t * 2.7) * k, y: Math.cos(t * 3.9) * k };
};

export const ACCENT = {
  pink: "#ff4d8d",
  purple: "#c472fb",
  green: "#00ca50",
  blue: "#47a8ff",
  orange: "#ff9300",
};

export const CHAR = 0.6; // Geist Mono advance width in em
