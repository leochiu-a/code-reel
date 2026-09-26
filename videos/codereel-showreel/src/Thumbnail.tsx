import { AbsoluteFill } from "remotion";
import data from "./tokens.json";
import { ACCENT, MONO, SANS, SERIF } from "./lib";
import { StaticCode, type Tok } from "./components/Code";
import { LogoMark } from "./components/LogoMark";
import { VercelFrame } from "./scenes/Product";

const FINAL = (data.pairs as { to: Tok[] }[])[1].to;

/** YouTube thumbnail: a four-word promise big enough to read at 320px wide. */
export const Thumbnail = () => (
  <AbsoluteFill style={{ background: "#050505", overflow: "hidden", fontFamily: SANS }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 55% 70% at 78% 55%, rgba(196,114,251,0.42), transparent 70%), radial-gradient(ellipse 40% 50% at 95% 95%, rgba(255,77,141,0.35), transparent 70%)",
      }}
    />
    <AbsoluteFill
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(circle at 75% 55%, black 20%, transparent 65%)",
      }}
    />

    {/* The editor frame, tilted, with the highlighted step. */}
    <div
      style={{
        position: "absolute",
        left: 560,
        top: 200,
        perspective: 1600,
      }}
    >
      <div
        style={{
          transform: "rotateY(-22deg) rotateX(10deg) scale(0.62)",
          transformOrigin: "0 0",
          boxShadow: "0 60px 140px rgba(0,0,0,0.85)",
        }}
      >
        <VercelFrame lines={0.4}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: -68,
                width: 1544,
                top: 2 * 74,
                height: 74,
                borderRadius: 10,
                background: "rgba(255,255,255,0.08)",
                borderLeft: `6px solid ${ACCENT.pink}`,
                boxShadow: "0 0 40px rgba(255,77,141,0.35)",
              }}
            />
            <StaticCode
              tokens={FINAL}
              m={{ size: 44, lh: 74 }}
              cols={51}
              lines={4}
              focus={{ line: 2, amount: 1 }}
            />
          </div>
        </VercelFrame>
      </div>
    </div>

    {/* Headline. */}
    <div style={{ position: "absolute", left: 64, top: 150, color: "#fff", lineHeight: 0.9 }}>
      <div style={{ fontWeight: 900, fontSize: 168, letterSpacing: "-0.055em" }}>Code</div>
      <div style={{ fontWeight: 900, fontSize: 168, letterSpacing: "-0.055em" }}>that</div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: "italic",
          fontSize: 200,
          letterSpacing: "-0.02em",
          color: ACCENT.pink,
          marginTop: -6,
        }}
      >
        moves.
      </div>
    </div>

    {/* Lockup. */}
    <div
      style={{
        position: "absolute",
        left: 68,
        top: 58,
        display: "flex",
        alignItems: "center",
        gap: 16,
        color: "#fff",
      }}
    >
      <LogoMark size={52} />
      <span style={{ fontWeight: 700, fontSize: 36, letterSpacing: "-0.03em" }}>CodeReel</span>
    </div>
    <div
      style={{
        position: "absolute",
        right: 56,
        top: 66,
        fontFamily: MONO,
        fontSize: 22,
        letterSpacing: "0.16em",
        color: "rgba(255,255,255,0.6)",
      }}
    >
      SHOWREEL ’26
    </div>
  </AbsoluteFill>
);
