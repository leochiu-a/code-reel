import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, MONO, SANS, ease, tw } from "../lib";
import { EXPORT_T as T } from "../timeline";
import { Caption } from "../components/Caption";
import { Plate, THEMES } from "./Themes";
import { LogoMark } from "../components/LogoMark";

const W = 1920;
const H = 1080;
const HERO = THEMES.find((t) => t.id === "dracula")!;
// The Themes fold ends at scale 0.34 + 0.1, lifted 20px towards a 2400px lens.
const START = 0.44 * (2400 / 2380);

// Card at rest after the push-in, in screen space.
const CARD = { cx: 860, cy: 580, scale: 0.5 };
const CW = W * CARD.scale;
const CH = H * CARD.scale;
const RIGHT = CARD.cx + CW / 2;
const TOP = CARD.cy - CH / 2;

// Popover, 1.6x the editor's `w-64 p-4` ImageExportPopover.
const POP = { w: 420, pad: 26, row: 52, gap: 12, label: 30 };
const POP_TOP = TOP + 8;
const POP_LEFT = RIGHT - POP.w;
const itemW = (POP.w - POP.pad * 2 - POP.gap * 2) / 3;
const itemX = (i: number) => POP_LEFT + POP.pad + i * (itemW + POP.gap);
const formatY = POP_TOP + POP.pad + POP.label;
const scaleY = formatY + POP.row + POP.pad + POP.label;
const exportY = scaleY + POP.row + POP.pad;

// Folder the saved image drops into, centred below the card's rest spot.
const FOLDER = { cx: 960, top: 390, w: 400, back: 300, front: 220 };
const IN = {
  lift: { x: 960, y: FOLDER.top - 70 },
  rest: { x: 960, y: FOLDER.top + 118 },
  scale: 0.17,
};

const BUTTON = { w: 220, h: 56, x: RIGHT - 220, y: TOP - 76 };

const CURSOR: [number, number, number][] = [
  [6, 1560, 960],
  [T.open - 2, BUTTON.x + BUTTON.w / 2, BUTTON.y + BUTTON.h / 2],
  [T.scale - 4, itemX(1) + itemW / 2, scaleY + POP.row / 2],
  [T.click - 4, POP_LEFT + POP.w / 2, exportY + POP.row / 2],
];

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

const Toggle = ({ items, value, y }: { items: string[]; value: number; y: number }) => (
  <div
    style={{
      position: "absolute",
      left: POP.pad,
      top: y - POP_TOP,
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
          color: Math.round(value) === i ? "#fff" : "rgba(226,232,240,0.55)",
        }}
      >
        {label}
      </div>
    ))}
  </div>
);

const Label = ({ y, children }: { y: number; children: string }) => (
  <div
    style={{
      position: "absolute",
      left: POP.pad,
      top: y - POP_TOP - POP.label + 2,
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: "0.12em",
      color: "#94a3b8",
    }}
  >
    {children}
  </div>
);

