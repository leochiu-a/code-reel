import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ACCENT, MONO, SANS, SERIF, ease, shake, tw } from "../lib";
import { KINETIC as T } from "../timeline";

const INK = "#0b0b0b";
const PAPER = "#f3f2ee";

/** A word that slams in from oversize with a short blur, like a stamp. */
const Slam = ({
  f,
  at,
  children,
  style,
}: {
  f: number;
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => {
  const t = f - at;
  if (t < 0) return null;
  const p = ease.out(Math.min(1, t / 9));
  return (
    <div
      style={{
        transform: `scale(${1.9 - 0.9 * p})`,
        filter: `blur(${(1 - p) * 14}px)`,
        opacity: Math.min(1, t / 3),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Per-letter rise through a mask, each letter on its own delay. */
const Letters = ({
  text,
  f,
  at,
  step = 2,
  style,
}: {
  text: string;
  f: number;
  at: number;
  step?: number;
  style?: React.CSSProperties;
}) => (
  <div style={{ display: "flex", overflow: "hidden", padding: "0 0.08em", ...style }}>
    {[...text].map((ch, i) => {
      const p = tw(f, at + i * step, at + i * step + 16, 0, 1, ease.out);
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 12}deg)`,
            whiteSpace: "pre",
          }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

/** Characters settle out of random glyphs, left to right. */
const Decode = ({
  text,
  f,
  at,
  speed = 1.2,
}: {
  text: string;
  f: number;
  at: number;
  speed?: number;
}) => {
  const glyphs = "<>/{}[]=+*#$%01";
  return (
    <>
      {[...text].map((ch, i) => {
        const settle = at + i * speed + 6;
        if (f < at + i * speed * 0.5)
          return (
            <span key={i} style={{ opacity: 0 }}>
              {ch}
            </span>
          );
        const done = f >= settle || ch === " ";
        return (
          <span key={i} style={{ color: done ? undefined : ACCENT.green }}>
            {done ? ch : glyphs[Math.floor(random(`${i}-${Math.floor(f / 2)}`) * glyphs.length)]}
          </span>
        );
      })}
    </>
  );
};

export const Kinetic = () => {
  const f = useCurrentFrame();
  const [w1, w2, w3, w4, w5] = T.words;
  const hit = [w1, w2, w3, w4, w5].reduce(
    (acc, at) => {
      const s = shake(f, at, at === w5 ? 26 : 12, at === w5 ? 22 : 12);
      return { x: acc.x + s.x, y: acc.y + s.y };
    },
    { x: 0, y: 0 },
  );
  // Lines stack and climb as each new line lands.
  const climb = tw(f, w3, w3 + 10, 0, 1) * 130 + tw(f, w5, w5 + 12, 0, 1) * 110;
  const iris = tw(f, T.iris, T.iris + 20, 0, 1, ease.inOut);
  const caret = Math.floor(f / 15) % 2 === 0;
  // Holds keep breathing: a slow push-in instead of a frozen frame.
  const push = 1 + tw(f, w5, T.iris + 20, 0, 0.06, (t) => t);
  const introPush = 1.04 - tw(f, T.iris, 330, 0, 0.04, (t) => t);

  const type = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: `translate(${hit.x}px, ${hit.y - climb + 170}px)`,
        color: INK,
        lineHeight: 0.86,
      }}
    >
      <Slam
        f={f}
        at={w1}
        style={{ fontFamily: SANS, fontWeight: 900, fontSize: 205, letterSpacing: "-0.05em" }}
      >
        WRITE
      </Slam>
      <Slam
        f={f}
        at={w2}
        style={{
          fontFamily: MONO,
          fontWeight: 500,
          fontSize: 170,
          letterSpacing: "-0.04em",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ color: ACCENT.pink }}>{"<"}</span>code
        <span style={{ color: ACCENT.pink }}>{"/>"}</span>
        <span
          style={{
            display: "inline-block",
            width: 26,
            height: 150,
            marginLeft: 16,
            background: caret ? INK : "transparent",
          }}
        />
      </Slam>
      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "baseline",
          fontFamily: SANS,
          fontWeight: 900,
          fontSize: 205,
          letterSpacing: "-0.05em",
        }}
      >
        <Slam f={f} at={w3}>
          MAKE
        </Slam>
        <Slam f={f} at={w4}>
          IT
        </Slam>
      </div>
      {f >= w5 && (
        <div
          style={{
            position: "relative",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 300,
            letterSpacing: "-0.02em",
            marginTop: -20,
          }}
        >
          {[ACCENT.blue, ACCENT.pink].map((c, i) => (
            <div
              key={c}
              style={{
                position: "absolute",
                inset: 0,
                color: c,
                mixBlendMode: "multiply",
                transform: `translateX(${(i ? 1 : -1) * tw(f, w5, w5 + 20, 18, 0)}px)`,
              }}
            >
              <Letters text="move." f={f} at={w5} step={2} />
            </div>
          ))}
          <Letters
            text="move."
            f={f}
            at={w5}
            step={2}
            style={{ position: "relative", color: INK }}
          />
        </div>
      )}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
      {/* Guide grid, the designer's paper. */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          opacity: tw(f, 0, 20),
        }}
      />
      <AbsoluteFill
        style={{ alignItems: "center", justifyContent: "center", transform: `scale(${push})` }}
      >
        {type}
      </AbsoluteFill>
      {/* Iris into the dark product world. */}
      <AbsoluteFill
        style={{
          background: "#050505",
          clipPath: `circle(${iris * 75}% at 50% 50%)`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AbsoluteFill
          style={{
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${introPush})`,
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 30,
              color: "rgba(255,255,255,0.55)",
              letterSpacing: "0.3em",
              marginBottom: 26,
              opacity: tw(f, T.meet - 4, T.meet + 4),
            }}
          >
            <Decode text="INTRODUCING" f={f} at={T.meet - 4} />
          </div>
          <Letters
            text="CodeReel"
            f={f}
            at={T.meet}
            step={3}
            style={{
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 210,
              letterSpacing: "-0.055em",
              color: "#fff",
              lineHeight: 1.05,
            }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontSize: 40,
              color: "rgba(255,255,255,0.7)",
              marginTop: 26,
              opacity: tw(f, T.sub, T.sub + 6),
            }}
          >
            <Decode text="Turn code into polished walkthroughs." f={f} at={T.sub} speed={0.8} />
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
