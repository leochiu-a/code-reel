import { NextResponse } from "next/server";
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import puppeteer from "puppeteer";
import {
  EXPORT_CAPTURE_FORMAT,
  EXPORT_CAPTURE_QUALITY,
  EXPORT_DEVICE_SCALE,
  EXPORT_PAGE_PATH,
  EXPORT_VIDEO_FPS,
  EXPORT_VIEWPORT,
  PLAY_ANIMATION_INTERVAL_MS,
} from "@/constants";
import type { EditorSettings } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportVideoRequest = {
  snippets: { id?: string; code: string; title?: string }[];
  settings: EditorSettings;
  intervalMs?: number;
  fps?: number;
  pagePath?: string;
  headless?: boolean;
  debug?: boolean;
  captureFormat?: "jpeg" | "png";
  captureQuality?: number;
  deviceScaleFactor?: number;
};

const runCommand = (command: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(stderr || `${command} exited with code ${code}`));
    });
  });

const resolveChromePath = async () => {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const candidates =
    process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ]
      : process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        ]
      : [
          "/usr/bin/google-chrome",
          "/usr/bin/google-chrome-stable",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser",
        ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  return null;
};

export async function POST(request: Request) {
  let tempDir = "";
  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    const body = (await request.json()) as ExportVideoRequest;
    if (!body?.snippets?.length || !body.settings) {
      return NextResponse.json(
        { error: "Missing snippets or settings." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const debug = process.env.PUPPETEER_DEBUG === "1";
    const targetFps = body.fps && body.fps > 0 ? body.fps : EXPORT_VIDEO_FPS;
    const captureFormat =
      body.captureFormat === "png" || body.captureFormat === "jpeg"
        ? body.captureFormat
        : EXPORT_CAPTURE_FORMAT;
    const captureQuality =
      typeof body.captureQuality === "number"
        ? Math.min(100, Math.max(1, body.captureQuality))
        : EXPORT_CAPTURE_QUALITY;
    const deviceScaleFactor =
      typeof body.deviceScaleFactor === "number" && body.deviceScaleFactor > 0
        ? body.deviceScaleFactor
        : EXPORT_DEVICE_SCALE;
    const intervalMs =
      body.intervalMs && body.intervalMs > 0
        ? body.intervalMs
        : PLAY_ANIMATION_INTERVAL_MS;
    const pagePath = body.pagePath ?? EXPORT_PAGE_PATH;
    const headless = debug ? false : body.headless ?? true;
    const publicOrigin = process.env.PUBLIC_ORIGIN?.trim();
    let origin: string;
    if (publicOrigin) {
      origin = new URL(publicOrigin).origin;
    }

    const pageUrl = new URL(pagePath, origin).toString();

    tempDir = await mkdtemp(path.join(tmpdir(), "codesnap-video-"));
    const framesDir = path.join(tempDir, "frames");
    await writeFile(path.join(tempDir, ".gitignore"), "*");
    await mkdir(framesDir, { recursive: true });

    const executablePath = await resolveChromePath();
    browser = await puppeteer.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      ...(executablePath ? { executablePath } : {}),
      ...(debug ? { slowMo: 50 } : {}),
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: EXPORT_VIEWPORT.width,
      height: EXPORT_VIEWPORT.height,
      deviceScaleFactor,
    });

    await page.goto(pageUrl, { waitUntil: "domcontentloaded" });
    const hydratedSnippets = body.snippets.map((snippet, index) => ({
      id: snippet.id ?? `export-step-${index}`,
      title: snippet.title ?? `Step ${index + 1}`,
      code: snippet.code,
    }));
    await page.evaluate(
      ({ snippets, settings }) => {
        localStorage.setItem("codesnap-snippets", JSON.stringify(snippets));
        localStorage.setItem("codesnap-current-step", "0");
        localStorage.setItem("codesnap-settings", JSON.stringify(settings));
      },
      { snippets: hydratedSnippets, settings: body.settings }
    );
    await page.reload({ waitUntil: "networkidle0" });

    await page.waitForFunction(
      () => (window as any).__codesnap_ready === true,
      {
        timeout: 15000,
      }
    );
    await page.waitForSelector("#code-capture-area");
    const captureClip = await page.evaluate(() => {
      const element = document.getElementById("code-capture-area");
      if (!element) return null;
      element.scrollIntoView({ block: "center", inline: "center" });
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    });
    if (!captureClip) {
      throw new Error("Failed to find capture area.");
    }
    const transitionCount = Math.max(body.snippets.length - 1, 0);
    const totalDurationMs = Math.max(1, intervalMs * transitionCount);
    const totalDurationSec = totalDurationMs / 1000;
    const totalFrames = Math.max(1, Math.ceil(totalDurationSec * targetFps));
    const frameIntervalSec = 1 / targetFps;
    const frameExtension = captureFormat === "png" ? "png" : "jpg";

    const viewport = page.viewport();
    const viewportWidth = viewport?.width ?? 1600;
    const viewportHeight = viewport?.height ?? 900;
    const toEven = (value: number) => (value % 2 === 0 ? value : value - 1);
    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);
    const cropX = clamp(Math.floor(captureClip.x), 0, viewportWidth - 2);
    const cropY = clamp(Math.floor(captureClip.y), 0, viewportHeight - 2);
    const maxWidth = Math.max(2, viewportWidth - cropX);
    const maxHeight = Math.max(2, viewportHeight - cropY);
    const cropWidth = clamp(Math.floor(captureClip.width), 2, maxWidth);
    const cropHeight = clamp(Math.floor(captureClip.height), 2, maxHeight);
    const crop = {
      x: toEven(cropX),
      y: toEven(cropY),
      width: toEven(cropWidth),
      height: toEven(cropHeight),
    };
    if (crop.width <= 0 || crop.height <= 0) {
      throw new Error("Invalid capture crop size.");
    }

    const framePaths: string[] = [];
    const frameWrites: Promise<void>[] = [];
    const screencastSession = await page.target().createCDPSession();
    let capturing = false;
    let playTriggered = false;
    let startTimestamp: number | null = null;
    let nextCaptureTime = 0;
    let endTimestamp = 0;
    let recordedFrames = 0;
    let stopResolve: (() => void) | null = null;
    let stopped = false;
    let stopPromise: Promise<void> | null = null;
    const startStopTimer = () => {
      stopPromise = new Promise<void>((resolve) => {
        stopResolve = resolve;
        setTimeout(() => {
          if (stopped) return;
          stopped = true;
          resolve();
        }, totalDurationMs + 2000);
      });
    };

    screencastSession.on("Page.screencastFrame", async (event) => {
      await screencastSession.send("Page.screencastFrameAck", {
        sessionId: event.sessionId,
      });
      if (!capturing || stopped || !playTriggered) return;

      const timestamp = event.metadata?.timestamp ?? 0;
      if (startTimestamp === null) {
        startTimestamp = timestamp;
        nextCaptureTime = startTimestamp;
        endTimestamp = startTimestamp + totalDurationSec;
      }
      if (timestamp + 1e-6 < nextCaptureTime) return;
      if (recordedFrames >= totalFrames) {
        stopped = true;
        stopResolve?.();
        return;
      }

      const frameIndex = recordedFrames;
      recordedFrames += 1;
      nextCaptureTime = startTimestamp + recordedFrames * frameIntervalSec;

      const framePath = path.join(
        framesDir,
        `frame-${String(frameIndex).padStart(4, "0")}.${frameExtension}`
      );
      framePaths.push(framePath);
      frameWrites.push(writeFile(framePath, Buffer.from(event.data, "base64")));

      if (recordedFrames >= totalFrames || timestamp >= endTimestamp) {
        stopped = true;
        stopResolve?.();
      }
    });

    const screencastOptions: { format: "jpeg" | "png"; quality?: number } = {
      format: captureFormat,
    };
    if (captureFormat === "jpeg") {
      screencastOptions.quality = captureQuality;
    }
    await screencastSession.send("Page.startScreencast", screencastOptions);

    playTriggered = true;
    await page.evaluate(() => {
      (window as any).__codesnap_play?.();
    });

    if (body.snippets.length > 1) {
      try {
        await page.waitForFunction(
          () => (window as any).__codesnap_previewIndex >= 1,
          { timeout: Math.max(intervalMs * 2, 3000) }
        );
      } catch {
        // Continue even if the transition signal is late.
      }
    }

    capturing = true;
    startStopTimer();

    if (!stopPromise) {
      throw new Error("Failed to start capture timer.");
    }
    await stopPromise;
    await screencastSession.send("Page.stopScreencast");
    await Promise.all(frameWrites);

    if (framePaths.length === 0) {
      throw new Error("No frames captured.");
    }
    if (framePaths.length < totalFrames) {
      const lastFrame = framePaths[framePaths.length - 1];
      for (let index = framePaths.length; index < totalFrames; index += 1) {
        const framePath = path.join(
          framesDir,
          `frame-${String(index).padStart(4, "0")}.${frameExtension}`
        );
        await copyFile(lastFrame, framePath);
        framePaths.push(framePath);
      }
    }

    const outputPath = path.join(
      tempDir,
      `codesnap-${Date.now().toString()}.mp4`
    );
    await runCommand("ffmpeg", [
      "-y",
      "-framerate",
      targetFps.toString(),
      "-i",
      path.join(framesDir, `frame-%04d.${frameExtension}`),
      "-vf",
      `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
      "-pix_fmt",
      "yuv420p",
      outputPath,
    ]);

    const video = await readFile(outputPath);

    return new NextResponse(video, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="codesnap-${Date.now()}.mp4"`,
      },
    });
  } catch (error) {
    console.error("Video export failed:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Video export failed.",
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close().catch(() => undefined);
    }
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true }).catch(
        () => undefined
      );
    }
  }
}
