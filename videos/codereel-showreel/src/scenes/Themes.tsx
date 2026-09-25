import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import data from "../tokens.json";
import { ACCENT, SANS, ease, tw } from "../lib";
import { THEME_CUTS as CUTS, THEMES_T as T } from "../timeline";
import { StaticCode, type Tok } from "../components/Code";
import { Caption } from "../components/Caption";
import { FRAME_W, VercelFrame } from "./Product";

type Theme = { id: string; label: string; fg: string; bg: string; tokens: Tok[] };
export const THEMES = data.themes as Theme[];
const M = { size: 44, lh: 74 };
const W = 1920;
const H = 1080;

// Outer backgrounds, matching CodeReel's THEME_BACKGROUND_MAP.
const OUTER: Record<string, string> = {
  vercel: "#000000",
  tailwind: "linear-gradient(140deg, #0f172a, #0b1220)",
  prisma: "linear-gradient(140deg, #0c1d26 0%, #0a0c17 100%)",
  trigger: "#121317",
  "synthwave-84": "linear-gradient(to right top, #7f469d, #8338c4, #9b38ea, #c24af2, #e65ffb)",
  poimandres: "linear-gradient(140deg, rgb(165, 142, 251), rgb(65, 206, 189))",
  dracula: "linear-gradient(135deg, rgba(171,73,222,1) 0%, rgba(73,84,222,1) 100%)",
  "night-owl":
    "linear-gradient(140deg, rgb(9, 171, 241), rgb(5, 105, 148), rgb(4, 84, 118), rgb(6, 119, 167))",
};

const Window = ({ theme }: { theme: Theme }) => {
  const code = <StaticCode tokens={theme.tokens} m={M} cols={51} lines={4} />;
  if (theme.id === "vercel") return <VercelFrame>{code}</VercelFrame>;
  const brand = ["tailwind", "prisma", "trigger"].includes(theme.id);
  const border =
    theme.id === "prisma"
      ? {
          border: "1.5px solid transparent",
          background: `linear-gradient(${theme.bg}, ${theme.bg}) padding-box, linear-gradient(140deg, #3e4083, #16544f) border-box`,
        }
      : theme.id === "tailwind"
        ? { border: "1px solid rgba(210,235,255,0.2)", background: "rgba(17,24,39,0.92)" }
        : { border: "1px solid rgba(255,255,255,0.1)", background: theme.bg };
  return (
    <div style={{ position: "relative" }}>
      {theme.id === "tailwind" && (
        <div
          style={{
            position: "absolute",
            top: -220,
            left: "50%",
            width: 1200,
            height: 480,
            transform: "translateX(-50%)",
            background:
              "radial-gradient(closest-side at 28% 25%, rgba(56,189,248,0.45), transparent), radial-gradient(closest-side at 72% 18%, rgba(236,72,153,0.45), transparent)",
            filter: "blur(12px)",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: FRAME_W,
          borderRadius: 18,
          boxShadow: "0 50px 120px rgba(0,0,0,0.5)",
          overflow: "hidden",
          ...border,
        }}
      >
        {!brand && (
          <div style={{ display: "flex", gap: 12, padding: "26px 32px 0" }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 16, background: c }} />
            ))}
          </div>
        )}
        <div style={{ padding: brand ? 80 : "40px 80px 80px" }}>{code}</div>
      </div>
    </div>
  );
};

/** A full-bleed theme plate: the theme's backdrop with its window centred. */
export const Plate = ({
  theme,
  dots,
  shift = 0,
}: {
  theme: Theme;
  dots?: boolean;
  shift?: number;
}) => (
  <AbsoluteFill
    style={{ background: OUTER[theme.id], alignItems: "center", justifyContent: "center" }}
  >
    {theme.id === "trigger" && dots && (
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "32px 32px",
        }}
      />
    )}
    {/* `shift` makes room for the theme drawer on the right. */}
    <div style={{ transform: `translateX(${-250 * shift}px) scale(${1 - 0.24 * shift})` }}>
      <Window theme={theme} />
    </div>
  </AbsoluteFill>
);

const ITEM = 96;

