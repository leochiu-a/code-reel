import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./prisma.module.css";
import type { FrameComponent } from "./types";

const PrismaFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.prismaFrame)} style={style}>
    <div className={styles.prismaWindow}>
      <span data-frameborder />
      <span data-frameborder />
      <span data-frameborder />
      <span data-frameborder />

      {children}
    </div>
  </div>
);

export default PrismaFrame;
