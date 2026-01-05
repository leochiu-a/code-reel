"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";

import SparklesIcon from "@/components/ui/sparkles-icon";
import GearIcon from "@/components/ui/gear-icon";
import PlayerIcon from "@/components/ui/player-icon";
import { Button } from "@/components/animate-ui/components/buttons/button";
import LogoText from "@/components/LogoText";
import {
  DEFAULT_EDITOR_SETTINGS,
  HIGHLIGHT_STEP_DELAY_MS,
  PREVIEW_STEPS,
  PLAY_ANIMATION_INTERVAL_MS,
} from "@/constants";
import useHighlighter from "@/hooks/useHighlighter";
import { EditorSettings } from "@/types";

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
    icon: SparklesIcon,
  },
  {
    title: "Customize",
    description: "Tune themes, fonts, spacing, and backgrounds to fit your brand.",
    icon: GearIcon,
  },
  {
    title: "Instant preview",
    description: "Play the sequence and refine timing without leaving the editor.",
    icon: PlayerIcon,
  },
] as const;

const HERO_TITLE_PARTS = ["Animate every highlight.", "Share every step."] as const;
export default function Page() {
  const [transition, setTransition] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const highlighter = useHighlighter();

  const previewCode = PREVIEW_STEPS[previewIndex].code;
  const previewHighlightLines = PREVIEW_STEPS[previewIndex].highlightLines;
  const shouldShowPreview = Boolean(highlighter);

  const previewSettings = useMemo<EditorSettings>(
    () => ({
      ...DEFAULT_EDITOR_SETTINGS,
      language: "typescript",
    }),
    [],
  );

  const highlightDelayMs = useMemo(
    () => (previewIndex === 0 ? HIGHLIGHT_STEP_DELAY_MS : previewIndex * HIGHLIGHT_STEP_DELAY_MS),
    [previewIndex],
  );

  useEffect(() => {
    const timer = setTimeout(() => setTransition(true), 1250);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!shouldShowPreview) return;
    if (!transition) return;

    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % PREVIEW_STEPS.length);
      // Add 300ms to the interval to prevent the preview from being too fast
    }, PLAY_ANIMATION_INTERVAL_MS + 300);

    return () => clearInterval(interval);
  }, [shouldShowPreview, transition]);

  return (
    <main className="relative min-h-screen bg-[#181818] text-neutral-100">
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
              <Link href="/app" prefetch>
                Open editor
              </Link>
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
                CodeReel turns your code into short, polished walkthroughs.
              </motion.p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <motion.div whileHover="hover" whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="w-full pr-5 sm:w-auto" asChild>
                    <Link href="/app" prefetch>
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
                  settings={previewSettings}
                  showPreview={shouldShowPreview}
                  highlightLines={previewHighlightLines}
                  highlightDelayMs={highlightDelayMs}
                  highlighter={highlighter}
                  containerWidth={860}
                  containerHeight={420}
                  resizable={false}
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
