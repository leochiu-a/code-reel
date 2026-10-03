import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./tailwind.module.css";
import type { FrameComponent } from "./types";

const TailwindFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.tailwindFrame)} style={style}>
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

      {children}
    </div>
  </div>
);

export default TailwindFrame;
