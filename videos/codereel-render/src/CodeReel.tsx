import { AbsoluteFill, interpolate, interpolateColors, useCurrentFrame } from "remotion";
import Frame, { FRAME_PRESENTATION } from "../../../src/components/Frame";
import { diffHighlightLines } from "../../../src/utils/highlightLines";
import type { Piece, Scene } from "./scene";
import {
  enterProgress,
  highlightFadeProgress,
  highlightMoveProgress,
  leaveProgress,
  momentAt,
  moveProgress,
  type Moment,
} from "./timeline";

// Magic Move dims line numbers (`.shiki-magic-move-line-number`).
const LINE_NUMBER_OPACITY = 0.3;
// The editor's highlight bar colour (src/components/CodeEditor.tsx).
const HIGHLIGHT_COLOR = "rgba(148, 163, 184, 0.18)";

type Placed = { x: number; line: number; color: string; opacity: number };

const Token = ({ piece, at, scene }: { piece: Piece; at: Placed; scene: Scene }) => (
  <span
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      transform: `translate(${at.x}px, ${at.line * scene.lineHeight}px)`,
      color: at.color,
      opacity: at.opacity * (piece.lineNumber ? LINE_NUMBER_OPACITY : 1),
      fontStyle: piece.italic ? "italic" : undefined,
      fontWeight: piece.bold ? 700 : undefined,
      whiteSpace: "pre",
    }}
  >
    {piece.text}
  </span>
);

const still = (piece: Piece): Placed => ({ ...piece, opacity: 1 });

/** Magic Move, frame-driven: shared keys move, the rest fade out or in. */
const Code = ({ scene, moment }: { scene: Scene; moment: Moment }) => {
  if (moment.kind === "still") {
    const pieces = moment.step === 0 ? scene.first : scene.transitions[moment.step - 1].to;
    return pieces.map((p) => <Token key={p.key} piece={p} at={still(p)} scene={scene} />);
  }

  const { from, to } = scene.transitions[moment.index];
  const toByKey = new Map(to.map((p) => [p.key, p]));
  const fromKeys = new Set(from.map((p) => p.key));
  const move = moveProgress(moment.ms);
  const leave = leaveProgress(moment.ms);
  const enter = enterProgress(moment.ms);

  return [
    ...from.map((a) => {
      const b = toByKey.get(a.key);
      const at: Placed = b
        ? {
            x: interpolate(move, [0, 1], [a.x, b.x]),
            line: interpolate(move, [0, 1], [a.line, b.line]),
            color: interpolateColors(move, [0, 1], [a.color, b.color]),
            opacity: 1,
          }
        : { ...a, opacity: 1 - leave };
      return <Token key={a.key} piece={b ?? a} at={at} scene={scene} />;
    }),
    ...to
      .filter((b) => !fromKeys.has(b.key))
      .map((b) => <Token key={b.key} piece={b} at={{ ...b, opacity: enter }} scene={scene} />),
  ];
};

type Bar = { key: string; line: number; opacity: number };

const bars = (scene: Scene, moment: Moment): Bar[] => {
  if (moment.kind === "still") {
    return scene.highlights[moment.step].map((line) => ({ key: `s${line}`, line, opacity: 1 }));
  }
  const prev = scene.highlights[moment.index];
  const next = scene.highlights[moment.index + 1];
  const { move, fadeIn, fadeOut } = diffHighlightLines(prev, next);
  const p = highlightMoveProgress(moment.ms);
  const fade = highlightFadeProgress(moment.ms);
  return [
    ...move.map((m) => ({
      key: `m${m.id}`,
      line: interpolate(p, [0, 1], [m.from, m.to]),
      opacity: 1,
    })),
    ...fadeIn.map((line) => ({ key: `i${line}`, line, opacity: fade })),
    ...fadeOut.map((line) => ({ key: `o${line}`, line, opacity: 1 - fade })),
  ];
};

/** The editor's frame and code at one frame of the reel, sized by its content. */
export const Reel = ({ scene, frame }: { scene: Scene; frame: number }) => {
  const { settings } = scene;
  const moment = momentAt(scene, frame);
  return (
    <Frame
      frame={scene.frame}
      borderRadius={settings.borderRadius!}
      padding={settings.padding}
      background={settings.background}
      themeBackground={scene.themeBackground}
      fontSize={settings.fontSize}
      borderShadow={settings.borderShadow}
      windowControls={settings.windowControls}
      windowTitle={scene.title}
    >
      <div className={FRAME_PRESENTATION.editorShellClassName}>
        {bars(scene, moment).map((bar) => (
          <div
            key={bar.key}
            className="pointer-events-none absolute right-0 left-0 z-20"
            style={{
              top: FRAME_PRESENTATION.editorPaddingY + (bar.line - 1) * scene.lineHeight,
              height: scene.lineHeight,
              backgroundColor: HIGHLIGHT_COLOR,
              opacity: bar.opacity,
            }}
          />
        ))}
        <div
          className="relative z-10"
          style={{
            fontSize: settings.fontSize,
            lineHeight: `${scene.lineHeight}px`,
            padding: `${FRAME_PRESENTATION.editorPaddingY}px ${FRAME_PRESENTATION.editorPaddingX}px`,
          }}
        >
          <div
            style={{
              position: "relative",
              width: scene.codeWidth,
              height: scene.codeHeight,
              fontFamily: scene.fontFamily,
            }}
          >
            <Code scene={scene} moment={moment} />
          </div>
        </div>
      </div>
    </Frame>
  );
};

// The frame rounds its corners for a PNG with transparent edges; a video has no
// alpha, so the corners get the frame's own background instead of black. The
// Vercel frame paints black whatever the setting (src/components/Frame.tsx).
const cornerBackground = (scene: Scene) =>
  scene.frame === "vercel" ? "#000000" : scene.settings.background;

export const CodeReel = ({ scene }: { scene: Scene }) => (
  <AbsoluteFill style={{ background: cornerBackground(scene) }}>
    <Reel scene={scene} frame={useCurrentFrame()} />
  </AbsoluteFill>
);
