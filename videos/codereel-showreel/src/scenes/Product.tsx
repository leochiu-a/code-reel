import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import data from "../tokens.json";
import { ACCENT, CHAR, SANS, ease, tw } from "../lib";
import { PRODUCT as T, SCENES } from "../timeline";
import { MagicCode, StaticCode, type Tok } from "../components/Code";
import { Caption } from "../components/Caption";

const M = { size: 44, lh: 74 };
const CW = M.size * CHAR;
const COLS = 51;
const LINES = 4;
const PAD = 80;
export const FRAME_W = COLS * CW + PAD * 2;
export const FRAME_H = LINES * M.lh + PAD * 2;

const [p0, p1] = data.pairs as { from: Tok[]; to: Tok[] }[];

const cross = (s: React.CSSProperties) => (
  <div style={{ position: "absolute", width: 26, height: 26, ...s }}>
    <div
      style={{
        position: "absolute",
        left: 12,
        top: 0,
        width: 1.5,
        height: 26,
        background: "#8f8f8f",
      }}
    />
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 0,
        height: 1.5,
        width: 26,
        background: "#8f8f8f",
      }}
    />
  </div>
);

/** Vercel frame: black panel, hairlines running past the edges, corner crosses. */
export const VercelFrame = ({
  children,
  lines = 1,
}: {
  children: React.ReactNode;
  lines?: number;
}) => {
  const ext = 260 * lines;
  return (
    <div style={{ position: "relative", width: FRAME_W, height: FRAME_H, background: "#000" }}>
      {[0, FRAME_H].map((y) => (
        <div
          key={`h${y}`}
          style={{
            position: "absolute",
            top: y,
            left: -ext,
            width: FRAME_W + ext * 2,
            height: 1,
            background: "#262626",
          }}
        />
      ))}
      {[0, FRAME_W].map((x) => (
        <div
          key={`v${x}`}
          style={{
            position: "absolute",
            left: x,
            top: -ext,
            height: FRAME_H + ext * 2,
            width: 1,
            background: "#262626",
          }}
        />
      ))}
      {cross({ left: -13, top: -13 })}
      {cross({ right: -13, bottom: -13 })}
      <div style={{ position: "absolute", left: PAD, top: PAD }}>{children}</div>
    </div>
  );
};

const STEPS_UI = ["Step 1", "Step 2", "Step 3"];

