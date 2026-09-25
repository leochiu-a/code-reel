// One source of truth for timing, shared by the video and the sound design.
// 60 fps, 120 BPM: one beat is 30 frames, and every cut lands on the grid.
// Fast moves carry the rhythm; anything with words holds long enough to read.
export const FPS = 60;
export const DURATION = 1710;
export const BEAT = 30;

export const SCENES = {
  ignition: { from: 0, duration: 120 },
  kinetic: { from: 120, duration: 330 },
  product: { from: 450, duration: 510 },
  themes: { from: 960, duration: 330 },
  export: { from: 1290, duration: 180 },
  end: { from: 1470, duration: 240 },
} as const;

// Frames local to each scene.
export const IGNITION = { dot: 10, draw: 26, triangle: 52, burst: 64, zoom: 92 };
export const KINETIC = { words: [0, 30, 60, 75, 90], iris: 140, meet: 152, sub: 176 };
export const PRODUCT = {
  flyIn: 0,
  typeStart: 30,
  typePerToken: 3.5,
  play: 150,
  moves: [162, 260],
  moveLength: 34,
  focus: 360,
  focusOut: 440,
  exit: 488,
};
export const THEME_CUTS = [0, 44, 88, 132, 162, 184, 200, 212];
export const THEMES_T = { drawer: 6, deck: 232, collapse: 300 };
export const EXPORT_T = {
  open: 18,
  scale: 48,
  click: 76,
  flash: 86,
  folder: 88,
  lift: 96,
  drop: 114,
  shut: 128,
};
export const END = { mark: 0, word: 14, tagline: 44, url: 76, credit: 96 };
