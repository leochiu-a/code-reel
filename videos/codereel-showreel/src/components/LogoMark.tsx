import { ease } from "../lib";

// The CodeReel mark: a code chevron and a play triangle. `draw` strokes the
// chevron from its top point, `pop` springs the triangle in.
export const CHEVRON = [
  [12, 9.5],
  [5.5, 16],
  [12, 22.5],
] as const;
const SEG = Math.hypot(6.5, 6.5);

export const chevronHead = (draw: number) => {
  const d = draw * SEG * 2;
  const [a, b] = d <= SEG ? [CHEVRON[0], CHEVRON[1]] : [CHEVRON[1], CHEVRON[2]];
  const t = d <= SEG ? d / SEG : (d - SEG) / SEG;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as const;
};

export const LogoMark = ({
  size,
  draw = 1,
  pop = 1,
  color = "#fff",
  glow = 0,
}: {
  size: number;
  draw?: number;
  pop?: number;
  color?: string;
  glow?: number;
}) => (
  <svg
    viewBox="3 7 26 18"
    style={{
      width: size,
      height: (size * 18) / 26,
      overflow: "visible",
      filter: glow ? `drop-shadow(0 0 ${glow}px rgba(255,255,255,0.55))` : undefined,
    }}
  >
    <path
      d="M12 9.5 5.5 16l6.5 6.5"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - draw}
      opacity={draw > 0 ? 1 : 0}
    />
    <g
      transform={`translate(21.3 16) rotate(${(1 - ease.out(Math.min(pop, 1))) * -120}) scale(${Math.max(0, pop)}) translate(-21.3 -16)`}
    >
      <path
        d="M16.5 10.2v11.6a1 1 0 0 0 1.5.86l9.3-5.8a1 1 0 0 0 0-1.72l-9.3-5.8a1 1 0 0 0-1.5.86Z"
        fill={color}
      />
    </g>
  </svg>
);
