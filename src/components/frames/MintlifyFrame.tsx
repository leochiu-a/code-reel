import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./mintlify.module.css";
import type { FrameComponent } from "./types";

const MintlifyFrame: FrameComponent = ({ style, title, children }) => (
  <div className={clsx(baseStyles.frame, styles.mintlifyFrame)} style={style}>
    <span className={styles.mintlifyPatternWrapper} aria-hidden>
      <span className={styles.mintlifyPattern} />
    </span>
    <div className={styles.mintlifyWindow}>
      <div className={styles.mintlifyHeader}>
        <div className={styles.mintlifyFileName}>{title}</div>
      </div>
      {children}
    </div>
  </div>
);

export default MintlifyFrame;
