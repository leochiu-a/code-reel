import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./clerk.module.css";
import type { FrameComponent } from "./types";

const ClerkFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.clerkFrame)} style={style}>
    <div className={styles.clerkPattern} aria-hidden />
    <div className={styles.clerkWindow}>
      <div className={styles.clerkCode}>{children}</div>
    </div>
  </div>
);

export default ClerkFrame;
