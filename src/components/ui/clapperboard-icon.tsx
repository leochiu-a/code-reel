"use client";

import { forwardRef, useImperativeHandle } from "react";
import type { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimation, type Variants } from "motion/react";

// From lucide-animated's `clap`: the board dips, then the clapper snaps shut.
const BOARD_VARIANTS: Variants = {
  normal: { rotate: 0, originX: "4px", originY: "20px" },
  animate: {
    rotate: [-10, -10, 0],
    transition: { duration: 0.8, times: [0, 0.5, 1], ease: "easeInOut" },
  },
};

const CLAPPER_VARIANTS: Variants = {
  normal: { rotate: 0, originX: "3px", originY: "11px" },
  animate: {
    rotate: [0, -10, 16, 0],
    transition: { duration: 0.4, times: [0, 0.3, 0.6, 1], ease: "easeInOut" },
  },
};

const ClapperboardIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }, ref) => {
    const controls = useAnimation();

    const start = () => {
      controls.start("animate");
    };

    const stop = () => {
      controls.start("normal");
    };

    useImperativeHandle(ref, () => {
      return {
        startAnimation: start,
        stopAnimation: stop,
      };
    });

    return (
      <motion.div
        onHoverStart={start}
        onHoverEnd={stop}
        className={`inline-flex cursor-pointer items-center justify-center ${className}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ overflow: "visible" }}
        >
          <motion.g animate={controls} variants={BOARD_VARIANTS}>
            <motion.g animate={controls} variants={CLAPPER_VARIANTS}>
              <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z" />
              <path d="m6.2 5.3 3.1 3.9" />
              <path d="m12.4 3.4 3.1 4" />
            </motion.g>
            <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          </motion.g>
        </svg>
      </motion.div>
    );
  },
);

ClapperboardIcon.displayName = "ClapperboardIcon";

export default ClapperboardIcon;
