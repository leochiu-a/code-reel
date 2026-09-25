import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, MONO, ease, tw } from "../lib";
import { IGNITION as T } from "../timeline";
import { LogoMark, chevronHead } from "../components/LogoMark";

const SIZE = 420; // rendered width of the mark (viewBox is 26 wide, origin x=3, y=7)
const u = SIZE / 26;
const px = (x: number, y: number) => [(x - 3) * u - SIZE / 2, (y - 7) * u - (18 * u) / 2] as const;

const Sparks = ({ f }: { f: number }) => {
  const t = f - T.burst;
  if (t < 0 || t > 30) return null;
  const colors = Object.values(ACCENT);
  return (
    <>
      {Array.from({ length: 28 }, (_, i) => {
        const a = (i / 28) * Math.PI * 2 + random(`a${i}`) * 0.3;
        const dist = 160 + random(`d${i}`) * 420;
        const p = ease.out(Math.min(1, t / 26));
        const len = (1 - p) * (40 + random(`l${i}`) * 90);
        const r0 = 120 + dist * p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: len,
              height: 3,
              borderRadius: 3,
              background: colors[i % colors.length],
              transform: `rotate(${a}rad) translateX(${r0}px)`,
              transformOrigin: "0 50%",
              opacity: 1 - p,
            }}
          />
        );
      })}
      {[0, 6].map((d) => {
        const p = ease.out(Math.max(0, Math.min(1, (t - d) / 24)));
        return (
          <div
            key={d}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 900 * p,
              height: 900 * p,
              marginLeft: -450 * p,
              marginTop: -450 * p,
              borderRadius: "50%",
              border: `${2 + (1 - p) * 6}px solid rgba(255,255,255,${0.7 * (1 - p)})`,
            }}
          />
        );
      })}
    </>
  );
};

export const Ignition = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dotIn = spring({ frame: f - T.dot, fps, config: { damping: 11, stiffness: 180 } });
  const draw = tw(f, T.draw, T.triangle + 4, 0, 1, ease.inOut);
  const pop = spring({ frame: f - T.triangle, fps, config: { damping: 9, stiffness: 160 } });
  // Punch into the play triangle: its white fills the frame for the match cut.
  const zoom = tw(f, T.zoom, 120, 0, 1, ease.in);
  const scale =
    1 +
    zoom * 70 +
    (f > T.burst && f < T.zoom
      ? Math.sin((f - T.burst) * 0.5) * 0.02 * (1 - (f - T.burst) / 16)
      : 0);
  const [hx, hy] = chevronHead(draw);
  const [dx, dy] = f < T.draw ? px(12, 9.5) : px(hx, hy);
  const [cx, cy] = px(20.1, 16);
  const dotSize = f < T.draw ? 22 * dotIn : 22 * (1 - draw) + 8;
  const idle = f < T.draw ? Math.sin(f * 0.6) * 2 : 0;

  return (
    <AbsoluteFill
      style={{
        background: "#050505",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(71,168,255,0.16), rgba(0,0,0,0) 55%)",
          opacity: tw(f, T.burst, T.burst + 10),
        }}
      />
      <Sparks f={f} />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(${cx}px, ${cy}px) scale(${scale}) translate(${-cx}px, ${-cy}px)`,
        }}
      >
        <div style={{ position: "absolute", left: -SIZE / 2, top: (-18 * u) / 2 }}>
          <LogoMark
            size={SIZE}
            draw={draw}
            pop={f >= T.triangle ? pop : 0}
            glow={tw(f, T.burst, T.burst + 20, 30, 6)}
          />
        </div>
        {draw < 1 && (
          <div
            style={{
              position: "absolute",
              left: dx - dotSize / 2,
              top: dy - dotSize / 2 + idle,
              width: dotSize,
              height: dotSize,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 0 40px 8px rgba(255,255,255,0.6)",
            }}
          />
        )}
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          marginTop: 190,
          fontFamily: MONO,
          fontSize: 22,
          letterSpacing: `${tw(f, T.burst, T.burst + 30, 1.2, 0.5)}em`,
          color: "rgba(255,255,255,0.6)",
          opacity: tw(f, T.burst + 2, T.burst + 14) * (1 - tw(f, T.zoom, T.zoom + 8)),
        }}
      >
        SHOWREEL — 2026
      </div>
    </AbsoluteFill>
  );
};
