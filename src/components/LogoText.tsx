"use client";

import { motion } from "motion/react";

const LOGO_TEXT = "CodeReel";

const logoDrawVariants = {
  hidden: { strokeDashoffset: 520, fillOpacity: 0 },
  visible: {
    strokeDashoffset: 0,
    fillOpacity: 1,
    transition: { duration: 1.4, ease: "easeInOut" },
  },
} as const;

const LOGO_SIZES = {
  sm: { width: 150, height: 40, fontSize: 20 },
  xl: { width: 360, height: 80, fontSize: 52 },
} as const;

type LogoTextProps = {
  draw?: boolean;
  size: keyof typeof LOGO_SIZES;
  className?: string;
};

const LogoText = ({ draw, size, className }: LogoTextProps) => {
  const config = LOGO_SIZES[size];
  return (
    <motion.svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${config.width} ${config.height}`}
      aria-hidden="true"
      className={className}
    >
      <motion.text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-inter), ui-sans-serif, system-ui, sans-serif"
        fontSize={config.fontSize}
        fontWeight={600}
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="520"
        strokeDashoffset="520"
        variants={draw ? logoDrawVariants : undefined}
        initial={draw ? "hidden" : false}
        animate={draw ? "visible" : false}
      >
        {LOGO_TEXT}
      </motion.text>
    </motion.svg>
  );
};

export default LogoText;
