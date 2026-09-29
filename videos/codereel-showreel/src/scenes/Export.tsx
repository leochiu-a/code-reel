import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import data from "../tokens.json";
import { ACCENT, MONO, SANS, ease, tw } from "../lib";
import { EXPORT_REEL as R, EXPORT_T as T } from "../timeline";
import { Caption } from "../components/Caption";
import { MagicCode, StaticCode, type Tok } from "../components/Code";
import { Plate, THEMES } from "./Themes";

const W = 1920;
const H = 1080;
const HERO = THEMES.find((t) => t.id === "dracula")!;
// The Themes fold ends at scale 0.34 + 0.1, lifted 20px towards a 2400px lens.
const START = 0.44 * (2400 / 2380);

type Spot = { cx: number; cy: number; scale: number };
const mix = (a: Spot, b: Spot, p: number): Spot => ({
  cx: a.cx + (b.cx - a.cx) * p,
  cy: a.cy + (b.cy - a.cy) * p,
  scale: a.scale + (b.scale - a.scale) * p,
});

// Card at rest after the push-in; after the image export it steps aside, and the
// grabbed frame lands in the space it leaves. Neither moves again.
const CARD: Spot = { cx: 860, cy: 580, scale: 0.5 };
const SLOT_VIDEO: Spot = { cx: 1340, cy: 560, scale: 0.36 };
const SLOT_IMAGE: Spot = { cx: 580, cy: 560, scale: 0.36 };

// The toolbar and popovers ride above the card's top-right corner, like the editor.
const BTN = { w: 220, h: 56 };
const POP = { w: 420, pad: 26, row: 52, gap: 12, label: 30 };
const itemW = (POP.w - POP.pad * 2 - POP.gap * 2) / 3;
const chrome = (s: Spot) => {
  const right = s.cx + (W * s.scale) / 2;
  const top = s.cy - (H * s.scale) / 2;
  const videoX = right - BTN.w;
  return { btnY: top - 76, videoX, imageX: videoX - BTN.w - 14, popTop: top + 8, right };
};
const DOWNLOAD = "M12 3v12m0 0-5-5m5 5 5-5M5 21h14";
const CLAPPER =
  "M4 11h16v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM4 11l2.5-5.5 14 2.5-.5 3M8.5 6.7l2.5 4M13.5 7.6l2.5 3.4";

// Popover rows, 1.6x the editor's `w-64 p-4` ImageExportPopover / VideoExportPopover.
// The defaults already read 2x, so the demo goes straight to Export.
type Row = { label: string; items: string[]; value: number };
const IMAGE_ROWS: Row[] = [
  { label: "FORMAT", items: ["PNG", "WEBP", "JPEG"], value: 0 },
  { label: "SCALE", items: ["1x", "2x", "3x"], value: 1 },
];
const VIDEO_ROWS: Row[] = [{ label: "RESOLUTION", items: ["1x", "2x", "3x"], value: 1 }];
const rowOffset = (i: number) => POP.pad + POP.label + i * (POP.row + POP.pad + POP.label);
const exportOffset = (rows: Row[]) => rowOffset(rows.length - 1) + POP.row + POP.pad;

const IMAGE_AT = chrome(CARD);
const VIDEO_AT = chrome(SLOT_VIDEO);
const CURSOR: [number, number, number][] = [
  [6, 1560, 960],
  [T.imgOpen - 2, IMAGE_AT.imageX + BTN.w / 2, IMAGE_AT.btnY + BTN.h / 2],
  [
    T.imgClick - 4,
    IMAGE_AT.imageX + BTN.w - POP.w / 2,
    IMAGE_AT.popTop + exportOffset(IMAGE_ROWS) + POP.row / 2,
  ],
  [T.vidOpen - 2, VIDEO_AT.videoX + BTN.w / 2, VIDEO_AT.btnY + BTN.h / 2],
  [
    T.vidClick - 4,
    VIDEO_AT.right - POP.w / 2,
    VIDEO_AT.popTop + exportOffset(VIDEO_ROWS) + POP.row / 2,
  ],
];
const CLICKS = [T.imgOpen, T.imgClick, T.vidOpen, T.vidClick];

