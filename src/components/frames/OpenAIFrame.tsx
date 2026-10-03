import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./openai.module.css";
import type { FrameComponent } from "./types";

const OpenAIFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.openaiFrame)} style={style}>
    <div className={styles.openaiWindow}>{children}</div>
  </div>
);

export default OpenAIFrame;
