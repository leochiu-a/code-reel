import clsx from "clsx";
import baseStyles from "../Frame.module.css";
import styles from "./auth0.module.css";
import type { FrameComponent } from "./types";

const Auth0Frame: FrameComponent = ({ style, title, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.auth0Frame)}
    style={{
      ...style,
      background: "linear-gradient(215deg, #191919 30%, #4612a7 60%, #375aed 100%)",
    }}
  >
    <div className={styles.auth0Shell}>
      <span className={styles.auth0GridlinesHorizontal} data-grid />
      <span className={styles.auth0GridlinesVertical} data-grid />
      <div className={styles.auth0Toolbar}>
        <div className={styles.auth0Controls}>
          <span className={styles.auth0Control} />
          <span className={styles.auth0Control} />
          <span className={styles.auth0Control} />
        </div>
        <div className={styles.auth0Badge}>{title}</div>
      </div>
      <div className={styles.auth0Window}>{children}</div>
    </div>
  </div>
);

export default Auth0Frame;
