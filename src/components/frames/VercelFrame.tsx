import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./vercel.module.css";
import type { FrameComponent } from "./types";

const VercelFrame: FrameComponent = ({ style, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.vercelFrame)}
    style={{ ...style, background: "#000000" }}
  >
    <div className={styles.vercelWindow}>
      <span className={styles.vercelGridlinesHorizontal} data-grid />
      <span className={styles.vercelGridlinesVertical} data-grid />
      <span className={styles.vercelBracketLeft} data-grid />
      <span className={styles.vercelBracketRight} data-grid />
      {children}
    </div>
  </div>
);

export default VercelFrame;
