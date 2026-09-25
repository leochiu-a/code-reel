import { Composition, registerRoot } from "remotion";
import { Showreel } from "./Showreel";
import { DURATION, FPS } from "./timeline";

const Root = () => (
  <Composition
    id="Showreel"
    component={Showreel}
    durationInFrames={DURATION}
    fps={FPS}
    width={1920}
    height={1080}
  />
);

registerRoot(Root);
