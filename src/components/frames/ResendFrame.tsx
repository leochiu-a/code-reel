import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./resend.module.css";
import type { FrameComponent } from "./types";

// The pattern is the canvas, so the user's background setting is overridden.
const ResendFrame: FrameComponent = ({ style, title, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.resendFrame)}
    style={{ ...style, background: "#000000" }}
  >
    <div className={styles.resendPattern} aria-hidden />
    <div className={styles.resendWindow}>
      <div className={styles.resendHeader}>
        <span className={styles.resendFileName}>{title}</span>
      </div>
      {children}
    </div>
  </div>
);

export default ResendFrame;
