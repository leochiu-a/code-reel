// Synthesizes the score and sound design straight from the video timeline,
// so every hit lands on its cut. Output: public/score.wav (48 kHz stereo).
import { writeFileSync } from "node:fs";
import {
  BEAT,
  DURATION,
  END,
  FPS,
  IGNITION,
  KINETIC,
  PRODUCT,
  SCENES,
  THEME_CUTS,
  THEMES_T,
} from "../src/timeline.ts";

const SR = 48000;
const N = Math.ceil((DURATION / FPS + 0.2) * SR);
const L = new Float32Array(N);
const R = new Float32Array(N);
const verbL = new Float32Array(N);
const verbR = new Float32Array(N);

let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const at = (frame: number) => Math.round((frame / FPS) * SR);

const add = (
  start: number,
  len: number,
  fn: (t: number, i: number) => number,
  gain = 1,
  pan = 0,
  send = 0,
) => {
  const gl = gain * Math.min(1, 1 - pan);
  const gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < len && start + i < N; i++) {
    if (start + i < 0) continue;
    const v = fn(i / SR, i);
    L[start + i] += v * gl;
    R[start + i] += v * gr;
    verbL[start + i] += v * gl * send;
    verbR[start + i] += v * gr * send;
  }
};

// --- Instruments -----------------------------------------------------------
const kick = (frame: number, g = 1) => {
  let ph = 0;
  add(
    at(frame),
    SR * 0.5,
    (t) => {
      ph += (2 * Math.PI * (42 + 140 * Math.exp(-t * 32))) / SR;
      return Math.sin(ph) * Math.exp(-t * 7) + (t < 0.004 ? rnd() * 0.4 : 0);
    },
    0.9 * g,
  );
};

const boom = (frame: number, g = 1) => {
  kick(frame, 1.1 * g);
  add(
    at(frame),
    SR * 2.2,
    (t) => Math.sin(2 * Math.PI * (38 + 20 * Math.exp(-t * 4)) * t) * Math.exp(-t * 1.6),
    0.7 * g,
  );
  let lp = 0;
  add(
    at(frame),
    SR * 1.4,
    (t) => ((lp += (rnd() - lp) * 0.08), lp * Math.exp(-t * 3.5)),
    1.4 * g,
    0,
    0.9,
  );
};

const snap = (frame: number, g = 1, pan = 0) => {
  let hp = 0;
  let prev = 0;
  add(
    at(frame),
    SR * 0.18,
    (t) => {
      const n = rnd();
      hp = 0.9 * (hp + n - prev);
      prev = n;
      return hp * Math.exp(-t * 28);
    },
    0.5 * g,
    pan,
    0.5,
  );
};

const hat = (frame: number, g = 1, pan = 0.2) => {
  let hp = 0;
  let prev = 0;
  add(
    at(frame),
    SR * 0.06,
    (t) => {
      const n = rnd();
      hp = 0.6 * (hp + n - prev);
      prev = n;
      return hp * Math.exp(-t * 70);
    },
    0.22 * g,
    pan,
  );
};

const click = (frame: number, g = 1, pan = 0) =>
  add(
    at(frame),
    SR * 0.02,
    (t, i) =>
      (i < 40 ? rnd() : 0) * Math.exp(-t * 400) +
      Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 300) * 0.5,
    0.35 * g,
    pan,
  );

const blip = (frame: number, freq: number, g = 1, len = 0.25) =>
  add(
    at(frame),
    SR * len,
    (t) => Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 14) * Math.min(1, t * 400),
    0.3 * g,
    0,
    0.6,
  );

// Band-passed noise sweep: a whoosh from `a` to `b` frames, rising or falling.
const whoosh = (a: number, b: number, g = 1, rising = true, pan = 0) => {
  const len = at(b) - at(a);
  let lp1 = 0;
  let lp2 = 0;
  add(
    at(a),
    len,
    (_t, i) => {
      const p = i / len;
      const env = Math.sin(Math.PI * Math.pow(p, rising ? 1.6 : 0.6));
      const cut = 0.01 + 0.25 * (rising ? p * p : (1 - p) ** 2);
      lp1 += (rnd() - lp1) * cut;
      lp2 += (lp1 - lp2) * cut;
      return (lp1 - lp2) * 3.2 * env;
    },
    0.9 * g,
    pan,
    0.4,
  );
};

