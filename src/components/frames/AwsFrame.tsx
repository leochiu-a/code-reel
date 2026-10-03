import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./aws.module.css";
import type { FrameComponent } from "./types";

const AwsFrame: FrameComponent = ({ style, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.awsFrame)}
    style={{ ...style, background: "#151d26" }}
  >
    <div className={styles.awsWindow}>
      <span className={styles.awsGridlinesHorizontal} data-grid />
      <span className={styles.awsGridlinesVertical} data-grid />
      {children}
    </div>
  </div>
);

export default AwsFrame;
