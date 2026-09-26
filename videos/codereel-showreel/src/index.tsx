import { Composition, Still, registerRoot } from "remotion";
import { Showreel } from "./Showreel";
import { Thumbnail } from "./Thumbnail";
import { DURATION, FPS } from "./timeline";

const Root = () => (
  <>
    <Composition
      id="Showreel"
      component={Showreel}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);

registerRoot(Root);