/** The editor's theme drawer: a sheet on the right with a sliding selection. */
const Drawer = ({ f, open }: { f: number; open: number }) => {
  const sel = CUTS.reduce(
    (acc, c, i) => (i === 0 ? 0 : acc + tw(f, c, c + 10, 0, 1, ease.inOut)),
    0,
  );
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        width: 460,
        padding: "150px 28px 0",
        background: "rgba(20,20,20,0.94)",
        borderLeft: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "-40px 0 120px rgba(0,0,0,0.5)",
        transform: `translateX(${(1 - open) * 520}px)`,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: "rgba(255,255,255,0.5)",
          marginBottom: 22,
        }}
      >
        THEMES
      </div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: sel * ITEM,
            height: ITEM - 12,
            borderRadius: 16,
            background: "rgba(255,255,255,0.1)",
            border: "1.5px solid rgba(255,255,255,0.7)",
          }}
        />
        {THEMES.map((t, i) => {
          const active = Math.abs(sel - i) < 0.5;
          return (
            <div
              key={t.id}
              style={{
                position: "relative",
                height: ITEM - 12,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 20,
                padding: "0 18px",
                color: active ? "#fff" : "rgba(255,255,255,0.55)",
                fontSize: 28,
                fontWeight: active ? 600 : 500,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 12,
                  background: OUTER[t.id],
                  border: "1px solid rgba(255,255,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 22,
                    borderRadius: 5,
                    background: t.bg,
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                />
              </div>
              {t.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Whip direction per cut: right, up, left, down, and around again.
const DIRS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];
const WHIP = 9;

const offsetAt = (i: number, f: number) => {
  const [dx, dy] = DIRS[i % 4];
  // The first plate starts mid-whip, carrying the product scene's exit.
  const start = i === 0 ? -5 : CUTS[i];
  const enter = 1 - tw(f, start, start + WHIP, 0, 1, ease.inOut);
  const next = CUTS[i + 1];
  const leave = next === undefined ? 0 : tw(f, next, next + WHIP, 0, 1, ease.inOut);
  const [nx, ny] = next === undefined ? [0, 0] : DIRS[(i + 1) % 4];
  return { x: enter * dx * W - leave * nx * W, y: enter * dy * H - leave * ny * H };
};

export const Themes = () => {
  const f = useCurrentFrame();

  const open =
    tw(f, T.drawer, T.drawer + 24, 0, 1, ease.out) *
    (1 - tw(f, T.deck - 12, T.deck + 6, 0, 1, ease.in));
  // Deck: every plate becomes a card in a 3D fan, then they fold into one.
  const deck = tw(f, T.deck, T.deck + 26, 0, 1, ease.inOut);
  const collapse = tw(f, T.collapse, 330, 0, 1, ease.inOut);
  const orbit =
    interpolate(f, [T.deck, T.collapse], [-16, 10], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) *
    (1 - collapse);
  // The card that survives the fold, and opens the export scene.
  const hero = THEMES.findIndex((t) => t.id === "dracula");

  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden" }}>
      {deck < 1 &&
        THEMES.map((theme, i) => {
          if (f < CUTS[i] - 1) return null;
          const o = offsetAt(i, f);
          const prev = offsetAt(i, f - 1);
          const v = Math.hypot(o.x - prev.x, o.y - prev.y);
          if (Math.abs(o.x) >= W || Math.abs(o.y) >= H) return null;
          const blurX = Math.min(60, Math.abs(o.x - prev.x) * 0.06);
          const blurY = Math.min(60, Math.abs(o.y - prev.y) * 0.06);
          return (
            <AbsoluteFill
              key={theme.id}
              style={{
                transform: `translate(${o.x}px, ${o.y}px) scale(${1 - deck * 0.6})`,
                opacity: 1 - deck,
                filter: v > 1 ? `url(#whip${i})` : undefined,
              }}
            >
              <svg width="0" height="0" style={{ position: "absolute" }}>
                <filter id={`whip${i}`} x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation={`${blurX} ${blurY}`} />
                </filter>
              </svg>
              <Plate theme={theme} dots shift={open} />
            </AbsoluteFill>
          );
        })}

      {deck > 0 && (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 2400 }}>
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at 50% 60%, rgba(71,168,255,0.22), transparent 60%)",
              opacity: deck * (1 - collapse),
            }}
          />
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, rgba(255,77,141,0.18), transparent 60%)",
              opacity: collapse,
            }}
          />
          <div
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${14 * (1 - collapse)}deg) rotateY(${orbit}deg)`,
            }}
          >
            {THEMES.map((theme, i) => {
              const c = i - (THEMES.length - 1) / 2;
              const d = ease.out(
                tw(f, T.deck + Math.abs(c) * 2, T.deck + 30 + Math.abs(c) * 2, 0, 1, (t) => t),
              );
              const spread = d * (1 - collapse);
              const isHero = i === hero;
              return (
                <div
                  key={theme.id}
                  style={{
                    position: "absolute",
                    left: -W / 2,
                    top: -H / 2,
                    width: W,
                    height: H,
                    borderRadius: 40,
                    overflow: "hidden",
                    boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
                    transform: `translateX(${c * 250 * spread}px) translateZ(${-Math.abs(c) * 160 * spread + (isHero ? 20 * collapse : i * 2)}px) rotateY(${c * -9 * spread}deg) translateY(${Math.abs(c) * 24 * spread}px) scale(${interpolate(d, [0, 1], [0.9, 0.34]) + collapse * 0.1})`,
                    opacity:
                      tw(f, T.deck + Math.abs(c) * 2 - 2, T.deck + Math.abs(c) * 2 + 4) *
                      (isHero ? 1 : 1 - collapse),
                  }}
                >
                  <Plate theme={theme} />
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}

      {open > 0 && <Drawer f={f} open={open} />}
      <Caption
        f={f}
        cues={[{ at: 8, num: "04", text: "30 themes. Make it yours.", color: ACCENT.blue }]}
      />
    </AbsoluteFill>
  );
};
