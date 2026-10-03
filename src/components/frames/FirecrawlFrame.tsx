import clsx from "clsx";
import type React from "react";
import baseStyles from "../Frame.module.css";
import styles from "./firecrawl.module.css";
import type { FrameComponent } from "./types";

const FIRECRAWL_ASCII_ART = `                                   .. ..-
                                   :          .
                              ..        .   ..-
                            .        .._  ..-...:.              ..       .
                  .      .  .-.    ...     .-.-.._.-   ..        .-..     .      .
               ...._. . .-.....-:....      ..-::.::._=:.  ....       ...  .-      ....
             .....-._.._.:.....-.+:....-..    .....-:+++++++=:..-.---..    ...:.-..      ....
           .._.-._.-.:_.:-.  ...+..+:._-....:-._:+++++===+:_:+:....      -..+++++.:..  .-._-..      .
        .........--::+:._-:-.._..-.+:.-_::++_.:+:+========+=+:+:--..  .   _-_.:+===+-. ._..+:.-........  .
       ....-..---_-++====+:_:=:..+:.:+=+-..._++++======X==========++::.:+-..  .:+====X==+=++++++-.-......
     .......-:+:_:+:++=XX=X======++++++=X===::+++:++==XXXXXX===+==++===+=+=========XXX===++++=+:_---...-..-.
    ....._.:++======+===XXXXXXXX=+=++============XXXXXXXXXX============X======XXXXXXX======X==++:._---_`;

const STAR_PATH =
  "M10.5 4C10.5 7.31371 7.81371 10 4.5 10H0.5V11H4.5C7.81371 11 10.5 13.6863 10.5 17V21H11.5V17C11.5 13.6863 14.1863 11 17.5 11H21.5V10H17.5C14.1863 10 11.5 7.31371 11.5 4V0H10.5V4Z";

const Star = ({ className }: { className: string }) => (
  <svg className={clsx(styles.firecrawlStar, className)} viewBox="0 0 22 21">
    <path d={STAR_PATH} />
  </svg>
);

const FirecrawlFrame: FrameComponent = ({ style, children }) => (
  <div
    className={clsx(baseStyles.frame, styles.firecrawlFrame)}
    style={
      {
        ...style,
        background: "#000000",
        "--firecrawl-padding": style.padding,
      } as React.CSSProperties
    }
  >
    <div className={styles.firecrawlWindow}>
      <div className={styles.firecrawlAsciiArtContainer} aria-hidden>
        <pre className={styles.firecrawlAsciiArt}>{FIRECRAWL_ASCII_ART}</pre>
      </div>
      {children}
    </div>
    {/* Lines run edge to edge and cross at the window's corners, each marked by a star. */}
    <div className={styles.firecrawlGrid} aria-hidden data-grid>
      <Star className={styles.firecrawlStarTopLeft} />
      <Star className={styles.firecrawlStarTopRight} />
      <Star className={styles.firecrawlStarBottomLeft} />
      <Star className={styles.firecrawlStarBottomRight} />
    </div>
  </div>
);

export default FirecrawlFrame;
