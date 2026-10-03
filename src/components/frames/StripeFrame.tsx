import clsx from "clsx";
import type React from "react";
import baseStyles from "../Frame.module.css";
import styles from "./stripe.module.css";
import type { FrameComponent } from "./types";

const Gridlines = () => (
  <>
    <div className={styles.stripeGridline} />
    <div className={styles.stripeGridline} />
    <div className={styles.stripeGridline} />
    <div className={styles.stripeGridline} />
    <div className={styles.stripeGridline} />
  </>
);

const StripeFrame: FrameComponent = ({ style, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.stripeFrame)}
    style={
      {
        ...style,
        background: "#0a2540",
        "--stripe-padding": style.padding,
      } as React.CSSProperties
    }
  >
    <div className={styles.stripeBackground} aria-hidden>
      <div className={styles.stripeGridlineContainer}>
        <Gridlines />
      </div>
      <div className={styles.stripeBand}>
        <div className={styles.stripeGridlineContainer}>
          <Gridlines />
          <div className={styles.stripeSet}>
            <div className={styles.stripeLayer1} />
            <div className={styles.stripeLayer2} />
            <div className={styles.stripeIntersection} />
          </div>
        </div>
      </div>
    </div>
    <div className={styles.stripeWindow}>{children}</div>
  </div>
);

export default StripeFrame;