const cursorAt = (f: number) => {
  const frames = CURSOR.map((k) => k[0]);
  const opts = { easing: ease.inOut, extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
  // Hold at each target, then glide to the next.
  let x = CURSOR[0][1];
  let y = CURSOR[0][2];
  for (let i = 1; i < CURSOR.length; i++) {
    const p = interpolate(f, [frames[i - 1] + 4, frames[i]], [0, 1], opts);
    x += (CURSOR[i][1] - CURSOR[i - 1][1]) * p;
    y += (CURSOR[i][2] - CURSOR[i - 1][2]) * p;
  }
  return { x, y };
};

const press = (f: number, at: number) =>
  1 - 0.08 * Math.sin(tw(f, at, at + 8, 0, 1, (t) => t) * Math.PI);

// The reel loops as Magic Moves only, 3 → 1 → 2 → 3, so playback never cuts.
const HERO_PAIRS = data.heroPairs as { from: Tok[]; to: Tok[] }[];
const M = { size: 44, lh: 74 };
const SEG = R.hold + R.move;
const LOOP = SEG * HERO_PAIRS.length;
const loopAt = (f: number) => Math.max(0, f - R.start) % LOOP;
const Reel = ({ f }: { f: number }) => {
  const t = loopAt(f);
  const pair = HERO_PAIRS[Math.floor(t / SEG)];
  const local = t % SEG;
  if (f < R.start || local < R.hold)
    return <StaticCode tokens={pair.from} m={M} cols={51} lines={4} />;
  return (
    <MagicCode
      from={pair.from}
      to={pair.to}
      p={(local - R.hold) / R.move}
      m={M}
      cols={51}
      lines={4}
    />
  );
};

const Card = ({
  spot,
  rotate = 0,
  children,
}: {
  spot: Spot;
  rotate?: number;
  children: React.ReactNode;
}) => (
  <div
    style={{
      position: "absolute",
      left: spot.cx - W / 2,
      top: spot.cy - H / 2,
      width: W,
      height: H,
      borderRadius: 40,
      overflow: "hidden",
      transform: `scale(${spot.scale}) rotate(${rotate}deg)`,
      boxShadow: "0 60px 160px rgba(0,0,0,0.8)",
    }}
  >
    {children}
  </div>
);

/** Player controls laid over the video card: a play glyph and a scrub bar. */
const Controls = ({ progress, opacity }: { progress: number; opacity: number }) => (
  <div
    style={{
      position: "absolute",
      left: 80,
      right: 80,
      bottom: 56,
      display: "flex",
      alignItems: "center",
      gap: 36,
      opacity,
    }}
  >
    <svg width="72" height="72" viewBox="0 0 24 24" fill="#fff">
      <path d="M7 4.5v15l12.5-7.5z" />
    </svg>
    <div style={{ flex: 1, height: 20, borderRadius: 20, background: "rgba(255,255,255,0.28)" }}>
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          borderRadius: 20,
          background: "#fff",
        }}
      />
    </div>
  </div>
);

