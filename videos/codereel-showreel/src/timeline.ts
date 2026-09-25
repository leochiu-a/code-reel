// One source of truth for timing, shared by the video and the sound design.
// 60 fps, 120 BPM: one beat is 30 frames, and every cut lands on the grid.
export const FPS = 60;
export const DURATION = 900;
export const BEAT = 30;

export const SCENES = {
  ignition: { from: 0, duration: 90 },
  kinetic: { from: 90, duration: 150 },
  product: { from: 240, duration: 300 },
  themes: { from: 540, duration: 240 },
  end: { from: 780, duration: 120 },
} as const;

// Frames local to each scene.
export const IGNITION = { dot: 6, draw: 18, triangle: 38, burst: 48, zoom: 64 };
export const KINETIC = { words: [0, 15, 30, 45, 60], slice: 84, iris: 100, meet: 108, sub: 124 };
export const PRODUCT = {
  flyIn: 0,
  typeStart: 18,
  typePerToken: 3.4,
  play: 88,
  moves: [100, 180],
  moveLength: 40,
  focus: 232,
  focusOut: 268,
  exit: 288,
};
export const THEME_CUTS = [0, 22, 42, 60, 76, 90, 102, 112];
export const THEMES_T = { deck: 126, collapse: 176, flash: 184, chips: 196 };
export const END = { mark: 0, word: 14, tagline: 40, url: 60, credit: 76 };
