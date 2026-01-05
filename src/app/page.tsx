"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Palette, Sparkles, Video } from "lucide-react";
import type { Highlighter } from "shiki";

import { Button } from "@/components/animate-ui/components/buttons/button";
import {
  DEFAULT_EDITOR_SETTINGS,
  HIGHLIGHT_STEP_DELAY_MS,
  PREVIEW_STEPS,
  PLAY_ANIMATION_INTERVAL_MS,
} from "@/constants";
import { getHighlighter } from "@/services/shiki";

const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
});

const LOGO_WRAPPER_VARIANTS = {
  center: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  topLeft: {
    top: 0,
    left: 0,
    right: 0,
    bottom: "auto",
    height: "auto",
  },
} as const;

const CONTENT_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 30 },
  },
} as const;

const FEATURES = [
  {
    title: "Highlight steps",
    description: "Stage each step and guide viewers through the flow.",
    icon: Sparkles,
  },
  {
    title: "Customize",
    description: "Tune themes, fonts, spacing, and backgrounds to fit your brand.",
    icon: Palette,
  },
  {
    title: "Instant preview",
    description: "Play the sequence and refine timing without leaving the editor.",
    icon: Video,
  },
] as const;

const HERO_TITLE_PARTS = ["Animate every highlight.", "Share every step."] as const;
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

const LogoText = ({ draw, size }: { draw?: boolean; size: keyof typeof LOGO_SIZES }) => {
  const config = LOGO_SIZES[size];
  return (
    <motion.svg
      width={config.width}
      height={config.height}
      viewBox={`0 0 ${config.width} ${config.height}`}
      aria-hidden="true"
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
export default function Page() {
  const [transition, setTransition] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewHighlighter, setPreviewHighlighter] = useState<Highlighter | null>(null);
  const prevPreviewIndexRef = useRef<number>(0);
  const [highlightDelayMs, setHighlightDelayMs] = useState(HIGHLIGHT_STEP_DELAY_MS);

  const previewCode = PREVIEW_STEPS[previewIndex].code;
  const previewHighlightLines = PREVIEW_STEPS[previewIndex].highlightLines;
  const preview = useMemo(
    () =>
      previewHighlighter
        ? {
            highlighter: previewHighlighter,
            code: previewCode,
            language: "typescript",
            theme: "one-dark",
          }
        : undefined,
    [previewHighlighter, previewCode],
  );
  const shouldShowPreview = Boolean(previewHighlighter);

  useEffect(() => {
    const timer = setTimeout(() => setTransition(true), 1250);
    const timer2 = setTimeout(() => setIsLoaded(true), 2500);
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  useEffect(() => {
    const isWrapAround =
      prevPreviewIndexRef.current === PREVIEW_STEPS.length - 1 && previewIndex === 0;
    // Compute delay in an effect to avoid accessing ref during render, and keep wrap-around timing stable.
    startTransition(() => {
      setHighlightDelayMs(
        isWrapAround ? HIGHLIGHT_STEP_DELAY_MS : previewIndex * HIGHLIGHT_STEP_DELAY_MS,
      );
    });
    prevPreviewIndexRef.current = previewIndex;
  }, [previewIndex]);

  useEffect(() => {
    let isActive = true;
    getHighlighter().then((highlighter) => {
      if (isActive) {
        setPreviewHighlighter(highlighter);
      }
    });
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!shouldShowPreview) return;
    if (!transition) return;

    const interval = window.setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % PREVIEW_STEPS.length);
    }, PLAY_ANIMATION_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [shouldShowPreview, transition]);

  return (
    <main
      className={`relative min-h-screen bg-[#181818] text-neutral-100 ${
        !isLoaded ? "overflow-y-hidden" : ""
      }`}
    >
      <motion.div
        variants={LOGO_WRAPPER_VARIANTS}
        initial="center"
        animate={transition ? "topLeft" : "center"}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
        className="absolute z-40 flex items-center justify-center"
      >
        <div className="relative size-full max-w-6xl">
          <motion.div
            layoutId="logo"
            className={
              transition
                ? "absolute left-5"
                : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            }
            animate={transition ? { top: 28 } : {}}
          >
            <div className="text-white">
              {transition ? <LogoText size="sm" /> : <LogoText size="xl" draw />}
              <span className="sr-only">CodeReel</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ top: 28, right: -40, opacity: 0 }}
            animate={
              transition ? { top: 28, right: 20, opacity: 1 } : { top: 28, right: -40, opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="absolute z-40 hidden items-center gap-3 md:flex"
          >
            <Button size="sm" asChild>
              <Link href="/app">Open editor</Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full">
        {transition && (
          <>
            <motion.section
              variants={CONTENT_VARIANTS}
              initial="hidden"
              animate="visible"
              className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 pt-28 pb-12 text-center md:pt-32"
            >
              <motion.h1
                className="max-w-3xl text-4xl font-semibold text-white sm:text-5xl md:text-6xl"
                aria-label={HERO_TITLE_PARTS.join(" ")}
              >
                <span className="sr-only">{HERO_TITLE_PARTS.join(" ")}</span>
                <span aria-hidden="true" className="inline-flex flex-wrap justify-center">
                  {HERO_TITLE_PARTS.map((part, partIndex) => (
                    <span
                      key={`${part}-${partIndex}`}
                      className={partIndex === 1 ? "whitespace-nowrap" : ""}
                    >
                      {Array.from(`${part}${partIndex === 0 ? " " : ""}`).map((char, index) => (
                        <motion.span
                          key={`${char}-${partIndex}-${index}`}
                          initial={{
                            opacity: 0,
                            x: -12,
                            filter: "blur(6px)",
                          }}
                          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          transition={{
                            type: "spring",
                            stiffness: 160,
                            damping: 18,
                            delay: 0.08 + (partIndex * 10 + index) * 0.02,
                          }}
                          className={char === " " ? "mr-2" : ""}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </span>
                  ))}
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 140,
                  damping: 20,
                  delay: 0.22,
                }}
                className="max-w-2xl text-sm text-white/60 sm:text-base"
              >
                CodeReel helps you turn code into short, polished walkthroughs with precise
                highlights and clean exports.
              </motion.p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <motion.div whileHover="hover" whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="w-full pr-5 sm:w-auto" asChild>
                    <Link href="/app">
                      Get started{" "}
                      <motion.span
                        variants={{ hover: { x: 4 } }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 18,
                        }}
                        className="inline-flex"
                      >
                        <ArrowRight className="size-5" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.section>

            <section className="mx-auto w-full max-w-6xl px-6 pb-16">
              <div className="flex min-h-[420px] justify-center">
                <CodeEditor
                  code={previewCode}
                  settings={DEFAULT_EDITOR_SETTINGS}
                  showPreview={shouldShowPreview}
                  preview={shouldShowPreview ? preview : undefined}
                  highlightLines={previewHighlightLines}
                  highlightDelayMs={highlightDelayMs}
                  containerWidth={860}
                  containerHeight={420}
                  resizable={false}
                  highlightMoveDurationMs={800}
                />
              </div>
            </section>

            <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-16">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURES.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-2xl border border-white/10 bg-[#212121] p-5 text-left text-white/70"
                    >
                      <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-white/10">
                        <Icon className="size-5 text-white" />
                      </div>
                      <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                      <p className="mt-2 text-sm text-white/60">{feature.description}</p>
                    </motion.div>
                  );
                })}
              </div>
            </section>

            <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
              <div className="flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/50">
                <span>© 2025 CodeReel. All rights reserved.</span>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
