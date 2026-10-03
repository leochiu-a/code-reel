import { AbsoluteFill, Composition, registerRoot, useCurrentFrame } from "remotion";
import type { CalculateMetadataFunction } from "remotion";
import { loadFont } from "@remotion/google-fonts/FiraCode";
import { createHighlighter } from "shiki";
import "./styles.css";
import { LANGUAGES, THEMES } from "../../../src/constants";
import { measureReel } from "../../../src/reel/measure";
import { Reel } from "../../../src/reel/Reel";
import { buildScene, type Scene } from "../../../src/reel/scene";
import { FPS, sceneDuration } from "../../../src/reel/timeline";
import { parseSpec, toReelInput } from "./spec";
import example from "../spec.example.json";

// The editor's code font (next/font Fira_Code in src/fonts.ts).
const font = loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });

// The input props are the spec itself, so `--props=spec.json` takes the file as
// is. `scene` is derived from it and never passed in.
type Props = Record<string, unknown> & { scene?: Scene };

// Layout needs the font's real metrics, so the scene is built once here, after
// the font loads, and every frame renders from it without measuring again.
const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  const { scene: _derived, ...input } = props;
  const spec = parseSpec(input);
  const [highlighter] = await Promise.all([
    createHighlighter({
      themes: [THEMES[spec.theme].shikiTheme],
      langs: [LANGUAGES[spec.language].shiki],
    }),
    font.waitUntilDone(),
  ]);
  const scene = buildScene(toReelInput(spec), highlighter, font.fontFamily);
  return {
    ...measureReel(scene),
    fps: FPS,
    durationInFrames: Math.max(1, sceneDuration(scene)),
    props: { ...props, scene },
  };
};

const Video = ({ scene }: Props) => (
  <AbsoluteFill>
    <Reel scene={scene!} frame={useCurrentFrame()} />
  </AbsoluteFill>
);

const Root = () => (
  <Composition
    id="CodeReel"
    component={Video}
    defaultProps={example as Props}
    calculateMetadata={calculateMetadata}
  />
);

registerRoot(Root);
