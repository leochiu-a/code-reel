import { Composition, registerRoot, type CalculateMetadataFunction } from "remotion";
import { loadFont } from "@remotion/google-fonts/FiraCode";
import "./styles.css";
import { CodeReel } from "./CodeReel";
import { measureReel } from "./measure";
import { buildScene, type Scene } from "./scene";
import { parseSpec } from "./spec";
import { FPS, sceneDuration } from "./timeline";
import example from "../spec.example.json";

// The editor's code font (next/font Fira_Code in src/components/CodeEditor.tsx).
const font = loadFont("normal", { weights: ["400", "700"], subsets: ["latin"] });

// The input props are the spec itself, so `--props=spec.json` takes the file as
// is. `scene` is derived from it and never passed in.
type Props = Record<string, unknown> & { scene?: Scene };

// Layout needs the font's real metrics, so the scene is built once here, after
// the font loads, and every frame renders from it without measuring again.
const calculateMetadata: CalculateMetadataFunction<Props> = async ({ props }) => {
  await font.waitUntilDone();
  const { scene: _derived, ...spec } = props;
  const scene = await buildScene(parseSpec(spec), font.fontFamily);
  return {
    ...measureReel(scene),
    fps: FPS,
    durationInFrames: Math.max(1, sceneDuration(scene)),
    props: { ...props, scene },
  };
};

const Video = ({ scene }: Props) => <CodeReel scene={scene!} />;

const Root = () => (
  <Composition
    id="CodeReel"
    component={Video}
    defaultProps={example as Props}
    calculateMetadata={calculateMetadata}
  />
);

registerRoot(Root);
