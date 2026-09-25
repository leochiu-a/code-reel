import { interpolate, interpolateColors } from "remotion";
import { CHAR, MONO, ease } from "../lib";

export type Tok = { k: string; t: string; c: string; l: number; x: number; i?: boolean };

type Metrics = { size: number; lh: number };

const Piece = ({
  tok,
  m,
  x,
  y,
  color,
  style,
}: {
  tok: Tok;
  m: Metrics;
  x: number;
  y: number;
  color: string;
  style?: React.CSSProperties;
}) => (
  <span
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      transform: `translate(${x}px, ${y}px)`,
      color,
      fontStyle: tok.i ? "italic" : "normal",
      whiteSpace: "pre",
      lineHeight: `${m.lh}px`,
      ...style,
    }}
  >
    {tok.t}
  </span>
);

const box = (lines: number, cols: number, m: Metrics): React.CSSProperties => ({
  position: "relative",
  width: cols * m.size * CHAR,
  height: lines * m.lh,
  fontFamily: MONO,
  fontSize: m.size,
  fontFeatureSettings: '"liga" 0',
});

/** Dims every line except `line`, easing between highlight targets. */
export type Focus = { line: number; amount: number };
const dim = (tok: Tok, focus?: Focus, lineY?: number) => {
  if (!focus || focus.amount === 0) return 1;
  const d = Math.abs((lineY ?? tok.l) - focus.line);
  return interpolate(Math.min(d, 1), [0, 1], [1, 1 - 0.72 * focus.amount]);
};

export const StaticCode = ({
  tokens,
  m,
  cols,
  lines,
  focus,
  reveal,
}: {
  tokens: Tok[];
  m: Metrics;
  cols: number;
  lines: number;
  focus?: Focus;
  reveal?: number;
}) => (
  <div style={box(lines, cols, m)}>
    {tokens.map((tok, n) => {
      const r = reveal === undefined ? 1 : Math.max(0, Math.min(1, reveal - n));
      if (r <= 0) return null;
      return (
        <Piece
          key={tok.k}
          tok={tok}
          m={m}
          x={tok.x * m.size * CHAR}
          y={tok.l * m.lh + (1 - ease.out(r)) * 14}
          color={tok.c}
          style={{
            opacity: ease.out(r) * dim(tok, focus),
            filter: r < 1 ? `blur(${(1 - r) * 6}px)` : undefined,
          }}
        />
      );
    })}
  </div>
);

/** Shiki Magic Move, frame-driven: shared keys glide, the rest cross-fade. */
export const MagicCode = ({
  from,
  to,
  p,
  m,
  cols,
  lines,
  focus,
}: {
  from: Tok[];
  to: Tok[];
  p: number;
  m: Metrics;
  cols: number;
  lines: number;
  focus?: Focus;
}) => {
  const toKeys = new Map(to.map((t) => [t.k, t]));
  const fromKeys = new Set(from.map((t) => t.k));
  const move = ease.inOut(p);
  const out = from.map((a) => {
    const b = toKeys.get(a.k);
    if (b) {
      const x = interpolate(move, [0, 1], [a.x, b.x]) * m.size * CHAR;
      const ly = interpolate(move, [0, 1], [a.l, b.l]);
      return (
        <Piece
          key={a.k}
          tok={a}
          m={m}
          x={x}
          y={ly * m.lh}
          color={interpolateColors(move, [0, 1], [a.c, b.c])}
          style={{ opacity: dim(a, focus, ly) }}
        />
      );
    }
    const o = interpolate(p, [0, 0.35], [1, 0], { extrapolateRight: "clamp" });
    return (
      <Piece
        key={a.k}
        tok={a}
        m={m}
        x={a.x * m.size * CHAR}
        y={a.l * m.lh - (1 - o) * 10}
        color={a.c}
        style={{ opacity: o * dim(a, focus), filter: `blur(${(1 - o) * 5}px)` }}
      />
    );
  });
  const added = to.filter((b) => !fromKeys.has(b.k));
  const enter = added.map((b, n) => {
    const start = 0.42 + (n / Math.max(1, added.length)) * 0.33;
    const r = interpolate(p, [start, start + 0.25], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    const e = ease.out(r);
    return (
      <Piece
        key={b.k}
        tok={b}
        m={m}
        x={b.x * m.size * CHAR}
        y={b.l * m.lh + (1 - e) * 18}
        color={b.c}
        style={{ opacity: e * dim(b, focus), filter: `blur(${(1 - e) * 6}px)` }}
      />
    );
  });
  return (
    <div style={box(lines, cols, m)}>
      {out}
      {enter}
    </div>
  );
};