const riser = (a: number, b: number, g = 1) => {
  const len = at(b) - at(a);
  let ph = 0;
  add(
    at(a),
    len,
    (_t, i) => {
      const p = i / len;
      ph += (2 * Math.PI * (180 + 1400 * p * p)) / SR;
      return (Math.sin(ph) * 0.4 + Math.sin(ph * 1.5) * 0.2) * p * p;
    },
    0.25 * g,
    0,
    0.5,
  );
  whoosh(a, b, 0.9 * g, true);
};

// Detuned saw pad through a one-pole lowpass.
const pad = (a: number, b: number, notes: number[], g = 1, bright = 0.04) => {
  const len = at(b) - at(a);
  const phases = notes.flatMap(() => [0, 0]);
  let lp = 0;
  add(
    at(a),
    len,
    (t, i) => {
      let v = 0;
      notes.forEach((n, k) => {
        for (const d of [0, 1]) {
          const idx = k * 2 + d;
          phases[idx] = (phases[idx] + (n * (d ? 1.006 : 0.997)) / SR) % 1;
          v += phases[idx] * 2 - 1;
        }
      });
      lp += (v - lp) * bright;
      const env = Math.min(1, t / 0.3) * Math.min(1, (len - i) / (SR * 0.4));
      return (lp / notes.length) * env;
    },
    0.16 * g,
    0,
    0.6,
  );
};

const bass = (frame: number, freq: number, len = 0.45, g = 1) => {
  let ph = 0;
  let lp = 0;
  add(
    at(frame),
    SR * len,
    (t) => {
      ph = (ph + freq / SR) % 1;
      lp += (ph * 2 - 1 - lp) * (0.02 + 0.1 * Math.exp(-t * 12));
      return (
        (lp * 1.4 + Math.sin(2 * Math.PI * freq * t) * 0.6) *
        Math.exp(-t * 3) *
        Math.min(1, t * 300)
      );
    },
    0.35 * g,
  );
};

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

// --- Arrangement -----------------------------------------------------------
const K = SCENES.kinetic.from;
const P = SCENES.product.from;
const TH = SCENES.themes.from;
const E = SCENES.end.from;

// 1. Ignition
pad(0, K, [hz(45), hz(52)], 0.8, 0.02);
blip(IGNITION.dot, 1760, 0.8);
whoosh(IGNITION.draw, IGNITION.triangle + 4, 0.5, true, -0.3);
blip(IGNITION.triangle, 880, 1.1, 0.4);
boom(IGNITION.burst, 0.45);
riser(IGNITION.zoom - 10, K, 1.2);

// 2. Kinetic type — every word is a hit
boom(K, 0.9);
KINETIC.words.forEach((w, i) => {
  kick(K + w, i === 4 ? 1.2 : 0.8);
  snap(K + w, i === 4 ? 1.4 : 0.9, i % 2 ? 0.3 : -0.3);
});
bass(K + KINETIC.words[4], hz(33), 0.9, 1.2);
for (let i = 0; i < 6; i++) click(K + KINETIC.slice - 8 + i * 2, 1.2, i % 2 ? 0.6 : -0.6);
whoosh(K + KINETIC.slice, K + KINETIC.iris + 14, 1.2, false);
for (let i = 0; i < 11; i++) click(K + KINETIC.meet - 4 + i * 1.2, 0.6, 0.4);
blip(K + KINETIC.meet + 10, 1320, 0.7);
pad(K + KINETIC.meet, P + 30, [hz(57), hz(64), hz(71)], 0.7, 0.05);
riser(K + KINETIC.sub, P, 0.7);

// 3–4. Product + themes: the beat drops
boom(P, 1);
const progression = [45, 45, 41, 43];
for (let b = 0; P + b * BEAT < E; b++) {
  const f = P + b * BEAT;
  const inFocus = f >= P + PRODUCT.focus && f < P + PRODUCT.focusOut;
  kick(f, b % 4 === 0 ? 1 : 0.85);
  hat(f + BEAT / 2, 1, 0.25);
  if (!inFocus) hat(f + BEAT / 4, 0.5, -0.25);
  if (b % 2 === 1) snap(f, 0.7);
  bass(f, hz(progression[Math.floor(b / 2) % 4] - 12), 0.4);
  bass(f + BEAT / 2, hz(progression[Math.floor(b / 2) % 4]), 0.2, 0.6);
}
pad(P, TH, [hz(57), hz(60), hz(64), hz(69)], 0.8, 0.03);
pad(TH, E, [hz(53), hz(57), hz(60), hz(65)], 0.8, 0.05);

const tokens = 15;
for (let i = 0; i < tokens; i++)
  click(P + PRODUCT.typeStart + i * PRODUCT.typePerToken, 1, ((i % 5) - 2) * 0.2);
