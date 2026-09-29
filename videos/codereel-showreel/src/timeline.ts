// One source of truth for timing, shared by the video and the sound design.
// 60 fps, 120 BPM: one beat is 30 frames, and every cut lands on the grid.
// Fast moves carry the rhythm; anything with words holds long enough to read.
export const FPS = 60;
export const DURATION = 1820;
export const BEAT = 30;

export const SCENES = {
  ignition: { from: 0, duration: 120 },
  kinetic: { from: 120, duration: 330 },
  product: { from: 450, duration: 510 },
  themes: { from: 960, duration: 330 },
  export: { from: 1290, duration: 290 },
  end: { from: 1580, duration: 240 },
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
// The reel keeps playing through the Export scene: the image export grabs one
// frame of it, the video export renders the whole loop.
export const EXPORT_T = {
  imgOpen: 24,
  imgClick: 46,
  imgFlash: 54,
  move: 58,
  imgSaved: 94,
  vidOpen: 116,
  vidClick: 138,
  vidDone: 230,
  saved: 236,
};
// Magic Move loop: holds on step 3 until `start`, then each step holds and glides on.
export const EXPORT_REEL = { start: 50, hold: 20, move: 30 };
export const END = { mark: 0, word: 14, tagline: 44, url: 76, credit: 96 };
