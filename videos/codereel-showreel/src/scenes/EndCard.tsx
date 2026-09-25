import { AbsoluteFill, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, MONO, SANS, ease, shake, tw } from "../lib";
import { END as T } from "../timeline";
import { LogoMark } from "../components/LogoMark";

const WORD = "CodeReel";
const TAGLINE = ["Animate", "every", "highlight.", "Share", "every", "step."];

/** Code glyphs drifting up in parallax, a quiet bed behind the lockup. */
const Drift = ({ f }: { f: number }) => (
  <>
    {Array.from({ length: 36 }, (_, i) => {
      const depth = 0.3 + random(`z${i}`) * 0.7;
      const x = random(`x${i}`) * 1920;
      const y = 1080 - ((random(`y${i}`) * 1300 + f * 3 * depth) % 1300);
      const glyph = ["{ }", "=>", "</>", "()", "fn", "60", "▶", "[]", "&&"][i % 9];
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            fontFamily: MONO,
            fontSize: 18 + depth * 26,
            color: `rgba(255,255,255,${0.04 + depth * 0.08})`,
            filter: `blur(${(1 - depth) * 3}px)`,
          }}
        >
          {glyph}
        </div>
      );
    })}
  </>
);

export const EndCard = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const draw = tw(f, T.mark, T.mark + 16, 0, 1, ease.inOut);
  const pop = spring({ frame: f - T.mark - 8, fps, config: { damping: 9, stiffness: 170 } });
  const lock = tw(f, T.word - 2, T.word + 22, 0, 1, ease.out);
  const s = shake(f, 0, 18, 18);
  const sweep = tw(f, T.url + 6, T.url + 36, -30, 130, ease.inOut);
  const fadeOut = 1 - tw(f, 228, 240);

  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden", opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 50% 45% at 50% 48%, rgba(196,114,251,0.22), rgba(255,77,141,0.08) 45%, transparent 75%)`,
          opacity: tw(f, 0, 30),
        }}
      />
      <Drift f={f} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          transform: `translate(${s.x}px, ${s.y}px)`,
        }}
      >
        {/* Lockup: mark slides left as the wordmark rises beside it. */}
        <div
          style={{ display: "flex", alignItems: "center", gap: 36, transform: `translateY(-60px)` }}
        >
          <div
            style={{ transform: `translateX(${(1 - lock) * 330}px) scale(${1.5 - lock * 0.5})` }}
          >
            <LogoMark size={190} draw={draw} pop={f >= T.mark + 8 ? pop : 0} glow={12} />
          </div>
          <div
            style={{
              position: "relative",
              display: "flex",
              overflow: "hidden",
              padding: "10px 28px 26px 6px",
            }}
          >
            {[...WORD].map((ch, i) => {
              const p = tw(f, T.word + i * 2, T.word + i * 2 + 20, 0, 1, ease.out);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    fontFamily: SANS,
                    fontWeight: 800,
                    fontSize: 200,
                    letterSpacing: "-0.055em",
                    color: "#fff",
                    lineHeight: 1,
                    transform: `translateY(${(1 - p) * 120}%)`,
                    filter: `blur(${(1 - p) * 8}px)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
            {/* Specular sweep across the wordmark. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(105deg, transparent ${sweep - 12}%, rgba(255,255,255,0.75) ${sweep}%, transparent ${sweep + 12}%)`,
                mixBlendMode: "overlay",
              }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 20,
            fontFamily: SANS,
            fontSize: 46,
            fontWeight: 500,
            letterSpacing: "-0.02em",
            transform: "translateY(-40px)",
          }}
        >
          {TAGLINE.map((w, i) => {
            const p = tw(f, T.tagline + i * 3, T.tagline + i * 3 + 14, 0, 1, ease.out);
            return (
              <span
                key={i}
                style={{
                  color: i >= 3 ? "#fff" : "rgba(255,255,255,0.6)",
                  opacity: p,
                  filter: `blur(${(1 - p) * 10}px)`,
                  transform: `translateY(${(1 - p) * 20}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 50,
            opacity: tw(f, T.url, T.url + 10),
            transform: `translateY(${tw(f, T.url, T.url + 16, 30, 0)}px)`,
          }}
        >
          <div
            style={{
              padding: "16px 34px",
              borderRadius: 999,
              background: "#fff",
              color: "#000",
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 30,
            }}
          >
            Try it free →
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 28,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.04em",
            }}
          >
            codereel.dev
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 110,
            fontFamily: MONO,
            fontSize: 18,
            letterSpacing: "0.24em",
            color: "rgba(255,255,255,0.5)",
            opacity: tw(f, T.credit, T.credit + 12),
          }}
        >
          RUNS IN YOUR BROWSER · NO BACKEND ·{" "}
          <span style={{ color: ACCENT.pink }}>MADE WITH REMOTION</span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
