import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./gemini.module.css";
import type { FrameComponent } from "./types";

const GeminiFrame: FrameComponent = ({ style, title, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.geminiFrame)}
    style={{ ...style, background: "#0e1016" }}
  >
    <div className={styles.geminiStars} aria-hidden />
    <div className={styles.geminiWindow}>
      <div className={styles.geminiHeader}>
        <span className={styles.geminiFileName}>{title}</span>
      </div>

      <div>{children}</div>
    </div>
  </div>
);

export default GeminiFrame;
