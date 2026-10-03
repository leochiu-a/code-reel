import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./supabase.module.css";
import type { FrameComponent } from "./types";

const SupabaseFrame: FrameComponent = ({ style, children }) => (
  <div className={clsx(baseStyles.frame, styles.supabaseFrame)} style={style}>
    <div className={styles.supabaseWindow}>{children}</div>
  </div>
);

export default SupabaseFrame;
