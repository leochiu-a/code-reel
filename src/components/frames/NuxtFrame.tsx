import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./nuxt.module.css";
import type { FrameComponent } from "./types";

const NuxtFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.nuxtFrame)} style={style}>
    <div className={styles.nuxtStars} aria-hidden />
    <div className={styles.nuxtWindow}>
      <span data-frameborder />
      <span data-frameborder />
      <span data-frameborder />
      {children}
    </div>
  </div>
);

export default NuxtFrame;