const Toolbar = ({ f, step }: { f: number; step: number }) => {
  const { fps } = useVideoConfig();
  const press = f >= T.play ? 1 - 0.12 * Math.sin(Math.min(1, (f - T.play) / 8) * Math.PI) : 1;
  const ripple = tw(f, T.play, T.play + 22);
  const pill =
    spring({ frame: f - T.moves[0], fps, config: { damping: 14, stiffness: 140 } }) +
    spring({ frame: f - T.moves[1], fps, config: { damping: 14, stiffness: 140 } });
  const shown = step;
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center", fontFamily: SANS, fontSize: 24 }}>
      <div
        style={{
          position: "relative",
          display: "flex",
          padding: 6,
          borderRadius: 999,
          background: "#161616",
          border: "1px solid #2a2a2a",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 6,
            left: 6,
            width: 124,
            height: 48,
            borderRadius: 999,
            background: "#fff",
            transform: `translateX(${pill * 124}px)`,
          }}
        />
        {STEPS_UI.map((s, i) => (
          <div
            key={s}
            style={{
              position: "relative",
              width: 124,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: i === shown ? "#000" : "#8a8a8a",
              fontWeight: 500,
            }}
          >
            {s}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          width: 60,
          height: 60,
          borderRadius: 999,
          background: ACCENT.pink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${press})`,
        }}
      >
        {ripple > 0 && ripple < 1 && (
          <div
            style={{
              position: "absolute",
              inset: -ripple * 40,
              borderRadius: 999,
              border: `2px solid ${ACCENT.pink}`,
              opacity: 1 - ripple,
            }}
          />
        )}
        <svg width="24" height="24" viewBox="0 0 24 24">
          <path
            d="M8 5.5v13a1 1 0 0 0 1.5.86l10-6.5a1 1 0 0 0 0-1.72l-10-6.5A1 1 0 0 0 8 5.5Z"
            fill="#fff"
          />
        </svg>
      </div>
    </div>
  );
};

export const Product = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [m0, m1] = T.moves;
  const L = T.moveLength;

  // Code state machine: type step 1, then Magic Move into steps 2 and 3.
  const reveal = (f - T.typeStart) / T.typePerToken;
  let code: React.ReactNode;
  if (f < m0)
    code = <StaticCode tokens={p0.from} m={M} cols={COLS} lines={LINES} reveal={reveal} />;
  else if (f < m1)
    code = (
      <MagicCode
        from={p0.from}
        to={p0.to}
        p={Math.min(1, (f - m0) / L)}
        m={M}
        cols={COLS}
        lines={LINES}
        focus={{ line: 1, amount: tw(f, m0 + L - 6, m0 + L + 10) }}
      />
    );
  else
    code = (
      <MagicCode
        from={p1.from}
        to={p1.to}
        p={Math.min(1, (f - m1) / L)}
        m={M}
        cols={COLS}
        lines={LINES}
        focus={{
          line: interpolate(ease.inOut(tw(f, m1, m1 + L, 0, 1, (t) => t)), [0, 1], [1, 2]),
          amount: 1 - tw(f, m1, m1 + 8) + tw(f, m1 + L - 6, m1 + L + 10),
        }}
      />
    );
  const step = f < m0 ? 0 : f < m1 ? 1 : 2;

  // Highlight bar glides to the focused line.
  const barLine = interpolate(tw(f, m1, m1 + L, 0, 1, ease.inOut), [0, 1], [1, 2]);
  const barOn =
    tw(f, m0 + L - 10, m0 + L + 6) * (1 - 0.6 * (tw(f, m1, m1 + 8) - tw(f, m1 + L - 8, m1 + L)));

  // Typing caret sits after the newest token.
  const shownTokens = Math.max(0, Math.min(p0.from.length, Math.ceil(reveal)));
  const last = p0.from[Math.max(0, shownTokens - 1)];
  const caretX = shownTokens ? (last.x + last.t.length) * CW : 0;
  const caretY = shownTokens ? last.l * M.lh : 0;
  const caretOn =
    f < m0 &&
    (f < T.typeStart + p0.from.length * T.typePerToken + 4 || Math.floor(f / 15) % 2 === 0);

  // Camera: 3D fly-in, slow drift, push in on the highlighted line, whip out.
  const fly = spring({
    frame: f - T.flyIn,
    fps,
    config: { damping: 18, stiffness: 70, mass: 1.1 },
  });
  const focus =
    tw(f, T.focus, T.focus + 30, 0, 1, ease.inOut) *
    (1 - tw(f, T.focusOut, T.focusOut + 30, 0, 1, ease.inOut));
  const LEN = SCENES.product.duration;
  const exit = tw(f, T.exit, LEN, 0, 1, ease.in);
  const drift = interpolate(f, [0, LEN], [-9, 7]);
  const rx = interpolate(fly, [0, 1], [62, 10]) * (1 - focus) + exit * 4;
  const ry = drift * (1 - focus) - exit * 60;
  const rz = interpolate(fly, [0, 1], [-14, 0]);
  const z = interpolate(fly, [0, 1], [-2600, 0]) + focus * 0;
  const scale = 1 + focus * 0.3 + tw(f, 0, LEN, 0, 0.06, (t) => t);
  // Push-in target: the centre of the highlighted line 2 (cols 2–51).
  const tx = -focus * (26.5 * CW + PAD - FRAME_W / 2) * scale - exit * 2400;
  const ty =
    -focus * (2 * M.lh + M.lh / 2 + PAD - FRAME_H / 2) * scale + interpolate(fly, [0, 1], [500, 0]);
  const glow = focus;

  // Lines of the stage grid extend outward as the scene opens.
  const grid = tw(f, 4, 60, 0, 1, ease.out);

  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 55%, rgba(196,114,251,${0.16 + focus * 0.1}), rgba(0,0,0,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          backgroundPosition: "center",
          maskImage: `radial-gradient(circle at 50% 55%, black ${grid * 30}%, transparent ${grid * 70}%)`,
          transform: `translateX(${-exit * 600}px)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          perspective: 2200,
          filter: exit > 0 ? `blur(${exit * 16}px)` : undefined,
        }}
      >
        <div
          style={{
            transform: `translate3d(${tx}px, ${ty + 40}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${scale})`,
            transformStyle: "preserve-3d",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 44,
          }}
        >
          <div
            style={{ boxShadow: "0 80px 160px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)" }}
          >
            <VercelFrame lines={grid}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: -PAD + 12,
                    width: FRAME_W - 24,
                    top: barLine * M.lh,
                    height: M.lh,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.07)",
                    borderLeft: `4px solid ${ACCENT.pink}`,
                    boxShadow: `0 0 ${40 * glow}px rgba(255,77,141,${0.35 * glow})`,
                    opacity: barOn,
                  }}
                />
                {code}
                {caretOn && (
                  <div
                    style={{
                      position: "absolute",
                      left: caretX + 4,
                      top: caretY + 10,
                      width: 4,
                      height: M.lh - 20,
                      background: "#fff",
                    }}
                  />
                )}
              </div>
            </VercelFrame>
          </div>
          <div style={{ opacity: tw(f, 30, 50) * (1 - focus) }}>
            <Toolbar f={f} step={step} />
          </div>
        </div>
      </AbsoluteFill>
      <Caption
        f={f}
        cues={[
          { at: T.typeStart, num: "01", text: "Write each step", color: ACCENT.green },
          {
            at: T.play - 10,
            num: "02",
            text: "Hit play. Watch it Magic Move.",
            color: ACCENT.pink,
          },
          { at: m1 + L, num: "03", text: "Highlight what matters", color: ACCENT.purple },
        ]}
      />
    </AbsoluteFill>
  );
};
