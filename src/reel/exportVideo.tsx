import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { createContext, destroyContext, domToCanvas } from "modern-screenshot";
import {
  BufferTarget,
  CanvasSource,
  getFirstEncodableVideoCodec,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
} from "mediabunny";
import { measureReel } from "./measure";
import { Reel } from "./Reel";
import type { Scene } from "./scene";
import { FPS, momentAt, sceneDuration } from "./timeline";

/** The browser has no WebCodecs encoder for any codec the export can write. */
export class VideoEncodingUnsupportedError extends Error {
  constructor() {
    super("This browser cannot encode video");
    this.name = "VideoEncodingUnsupportedError";
  }
}

// H.264 plays everywhere; the others cover browsers without an H.264 encoder.
const CODECS = ["avc", "vp9", "av1"] as const;

/**
 * Renders the reel frame by frame in the page and encodes it with WebCodecs.
 * Each frame is laid out off-screen and captured the way image export is, so
 * the video matches the editor's CSS, and the code never leaves the browser.
 */
export const exportReelVideo = async (
  scene: Scene,
  {
    scale = 2,
    onProgress,
  }: {
    scale?: number;
    /** Called after every frame with the share done, from 0 to 1. */
    onProgress?: (progress: number) => void;
  } = {},
): Promise<Blob> => {
  const size = measureReel(scene);
  const width = size.width * scale;
  const height = size.height * scale;
  const frames = Math.max(1, sceneDuration(scene));

  const codec = await getFirstEncodableVideoCodec([...CODECS], { width, height });
  if (!codec) throw new VideoEncodingUnsupportedError();

  // Off-screen but painted: a hidden element would be captured hidden too.
  const host = document.createElement("div");
  host.style.cssText = `position: fixed; top: 0; left: -100000px; width: ${size.width}px; height: ${size.height}px`;
  document.body.append(host);
  const root = createRoot(host);
  const renderFrame = (frame: number) =>
    flushSync(() => root.render(<Reel scene={scene} frame={frame} />));

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat(), target });
  const source = new CanvasSource(canvas, { codec, bitrate: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: FPS });

  // A step on hold looks the same on every frame, so it is captured once and
  // the canvas is encoded again for the rest of the hold.
  let stillOnCanvas: number | null = null;
  renderFrame(0);
  // One context for every frame keeps fonts and styles embedded once.
  const context = await createContext(host, { scale, width: size.width, height: size.height });
  try {
    await output.start();
    for (let frame = 0; frame < frames; frame++) {
      const moment = momentAt(scene, frame);
      const still = moment.kind === "still" ? moment.step : null;
      if (still === null || still !== stillOnCanvas) {
        renderFrame(frame);
        // Frames are rendered into one DOM and one canvas, so they go strictly in order.
        // oxlint-disable-next-line no-await-in-loop
        const shot = await domToCanvas(context);
        ctx.drawImage(shot, 0, 0, width, height);
      }
      stillOnCanvas = still;
      // Awaiting respects the encoder's backpressure.
      // oxlint-disable-next-line no-await-in-loop
      await source.add(frame / FPS, 1 / FPS);
      onProgress?.((frame + 1) / frames);
    }
    source.close();
    await output.finalize();
  } finally {
    destroyContext(context);
    root.unmount();
    host.remove();
  }

  return new Blob([target.buffer!], { type: output.format.mimeType });
};
