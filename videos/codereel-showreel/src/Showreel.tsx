import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { SCENES } from "./timeline";
import { Ignition } from "./scenes/Ignition";
import { Kinetic } from "./scenes/Kinetic";
import { Product } from "./scenes/Product";
import { Themes } from "./scenes/Themes";
import { EndCard } from "./scenes/EndCard";
import { Grain, Hud } from "./components/Overlay";

const SCENE_COMPONENTS = {
  ignition: Ignition,
  kinetic: Kinetic,
  product: Product,
  themes: Themes,
  end: EndCard,
};

export const Showreel = () => (
  <AbsoluteFill style={{ background: "#050505" }}>
    {(Object.keys(SCENES) as (keyof typeof SCENES)[]).map((name) => {
      const Scene = SCENE_COMPONENTS[name];
      return (
        <Sequence
          key={name}
          name={name}
          from={SCENES[name].from}
          durationInFrames={SCENES[name].duration}
        >
          <Scene />
        </Sequence>
      );
    })}
    <Grain />
    <Hud />
    <Audio src={staticFile("score.wav")} />
  </AbsoluteFill>
);
