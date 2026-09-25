"use client";

import { forwardRef, useImperativeHandle } from "react";
import { AnimatedIconHandle, AnimatedIconProps } from "./types";
import { motion, useAnimation, type Variants } from "motion/react";

// lucide-animated's arrow-right: the shaft pulls in while the head nudges back.
const SHAFT_VARIANTS: Variants = {
  normal: { d: "M5 12h14" },
  animate: { d: ["M5 12h14", "M5 12h9", "M5 12h14"], transition: { duration: 0.4 } },
};

const HEAD_VARIANTS: Variants = {
  normal: { translateX: 0 },
  animate: { translateX: [0, -3, 0], transition: { duration: 0.4 } },
};

const ArrowRightIcon = forwardRef<AnimatedIconHandle, AnimatedIconProps>(
  ({ size = 24, color = "currentColor", strokeWidth = 2, className = "" }, ref) => {
    const controls = useAnimation();

    useImperativeHandle(ref, () => ({
      startAnimation: () => controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    }));

    return (
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
        className={className}
        aria-hidden="true"
      >
        <motion.path d="M5 12h14" variants={SHAFT_VARIANTS} animate={controls} />
        <motion.path d="m12 5 7 7-7 7" variants={HEAD_VARIANTS} animate={controls} />
      </svg>
    );
  },
);

ArrowRightIcon.displayName = "ArrowRightIcon";
export default ArrowRightIcon;
