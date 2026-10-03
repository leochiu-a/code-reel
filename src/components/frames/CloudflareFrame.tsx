import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./cloudflare.module.css";
import type { FrameComponent } from "./types";

const CloudflareFrame: FrameComponent = ({ style, title, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.cloudflareFrame)}
    style={{ ...style, background: "#0c0c0c" }}
  >
    <div className={styles.cloudflareWindow}>
      <span className={styles.cloudflareGridlinesHorizontal} data-grid />
      <span className={styles.cloudflareGridlinesVertical} data-grid />
      <div className={styles.cloudflareHeader}>
        <span className={styles.cloudflareFileName}>{title}</span>
      </div>

      {children}
    </div>
  </div>
);

export default CloudflareFrame;