click(P + PRODUCT.play, 1.6);
blip(P + PRODUCT.play, 1046, 0.6);
PRODUCT.moves.forEach((m) => {
  whoosh(P + m - 2, P + m + PRODUCT.moveLength, 0.55, false, 0.2);
  blip(P + m + PRODUCT.moveLength - 6, 1568, 0.35);
});
whoosh(P + PRODUCT.focus - 12, P + PRODUCT.focus + 2, 0.9, true);
snap(P + PRODUCT.focus, 1.2);
blip(P + PRODUCT.focus + 4, 2093, 0.6, 0.5);
whoosh(P + PRODUCT.exit - 6, TH + 8, 1.1, true);

THEME_CUTS.forEach((c, i) => {
  whoosh(TH + c - 5, TH + c + 8, 0.7, false, i % 2 ? 0.5 : -0.5);
  click(TH + c + 4, 0.8, i % 2 ? -0.4 : 0.4);
});
whoosh(TH + THEMES_T.deck - 4, TH + THEMES_T.deck + 30, 0.9, false);
riser(TH + THEMES_T.deck + 10, TH + THEMES_T.flash, 0.9);
// Shutter: two sharp clicks and a burst.
click(TH + THEMES_T.flash, 2.2);
click(TH + THEMES_T.flash + 3, 1.6);
boom(TH + THEMES_T.flash, 0.6);
[0, 5, 10].forEach((d, i) => blip(TH + THEMES_T.chips + d, [1318, 1568, 2093][i], 0.6));
riser(TH + THEMES_T.chips + 10, E, 1.1);

// 5. End card: final hit and a resolving chord that rings out
boom(E, 1.3);
pad(E, DURATION + 10, [hz(45), hz(57), hz(64), hz(69), hz(71), hz(76)], 1.1, 0.06);
blip(E + END.mark + 8, 880, 0.9, 0.6);
[0, 2, 4, 6, 8, 10, 12, 14].forEach((d, i) =>
  blip(E + END.word + d, hz([81, 83, 88, 93][i % 4]), 0.25, 0.4),
);
blip(E + END.url, 1760, 0.5, 0.8);

// --- Reverb (Schroeder: parallel combs into series allpasses) --------------
const reverb = (input: Float32Array, spread: number) => {
  const out = new Float32Array(N);
  for (const d of [1557, 1617, 1491, 1422].map((x) => x + spread)) {
    const buf = new Float32Array(d);
    let idx = 0;
    let lp = 0;
    for (let i = 0; i < N; i++) {
      const y = buf[idx];
      lp = y * 0.7 + lp * 0.3;
      buf[idx] = input[i] + lp * 0.82;
      out[i] += y * 0.25;
      idx = (idx + 1) % d;
    }
  }
  for (const d of [225, 556].map((x) => x + spread)) {
    const buf = new Float32Array(d);
    let idx = 0;
    for (let i = 0; i < N; i++) {
      const b = buf[idx];
      const y = -out[i] + b;
      buf[idx] = out[i] + b * 0.5;
      out[i] = y;
      idx = (idx + 1) % d;
    }
  }
  return out;
};
const wl = reverb(verbL, 0);
const wr = reverb(verbR, 23);

// --- Master: soft clip, fade, write 16-bit PCM ------------------------------
const fadeStart = at(DURATION - 24);
const pcm = Buffer.alloc(44 + N * 4);
let peak = 0;
for (let i = 0; i < N; i++) {
  const fade = i > fadeStart ? Math.max(0, 1 - (i - fadeStart) / (N - fadeStart)) : 1;
  const l = Math.tanh((L[i] + wl[i] * 0.35) * 0.75) * fade;
  const r = Math.tanh((R[i] + wr[i] * 0.35) * 0.75) * fade;
  peak = Math.max(peak, Math.abs(l), Math.abs(r));
  pcm.writeInt16LE(Math.round(l * 32000), 44 + i * 4);
  pcm.writeInt16LE(Math.round(r * 32000), 46 + i * 4);
}
pcm.write("RIFF", 0);
pcm.writeUInt32LE(36 + N * 4, 4);
pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20);
pcm.writeUInt16LE(2, 22);
pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 4, 28);
pcm.writeUInt16LE(4, 32);
pcm.writeUInt16LE(16, 34);
pcm.write("data", 36);
pcm.writeUInt32LE(N * 4, 40);
writeFileSync(new URL("../public/score.wav", import.meta.url), pcm);
console.log("score.wav written, peak", peak.toFixed(3));
