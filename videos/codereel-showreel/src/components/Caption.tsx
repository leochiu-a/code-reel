import { MONO, SANS, ease, tw } from "../lib";

export type Cue = { at: number; num: string; text: string; color: string };

/** Numbered chapter title that wipes up through a mask, replacing the previous cue. */
export const Caption = ({ f, cues, top = 118 }: { f: number; cues: Cue[]; top?: number }) => (
  <div style={{ position: "absolute", top, left: 0, right: 0, height: 64, overflow: "hidden" }}>
    {cues.map((c, i) => {
      const next = cues[i + 1]?.at;
      const delay = i > 0 ? 8 : 0;
      const inP = tw(f, c.at + delay, c.at + delay + 14, 0, 1, ease.out);
      const outP = next === undefined ? 0 : tw(f, next, next + 10, 0, 1, ease.in);
      if (inP === 0 || outP === 1) return null;
      return (
        <div
          key={c.at}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            transform: `translateY(${(1 - inP) * 64 - outP * 64}px)`,
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 22,
              color: c.color,
              border: `1.5px solid ${c.color}`,
              borderRadius: 999,
              padding: "4px 14px",
            }}
          >
            {c.num}
          </span>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: 44,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            {c.text}
          </span>
        </div>
      );
    })}
  </div>
);
