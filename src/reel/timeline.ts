import { cubicBezier } from "motion";
import {
  HIGHLIGHT_STEP_DELAY_MS,
  MAGIC_MOVE_DELAY_MOVE_S,
  MAGIC_MOVE_DURATION_MS,
} from "../constants";
import type { Scene } from "./scene";

export const FPS = 60;

// The editor's Magic Move options (components/CodeEditor.tsx): leave and
// enter keep the library defaults. Delays are ratios of the duration.
const DURATION = MAGIC_MOVE_DURATION_MS;
const DELAY_LEAVE = 0;
const DELAY_MOVE = MAGIC_MOVE_DELAY_MOVE_S;
const DELAY_ENTER = 0.7;
const DELAY_CONTAINER = 0.4;
// CSS `ease`, the library's default easing.
const EASE = cubicBezier(0.25, 0.1, 0.25, 1);

const TRANSITION_MS =
  DURATION * (1 + Math.max(DELAY_LEAVE, DELAY_MOVE, DELAY_ENTER, DELAY_CONTAINER));

const toFrames = (ms: number) => Math.ceil((ms / 1000) * FPS);

export const transitionFrames = toFrames(TRANSITION_MS);
export const holdFrames = (scene: Scene) => toFrames(scene.hold * 1000);

/** Every step holds once, and each step after the first is preceded by its transition. */
export const sceneDuration = (scene: Scene) =>
  holdFrames(scene) + scene.transitions.length * (transitionFrames + holdFrames(scene));

export type Moment =
  | { kind: "still"; step: number }
  | { kind: "transition"; index: number; ms: number };

export const momentAt = (scene: Scene, frame: number): Moment => {
  const hold = holdFrames(scene);
  if (frame < hold) return { kind: "still", step: 0 };
  const segment = transitionFrames + hold;
  const index = Math.min(Math.floor((frame - hold) / segment), scene.transitions.length - 1);
  const local = frame - hold - index * segment;
  if (local < transitionFrames) return { kind: "transition", index, ms: (local / FPS) * 1000 };
  return { kind: "still", step: index + 1 };
};

const clampedEase = (ms: number, delay: number, duration: number) =>
  EASE(Math.min(1, Math.max(0, (ms - delay) / duration)));

export const leaveProgress = (ms: number) => clampedEase(ms, DELAY_LEAVE * DURATION, DURATION);
export const moveProgress = (ms: number) => clampedEase(ms, DELAY_MOVE * DURATION, DURATION);
export const enterProgress = (ms: number) => clampedEase(ms, DELAY_ENTER * DURATION, DURATION);
/** The code container resizes to the next step's lines, as Magic Move's `animateContainer`. */
export const containerProgress = (ms: number) =>
  clampedEase(ms, DELAY_CONTAINER * DURATION, DURATION);

// The editor's highlight bars (components/CodeEditor.tsx): a bar slides to
// its next line like a token moves, and added or dropped bars fade.
const HIGHLIGHT_FADE_MS = 400;

export const highlightMoveProgress = (ms: number) =>
  clampedEase(ms, HIGHLIGHT_STEP_DELAY_MS, DURATION);
export const highlightFadeProgress = (ms: number) =>
  clampedEase(ms, HIGHLIGHT_STEP_DELAY_MS, HIGHLIGHT_FADE_MS);
