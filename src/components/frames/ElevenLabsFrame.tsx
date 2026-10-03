"use client";

import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import baseStyles from "../Frame.module.css";
import styles from "./elevenlabs.module.css";
import type { FrameComponent } from "./types";

const ElevenLabsFrame: FrameComponent = ({ style, children }) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const [circleDiameter, setCircleDiameter] = useState(0);

  // The circle passes through the window's corners: its diameter is the diagonal.
  useEffect(() => {
    const element = windowRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setCircleDiameter(Math.hypot(element.offsetWidth, element.offsetHeight));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={clsx(baseStyles.frame, styles.elevenlabsFrame)} style={style}>
      <div className={styles.elevenlabsWindow} ref={windowRef}>
        <span
          className={styles.elevenlabsCircle}
          style={{ width: circleDiameter, height: circleDiameter }}
        />

        <span className={styles.elevenlabsGridlineHorizontalTop} />
        <span className={styles.elevenlabsGridlineHorizontalCenter} />
        <span className={styles.elevenlabsGridlineHorizontalBottom} />

        <span className={styles.elevenlabsGridlineVerticalLeft} />
        <span className={styles.elevenlabsGridlineVerticalCenter} />
        <span className={styles.elevenlabsGridlineVerticalRight} />

        <span className={styles.elevenlabsDotTopLeft} />
        <span className={styles.elevenlabsDotTopRight} />
        <span className={styles.elevenlabsDotBottomLeft} />
        <span className={styles.elevenlabsDotBottomRight} />

        <span className={styles.elevenlabsGridlineCornerTopLeft} />
        <span className={styles.elevenlabsGridlineCornerTopRight} />
        <span className={styles.elevenlabsGridlineCornerBottomRight} />
        <span className={styles.elevenlabsGridlineCornerBottomLeft} />

        <div className={styles.elevenlabsEditor}>{children}</div>
      </div>
    </div>
  );
};

export default ElevenLabsFrame;
