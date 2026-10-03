import React, { ViewTransition } from "react";
import baseStyles from "./Frame.module.css";
import { FRAMES, type FrameId } from "./frames";

export type { FrameId };

export type FramePresentation = {
  editorLineHeightMultiplier: number;
  editorPaddingY: number;
  editorPaddingX: number;
  editorShellClassName: string;
  editorFontFamily: string;
  editorContainerTransparent: boolean;
  editorContainerRadius: number;
};

export const FRAME_PRESENTATION: FramePresentation = {
  editorLineHeightMultiplier: 1.5,
  editorPaddingY: 16,
  editorPaddingX: 16,
  editorShellClassName: "relative overflow-hidden",
  editorFontFamily: "Fira Code, monospace",
  editorContainerTransparent: true,
  editorContainerRadius: 0,
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
  const BrandFrame = frame && FRAMES[frame];
  const shouldUseWindowShell = !BrandFrame;
  const windowShellStyle: React.CSSProperties | undefined = shouldUseWindowShell
    ? {
        borderRadius: `${borderRadius}px`,
        backgroundColor: themeBackground,
        boxShadow: borderShadow === "border-none" ? "none" : borderShadow,
      }
    : undefined;
  const windowHeaderStyle: React.CSSProperties | undefined = shouldUseWindowShell
    ? {
        // Neutral so the divider reads on light and dark themes alike.
        borderBottom: "1px solid rgba(128, 128, 128, 0.2)",
        borderTopLeftRadius: `${borderRadius}px`,
        borderTopRightRadius: `${borderRadius}px`,
      }
    : undefined;
  const containerStyle: React.CSSProperties = {
    backgroundColor: framePresentation.editorContainerTransparent ? "transparent" : themeBackground,
    borderRadius: `${framePresentation.editorContainerRadius}px`,
    fontSize: `${fontSize}px`,
    height: "100%",
  };
  const style = {
    ["--frame-radius" as string]: `${borderRadius}px`,
    padding: `${padding}px`,
    background,
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
            <span className="font-mono text-xs font-medium tracking-wide text-neutral-500">
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
      <div className={baseStyles.content}>{shellContent}</div>
    </ViewTransition>
  );
  const named = (node: React.ReactElement) => (
    <ViewTransition name={viewTransitionName} share="morph" default="none">
      {node}
    </ViewTransition>
  );

  return named(
    <div className="relative flex w-full flex-col overflow-hidden" style={containerStyle}>
      {BrandFrame ? (
        <BrandFrame style={style} title={windowTitle}>
          {content}
        </BrandFrame>
      ) : (
        <div className={baseStyles.frame} style={style}>
          {content}
        </div>
      )}
    </div>,
  );
};

export default Frame;
