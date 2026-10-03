import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./browserbase.module.css";
import type { FrameComponent } from "./types";

const VERTICAL_GRID_POSITIONS = [12.5, 25, 37.5, 50, 62.5, 75, 87.5];
const HORIZONTAL_GRID_POSITIONS = [25, 50, 75];

const BrowserbaseFrame: FrameComponent = ({ style, title, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.browserbaseFrame)}
    style={{ ...style, background: "#000000" }}
  >
    <div className={styles.browserbaseBackground} aria-hidden>
      {VERTICAL_GRID_POSITIONS.map((position) => (
        <div
          key={position}
          className={clsx(styles.browserbaseGridline, styles.browserbaseGridlineVertical)}
          style={{ left: `${position}%` }}
        />
      ))}
      {HORIZONTAL_GRID_POSITIONS.map((position) => (
        <div
          key={position}
          className={clsx(styles.browserbaseGridline, styles.browserbaseGridlineHorizontal)}
          style={{ top: `${position}%` }}
        />
      ))}
    </div>
    <div className={styles.browserbaseWindow}>
      <div className={styles.browserbaseHeader}>
        <div className={styles.browserbaseControls}>
          <div className={styles.browserbaseControl} />
          <div className={styles.browserbaseControl} />
          <div className={styles.browserbaseControl} />
        </div>
        <div className={styles.browserbaseTitle}>{title}</div>
        <div />
      </div>

      {children}
    </div>
  </div>
);

export default BrowserbaseFrame;