const FileLabel = ({
  spot,
  name,
  on,
  pop,
}: {
  spot: Spot;
  name: string;
  on: number;
  pop: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: spot.cx - 300,
      top: spot.cy + (H * spot.scale) / 2 + 26,
      width: 600,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: 14,
      fontFamily: MONO,
      fontSize: 26,
      color: "rgba(255,255,255,0.9)",
      opacity: on,
      transform: `translateY(${(1 - on) * 16}px)`,
    }}
  >
    <span
      style={{
        display: "inline-flex",
        width: 32,
        height: 32,
        borderRadius: 32,
        background: "#10b981",
        color: "#fff",
        fontSize: 20,
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${0.4 + 0.6 * pop})`,
      }}
    >
      ✓
    </span>
    {name}
  </div>
);

const ToolbarButton = ({
  x,
  y,
  icon,
  label,
  primary,
  progress,
  scale,
  opacity,
}: {
  x: number;
  y: number;
  icon: string;
  label: string;
  primary: boolean;
  progress: number | null;
  scale: number;
  opacity: number;
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: BTN.w,
      height: BTN.h,
      borderRadius: 12,
      overflow: "hidden",
      background: primary ? "#10b981" : "rgba(255,255,255,0.08)",
      border: primary ? "none" : "1px solid rgba(255,255,255,0.14)",
      boxShadow: primary ? "0 12px 30px rgba(6,78,59,0.4)" : "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      color: "#fff",
      fontSize: 22,
      fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
      opacity,
      transform: `scale(${scale})`,
    }}
  >
    {progress !== null && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          width: `${progress * 100}%`,
          background: "rgba(16,185,129,0.45)",
        }}
      />
    )}
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: "relative" }}
    >
      <path d={icon} />
    </svg>
    <span style={{ position: "relative" }}>{label}</span>
  </div>
);

const Toggle = ({ items, value, top }: { items: string[]; value: number; top: number }) => (
  <div
    style={{
      position: "absolute",
      left: POP.pad,
      top,
      width: POP.w - POP.pad * 2,
      height: POP.row,
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: value * (itemW + POP.gap),
        width: itemW,
        height: POP.row,
        borderRadius: 12,
        background: "rgba(255,255,255,0.14)",
        border: "1px solid rgba(255,255,255,0.22)",
      }}
    />
    {items.map((label, i) => (
      <div
        key={label}
        style={{
          position: "absolute",
          top: 0,
          left: i * (itemW + POP.gap),
          width: itemW,
          height: POP.row,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 600,
          color: value === i ? "#fff" : "rgba(226,232,240,0.55)",
        }}
      >
        {label}
      </div>
    ))}
  </div>
);

const Popover = ({
  left,
  top,
  rows,
  open,
  pressed,
  label,
  progress,
}: {
  left: number;
  top: number;
  rows: Row[];
  open: number;
  pressed: number;
  label: string;
  progress: number | null;
}) =>
  open > 0.01 && (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: POP.w,
        height: exportOffset(rows) + POP.row + POP.pad,
        borderRadius: 20,
        background: "#1b1b1b",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
        opacity: open,
        transform: `translateY(${(1 - open) * -14}px) scale(${0.95 + 0.05 * open})`,
        transformOrigin: "top right",
        color: "#e2e8f0",
      }}
    >
      {rows.map((r, i) => (
        <div key={r.label}>
          <div
            style={{
              position: "absolute",
              left: POP.pad,
              top: rowOffset(i) - POP.label + 2,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "#94a3b8",
            }}
          >
            {r.label}
          </div>
          <Toggle items={r.items} value={r.value} top={rowOffset(i)} />
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: POP.pad,
          top: exportOffset(rows),
          width: POP.w - POP.pad * 2,
          height: POP.row,
          borderRadius: 12,
          background: "#10b981",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          fontWeight: 600,
          color: "#fff",
          overflow: "hidden",
          transform: `scale(${pressed})`,
        }}
      >
        {progress !== null && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              width: `${progress * 100}%`,
              background: "rgba(255,255,255,0.25)",
            }}
          />
        )}
        <span style={{ position: "relative", fontVariantNumeric: "tabular-nums" }}>{label}</span>
      </div>
    </div>
  );

export const Export = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (at: number, stiffness = 220, damping = 18) =>
    f >= at ? spring({ frame: f - at, fps, config: { damping, stiffness } }) : 0;

  // Image: press Export and the shutter grabs whatever frame is playing.
  const imgOpen = sp(T.imgOpen) * (1 - tw(f, T.imgFlash - 2, T.imgFlash + 6));
  const imgBusy = f >= T.imgClick && f < T.imgFlash;
  const flash = tw(f, T.imgFlash, T.imgFlash + 2) * (1 - tw(f, T.imgFlash + 2, T.imgFlash + 16));

  // Video: the render follows the playback, and the reel never stops.
  const vidOpen = sp(T.vidOpen) * (1 - tw(f, T.vidDone - 2, T.vidDone + 6));
  const rendering = f >= T.vidClick && f < T.vidDone;
  const progress = tw(f, T.vidClick + 2, T.vidDone - 2, 0, 1, (t) => t);
  const status = `Rendering ${Math.round(progress * 100)}%`;
  const scrub = f < T.vidDone ? progress : loopAt(f) / LOOP;

  // One move: the card steps aside as the grabbed frame peels off into its slot.
  const settle = tw(f, 0, 30, 0, 1, ease.inOut);
  const rest: Spot = {
    cx: interpolate(settle, [0, 1], [W / 2, CARD.cx]),
    cy: interpolate(settle, [0, 1], [H / 2, CARD.cy]),
    scale: interpolate(settle, [0, 1], [START, CARD.scale]),
  };
  const move = tw(f, T.move, T.imgSaved, 0, 1, ease.inOut);
  const cardSpot = mix(rest, SLOT_VIDEO, move);
  const peel = tw(f, T.imgFlash, T.imgSaved, 0, 1, ease.inOut);
  const imageSpot = mix(CARD, SLOT_IMAGE, peel);
  const lift = Math.sin(peel * Math.PI);
  const at = chrome(cardSpot);

  const toolbarOn = tw(f, 8, 20) * (1 - tw(f, T.vidDone, T.vidDone + 10));
  const cursor = cursorAt(f);
  const cursorOn = tw(f, 4, 12) * (1 - tw(f, T.vidDone, T.vidDone + 8));
  const clickAt = CLICKS.find((c) => f >= c && f < c + 8);

  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden", fontFamily: SANS }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(255,77,141,0.18), transparent 60%)",
        }}
      />

      {/* The reel, playing the whole time; the video export renders exactly this. */}
      <Card spot={cardSpot}>
        <Plate theme={HERO} code={<Reel f={f} />} />
        <Controls progress={scrub} opacity={tw(f, T.vidClick, T.vidClick + 8)} />
      </Card>

      {/* The PNG: the one frame the shutter grabbed, peeling off the card. */}
      {f >= T.imgFlash && (
        <Card
          spot={{
            ...imageSpot,
            cy: imageSpot.cy - lift * 60,
            scale: imageSpot.scale + lift * 0.04,
          }}
          rotate={lift * -5}
        >
          <Plate theme={HERO} code={<Reel f={T.imgFlash} />} />
        </Card>
      )}

      <FileLabel
        spot={SLOT_IMAGE}
        name="codereel@2x.png"
        on={tw(f, T.imgSaved, T.imgSaved + 12)}
        pop={sp(T.imgSaved, 200, 9)}
      />
      <FileLabel
        spot={SLOT_VIDEO}
        name="codereel.mp4"
        on={tw(f, T.saved, T.saved + 12)}
        pop={sp(T.saved, 200, 9)}
      />

      <ToolbarButton
        x={at.imageX}
        y={at.btnY}
        icon={DOWNLOAD}
        label={imgBusy ? "Exporting..." : "Export Image"}
        primary
        progress={null}
        scale={press(f, T.imgOpen)}
        opacity={toolbarOn}
      />
      <ToolbarButton
        x={at.videoX}
        y={at.btnY}
        icon={CLAPPER}
        label={rendering ? status : "Export Video"}
        primary={false}
        progress={rendering ? progress : null}
        scale={press(f, T.vidOpen)}
        opacity={toolbarOn}
      />

      <Popover
        left={at.imageX + BTN.w - POP.w}
        top={at.popTop}
        rows={IMAGE_ROWS}
        open={imgOpen}
        pressed={press(f, T.imgClick)}
        label={imgBusy ? "Exporting..." : "Export"}
        progress={null}
      />
      <Popover
        left={at.right - POP.w}
        top={at.popTop}
        rows={VIDEO_ROWS}
        open={vidOpen}
        pressed={press(f, T.vidClick)}
        label={rendering ? status : "Export"}
        progress={rendering ? progress : null}
      />

      {/* Pointer with a click ring. */}
      <div style={{ position: "absolute", left: cursor.x, top: cursor.y, opacity: cursorOn }}>
        {clickAt !== undefined && (
          <div
            style={{
              position: "absolute",
              left: -30,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: 60,
              border: `2px solid ${ACCENT.green}`,
              transform: `scale(${0.4 + tw(f, clickAt, clickAt + 8) * 0.8})`,
              opacity: 1 - tw(f, clickAt, clickAt + 8),
            }}
          />
        )}
        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          style={{
            transform: `scale(${clickAt !== undefined ? press(f, clickAt) : 1})`,
            transformOrigin: "0 0",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
          }}
        >
          <path
            d="M3 2l7.5 19 2.4-7.6L20.5 11z"
            fill="#fff"
            stroke="#000"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <Caption
        f={f}
        cues={[
          { at: 6, num: "05", text: "Export a crisp image", color: ACCENT.green },
          {
            at: T.vidOpen - 16,
            num: "05",
            text: "Or the whole animation as MP4",
            color: ACCENT.green,
          },
        ]}
      />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