export const Export = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const settle = tw(f, 0, 30, 0, 1, ease.inOut);
  const pop = spring({ frame: f - T.open, fps, config: { damping: 18, stiffness: 220 } });
  const closed = tw(f, T.flash - 2, T.flash + 6);
  const popOpen = f >= T.open ? pop * (1 - closed) : 0;
  const scaleValue = spring({ frame: f - T.scale, fps, config: { damping: 16, stiffness: 200 } });
  const exporting = f >= T.click && f < T.flash;
  const flash = tw(f, T.flash, T.flash + 2) * (1 - tw(f, T.flash + 2, T.flash + 16));
  const folderIn = spring({ frame: f - T.folder, fps, config: { damping: 13, stiffness: 150 } });
  const lift = tw(f, T.lift, T.drop, 0, 1, ease.inOut);
  const drop = tw(f, T.drop, T.shut, 0, 1, ease.in);
  // The front flap tips open to receive the image, then snaps shut.
  const flap =
    tw(f, T.folder + 4, T.lift + 8, 0, 1, ease.out) *
    (1 - tw(f, T.shut, T.shut + 8, 0, 1, ease.in));
  const bounce = 1 - 0.07 * Math.sin(tw(f, T.shut + 6, T.shut + 20, 0, 1, (t) => t) * Math.PI);
  const cursor = cursorAt(f);
  const cursorOn = tw(f, 4, 12) * (1 - tw(f, T.flash, T.flash + 6));
  const clickAt = [T.open, T.scale, T.click].find((c) => f >= c && f < c + 8);

  // Card: settles from the Themes fold, lifts over the folder and drops in.
  const restScale = interpolate(settle, [0, 1], [START, CARD.scale]);
  const cx = interpolate(settle, [0, 1], [W / 2, CARD.cx]) + lift * (IN.lift.x - CARD.cx);
  const cy =
    interpolate(settle, [0, 1], [H / 2, CARD.cy]) +
    lift * (IN.lift.y - CARD.cy) +
    drop * (IN.rest.y - IN.lift.y);
  const cardScale = restScale + lift * (IN.scale - CARD.scale);
  const tilt = lift * -4 * (1 - drop);
  const folderScale = f >= T.folder ? folderIn : 0;
  const saved = tw(f, T.shut + 10, T.shut + 22);
  // Above the flap while it flies over, behind it once it drops in.
  const inside = f >= T.drop;
  const card = (
    <div
      style={{
        position: "absolute",
        left: cx - W / 2,
        top: cy - H / 2,
        width: W,
        height: H,
        borderRadius: 40,
        overflow: "hidden",
        transform: `scale(${cardScale}) rotate(${tilt}deg)`,
        boxShadow: "0 60px 160px rgba(0,0,0,0.8)",
      }}
    >
      <Plate theme={HERO} />
    </div>
  );

  return (
    <AbsoluteFill style={{ background: "#050505", overflow: "hidden", fontFamily: SANS }}>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(255,77,141,0.18), transparent 60%)",
        }}
      />
      {/* Folder, card and flap share one layer so the landing bounce moves them together. */}
      <AbsoluteFill
        style={{
          transform: `scaleY(${bounce}) scaleX(${2 - bounce})`,
          transformOrigin: `${FOLDER.cx}px ${FOLDER.top + FOLDER.back}px`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: FOLDER.cx - FOLDER.w / 2,
            top: FOLDER.top - 36,
            width: FOLDER.w,
            height: FOLDER.back + 36,
            transform: `scale(${folderScale})`,
            transformOrigin: "50% 100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: -26,
              width: FOLDER.w,
              height: 40,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.55)",
              filter: "blur(18px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 160,
              height: 60,
              borderRadius: "18px 18px 0 0",
              background: "#2f6fd6",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 36,
              width: FOLDER.w,
              height: FOLDER.back,
              borderRadius: "0 22px 22px 22px",
              background: "linear-gradient(180deg, #3b82f6, #2563d9)",
            }}
          />
        </div>
        {inside && card}
        <div
          style={{
            position: "absolute",
            left: FOLDER.cx - FOLDER.w / 2,
            top: FOLDER.top + FOLDER.back - FOLDER.front,
            width: FOLDER.w,
            height: FOLDER.front,
            borderRadius: 22,
            background: "linear-gradient(180deg, #7cc0ff 0%, #4d9bf7 100%)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.55), 0 -6px 24px rgba(0,0,0,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `translateY(${(1 - folderScale) * 140}px) perspective(900px) rotateX(${-50 * flap}deg) scale(${folderScale})`,
            transformOrigin: "50% 100%",
            opacity: Math.min(1, folderScale * 3),
          }}
        >
          <div style={{ opacity: 0.45 }}>
            <LogoMark size={110} />
          </div>
        </div>
        {!inside && card}
      </AbsoluteFill>

      {/* Saved-file label under the folder. */}
      <div
        style={{
          position: "absolute",
          left: FOLDER.cx - 300,
          top: FOLDER.top + FOLDER.back + 34,
          width: 600,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 14,
          fontFamily: MONO,
          fontSize: 26,
          color: "rgba(255,255,255,0.9)",
          opacity: saved,
          transform: `translateY(${(1 - saved) * 16}px)`,
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
            transform: `scale(${0.4 + 0.6 * spring({ frame: f - T.shut - 10, fps, config: { damping: 9, stiffness: 200 } })})`,
          }}
        >
          ✓
        </span>
        codereel@2x.png
      </div>

      {/* Toolbar button: the editor's emerald "Export Image". */}
      <div
        style={{
          position: "absolute",
          left: BUTTON.x,
          top: BUTTON.y,
          width: BUTTON.w,
          height: BUTTON.h,
          borderRadius: 12,
          background: "#10b981",
          boxShadow: "0 12px 30px rgba(6,78,59,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: "#fff",
          fontSize: 22,
          fontWeight: 600,
          opacity: tw(f, 8, 20) * (1 - tw(f, T.folder, T.folder + 8)),
          transform: `scale(${press(f, T.open)})`,
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3v12m0 0-5-5m5 5 5-5M5 21h14" />
        </svg>
        {exporting ? "Exporting..." : "Export Image"}
      </div>

      {/* ImageExportPopover: Format, Scale, Export. */}
      {popOpen > 0.01 && (
        <div
          style={{
            position: "absolute",
            left: POP_LEFT,
            top: POP_TOP,
            width: POP.w,
            height: exportY + POP.row + POP.pad - POP_TOP,
            borderRadius: 20,
            background: "#1b1b1b",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.7)",
            opacity: popOpen,
            transform: `translateY(${(1 - popOpen) * -14}px) scale(${0.95 + 0.05 * popOpen})`,
            transformOrigin: "top right",
            color: "#e2e8f0",
          }}
        >
          <Label y={formatY}>FORMAT</Label>
          <Toggle items={["PNG", "WEBP", "JPEG"]} value={0} y={formatY} />
          <Label y={scaleY}>SCALE</Label>
          <Toggle items={["1x", "2x", "3x"]} value={f >= T.scale ? scaleValue : 0} y={scaleY} />
          <div
            style={{
              position: "absolute",
              left: POP.pad,
              top: exportY - POP_TOP,
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
              transform: `scale(${press(f, T.click)})`,
            }}
          >
            {exporting ? "Exporting..." : "Export"}
          </div>
        </div>
      )}

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
        cues={[{ at: 6, num: "05", text: "Export a crisp image", color: ACCENT.green }]}
      />
      <AbsoluteFill style={{ background: "#fff", opacity: flash, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
