import React from "react";
import clsx from "clsx";
import styles from "./Frame.module.css";

export type FrameId = "vercel" | "tailwind" | "prisma";

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
  children,
}) => {
  const framePresentation = FRAME_PRESENTATION;
  const frameBackground = frame === "vercel" ? "#000000" : background;
  const shouldUseWindowShell = frame !== "vercel" && frame !== "tailwind" && frame !== "prisma";
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

  if (frame === "vercel") {
    return (
      <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
        <div className={clsx(styles.frame, styles.vercelFrame)} style={style}>
          <div className={styles.vercelWindow}>
            <span className={styles.vercelGridlinesHorizontal} data-grid />
            <span className={styles.vercelGridlinesVertical} data-grid />
            <span className={styles.vercelBracketLeft} data-grid />
            <span className={styles.vercelBracketRight} data-grid />
            <div className={styles.content}>{shellContent}</div>
          </div>
        </div>
      </div>
    );
  }

  if (frame === "tailwind") {
    return (
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

            <div className={styles.content}>{shellContent}</div>
          </div>
        </div>
      </div>
    );
  }

  if (frame === "prisma") {
    return (
      <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
        <div className={clsx(styles.frame, styles.prismaFrame)} style={style}>
          <div className={styles.prismaWindow}>
            <span data-frameborder />
            <span data-frameborder />
            <span data-frameborder />
            <span data-frameborder />

            <div className={styles.content}>{shellContent}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
      <div className={styles.frame} style={style}>
        <div className={styles.content}>{shellContent}</div>
      </div>
    </div>
  );
};

export default Frame;
