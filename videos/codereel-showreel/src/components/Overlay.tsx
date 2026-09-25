import { AbsoluteFill, useCurrentFrame } from "remotion";
import { DURATION, FPS, SCENES } from "../timeline";
import { MONO } from "../lib";

const LABELS: [number, string][] = [
  [SCENES.ignition.from, "01 / 05  IGNITION"],
  [SCENES.kinetic.from, "02 / 05  TYPE"],
  [SCENES.product.from, "03 / 05  PRODUCT"],
  [SCENES.themes.from, "04 / 05  THEMES"],
  [SCENES.end.from, "05 / 05  CODEREEL"],
];

const tc = (f: number) => {
  const s = Math.floor(f / FPS);
  const ff = f % FPS;
  return `00:00:${String(s).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
};

/** Showreel HUD: timecode, scene index and credit, blended so it reads on any scene. */
export const Hud = () => {
  const f = useCurrentFrame();
  const label = LABELS.toReversed().find(([at]) => f >= at)![1];
  const on = Math.min(1, f / 20) * Math.min(1, (DURATION - f) / 10);
  const style: React.CSSProperties = {
    position: "absolute",
    fontFamily: MONO,
    fontSize: 15,
    letterSpacing: "0.14em",
    color: "#fff",
  };
  return (
    <AbsoluteFill style={{ mixBlendMode: "difference", opacity: 0.55 * on, pointerEvents: "none" }}>
      <div style={{ ...style, left: 56, top: 44 }}>CODEREEL — SHOWREEL ’26</div>
      <div style={{ ...style, right: 56, top: 44, fontVariantNumeric: "tabular-nums" }}>
        <span
          style={{
            display: "inline-block",
            width: 9,
            height: 9,
            borderRadius: 9,
            background: "#ff3b3b",
            marginRight: 12,
            opacity: Math.floor(f / 30) % 2 ? 0.3 : 1,
          }}
        />
        REC {tc(f)}
      </div>
      <div style={{ ...style, left: 56, bottom: 44 }}>{label}</div>
      <div style={{ ...style, right: 56, bottom: 44 }}>MOTION & CODE — CLAUDE</div>
      <div
        style={{
          position: "absolute",
          left: 56,
          right: 56,
          bottom: 30,
          height: 1,
          background: "rgba(255,255,255,0.18)",
        }}
      >
        <div style={{ width: `${(f / (DURATION - 1)) * 100}%`, height: 1, background: "#fff" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Animated film grain and vignette. */
export const Grain = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.22 }}
      >
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={f % 12}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
