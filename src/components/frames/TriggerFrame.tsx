import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./trigger.module.css";
import type { FrameComponent } from "./types";

const TriggerFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.triggerFrame)} style={style}>
    <div className={styles.triggerPatternTop} aria-hidden />
    <div className={styles.triggerPatternBottom} aria-hidden />
    <div className={styles.triggerWindow}>
      <span className={styles.triggerGridlinesHorizontal} data-grid />
      <span className={styles.triggerGridlinesVertical} data-grid />
      {children}
    </div>
  </div>
);

export default TriggerFrame;
