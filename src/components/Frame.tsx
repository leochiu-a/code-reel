import React, { ViewTransition } from "react";
import clsx from "clsx";
import baseStyles from "./Frame.module.css";
import prismaStyles from "./frames/prisma.module.css";
import tailwindStyles from "./frames/tailwind.module.css";
import triggerStyles from "./frames/trigger.module.css";
import vercelStyles from "./frames/vercel.module.css";

// Each frame's classes come from its own module: a CSS `@import` between
// modules does not re-export the imported class names under every bundler.
const styles = {
  ...baseStyles,
  ...vercelStyles,
  ...tailwindStyles,
  ...prismaStyles,
  ...triggerStyles,
};

export type FrameId = "vercel" | "tailwind" | "prisma" | "trigger";

export type FramePresentation = {
  editorLineHeightMultiplier: number;
  editorPaddingY: number;
  editorPaddingX: number;
  editorShellClassName: string;
  editorFontFamily: string;
  editorContainerTransparent: boolean;
  editorContainerRadius: number;
  editorContainerShadow: "none" | "theme";
};

export const FRAME_PRESENTATION: FramePresentation = {
  editorLineHeightMultiplier: 1.5,
  editorPaddingY: 16,
  editorPaddingX: 16,
  editorShellClassName: "relative overflow-hidden",
  editorFontFamily: "Fira Code, monospace",
  editorContainerTransparent: true,
  editorContainerRadius: 0,
  editorContainerShadow: "none",
};

type FrameProps = {
  frame?: FrameId;
  borderRadius: number;
  padding: number;
  background: string;
  themeBackground: string;
  fontSize: number;
  borderShadow: string;
  windowControls: boolean;
  windowTitle: string;
  /**
   * Names the frame and its code window for a shared view transition. They
   * morph as two layers: scaling the frame as one snapshot would carry the code
   * window's placement from one padding to the other and snap it at the end.
   */
  viewTransitionName?: string;
  children: React.ReactNode;
};

const Frame: React.FC<FrameProps> = ({
  frame,
  borderRadius,
  padding,
  background,
  themeBackground,
  fontSize,
  borderShadow,
  windowControls,
  windowTitle,
  viewTransitionName,
  children,
}) => {
  const framePresentation = FRAME_PRESENTATION;
  const frameBackground = frame === "vercel" ? "#000000" : background;
  const shouldUseWindowShell =
    frame !== "vercel" && frame !== "tailwind" && frame !== "prisma" && frame !== "trigger";
  const windowShellStyle: React.CSSProperties | undefined = shouldUseWindowShell
    ? {
        borderRadius: `${borderRadius}px`,
        backgroundColor: "rgba(45, 50, 60, 0.96)",
        boxShadow: borderShadow === "border-none" ? "none" : borderShadow,
      }
    : undefined;
  const windowHeaderStyle: React.CSSProperties | undefined = shouldUseWindowShell
    ? {
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        borderTopLeftRadius: `${borderRadius}px`,
        borderTopRightRadius: `${borderRadius}px`,
      }
    : undefined;
  const containerStyle: React.CSSProperties = {
    backgroundColor: framePresentation.editorContainerTransparent ? "transparent" : themeBackground,
    borderRadius: `${framePresentation.editorContainerRadius}px`,
    fontSize: `${fontSize}px`,
    boxShadow:
      framePresentation.editorContainerShadow === "none" || borderShadow === "border-none"
        ? "none"
        : borderShadow,
    height: "100%",
  };
  const style = {
    ["--frame-radius" as string]: `${borderRadius}px`,
    padding: `${padding}px`,
    background: frameBackground,
  };

  const shellContent = (
    <div style={windowShellStyle}>
      {windowControls && (
        <div
          className="relative flex h-10 items-center justify-center px-4"
          style={windowHeaderStyle}
        >
          <div className="absolute left-4 flex gap-2">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f] shadow-inner" />
          </div>
          <div className="flex items-center gap-2 opacity-60">
            <span className="font-mono text-xs font-medium tracking-wide text-white/60">
              {windowTitle}
            </span>
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  );

  const content = (
    <ViewTransition
      name={viewTransitionName && `${viewTransitionName}-code`}
      share="morph"
      default="none"
    >
      <div className={styles.content}>{shellContent}</div>
    </ViewTransition>
  );
  const named = (node: React.ReactElement) => (
    <ViewTransition name={viewTransitionName} share="morph" default="none">
      {node}
    </ViewTransition>
  );

  if (frame === "vercel") {
    return named(
      <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
        <div className={clsx(styles.frame, styles.vercelFrame)} style={style}>
          <div className={styles.vercelWindow}>
            <span className={styles.vercelGridlinesHorizontal} data-grid />
            <span className={styles.vercelGridlinesVertical} data-grid />
            <span className={styles.vercelBracketLeft} data-grid />
            <span className={styles.vercelBracketRight} data-grid />
            {content}
          </div>
        </div>
      </div>,
    );
  }

  if (frame === "tailwind") {
    return named(
      <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
        <div className={clsx(styles.frame, styles.tailwindFrame)} style={style}>
          <div className={styles.tailwindBeams} aria-hidden />
          <div className={styles.tailwindWindow}>
            <span className={styles.tailwindGridlinesHorizontal} data-grid />
            <span className={styles.tailwindGridlinesVertical} data-grid />
            <div className={styles.tailwindGradient}>
              <div>
                <div className={styles.tailwindGradient1} />
                <div className={styles.tailwindGradient2} />
              </div>
            </div>
            <div className={styles.tailwindHeader}>
              <div className={styles.tailwindControls}>
                <div className={styles.tailwindControl} />
                <div className={styles.tailwindControl} />
                <div className={styles.tailwindControl} />
              </div>
            </div>

            {content}
          </div>
        </div>
      </div>,
    );
  }

  if (frame === "prisma") {
    return named(
      <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
        <div className={clsx(styles.frame, styles.prismaFrame)} style={style}>
          <div className={styles.prismaWindow}>
            <span data-frameborder />
            <span data-frameborder />
            <span data-frameborder />
            <span data-frameborder />

            {content}
          </div>
        </div>
      </div>,
    );
  }

  if (frame === "trigger") {
    return named(
      <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
        <div className={clsx(styles.frame, styles.triggerFrame)} style={style}>
          <div className={styles.triggerPatternTop} aria-hidden />
          <div className={styles.triggerPatternBottom} aria-hidden />
          <div className={styles.triggerWindow}>
            <span className={styles.triggerGridlinesHorizontal} data-grid />
            <span className={styles.triggerGridlinesVertical} data-grid />
            {content}
          </div>
        </div>
      </div>,
    );
  }

  return named(
    <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
      <div className={styles.frame} style={style}>
        {content}
      </div>
    </div>,
  );
};

export default Frame;
