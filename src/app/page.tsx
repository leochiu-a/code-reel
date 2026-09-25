import SparklesIcon from "@/components/ui/sparkles-icon";
import GearIcon from "@/components/ui/gear-icon";
import PlayerIcon from "@/components/ui/player-icon";
import LogoText from "@/components/LogoText";
import { CodePreview } from "@/components/CodePreview";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { HeroCta, NavActions } from "@/components/LandingActions";
import { LANGUAGES } from "@/constants";

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

const STEPS = [
  {
    title: "Paste your code",
    description: "Drop in a snippet in any of the supported languages and split it into steps.",
  },
  {
    title: "Stage the highlights",
    description: "Pick the lines each step should spotlight and watch the code morph between them.",
  },
  {
    title: "Export and share",
    description: "Save a crisp PNG, JPEG or WebP, or record the playback as a walkthrough video.",
  },
] as const;

const LANGUAGE_LABELS = Object.values(LANGUAGES).map((language) => language.label);

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CodeReel",
  description: "Animate your code. Share your story. Turn code into polished walkthrough videos.",
  url: "https://codereel.dev",
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#181818] text-neutral-100">
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Top navigation bar */}
      <div className="absolute top-0 left-0 right-0 z-40">
        <div className="relative mx-auto w-full max-w-6xl px-5">
          <div className="absolute left-5 top-7 text-white">
            <LogoText size="sm" />
          </div>
          <NavActions />
        </div>
      </div>

      {/* Hero section */}
      <section className="relative isolate">
        <HeroBackdrop />
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 pt-32 pb-14 text-center md:pt-40">
          <p
            className="reel-rise inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 backdrop-blur"
            style={{ animationDelay: "0ms" }}
          >
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Free, open source, runs in your browser
          </p>
          <h1
            className="reel-rise-lcp max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl md:text-6xl"
            style={{ animationDelay: "60ms" }}
          >
            Animate every highlight.{" "}
            <span className="reel-shimmer bg-clip-text text-transparent">Share every step.</span>
          </h1>
          <p
            className="reel-rise max-w-2xl text-sm text-white/60 sm:text-base"
            style={{ animationDelay: "160ms" }}
          >
            CodeReel turns your code into short, polished walkthroughs. Stage line highlights, morph
            between steps, and export images or videos ready for docs, talks and social posts.
          </p>
          <div
            className="reel-rise flex flex-col gap-3 sm:flex-row sm:gap-4"
            style={{ animationDelay: "240ms" }}
          >
            <HeroCta />
          </div>
        </div>

        {/* Code preview (client island) */}
        <div className="mx-auto w-full max-w-6xl px-6 pb-20">
          <div className="reel-tilt relative">
            <div
              aria-hidden="true"
              className="reel-glow pointer-events-none absolute -inset-10 -z-10 rounded-[48px] opacity-60 blur-3xl"
            />
            <CodePreview />
          </div>
        </div>
      </section>

      {/* Supported languages */}
      <section aria-labelledby="languages-heading" className="pb-20">
        <h2
          id="languages-heading"
          className="mb-6 text-center text-xs font-medium tracking-[0.2em] text-white/40 uppercase"
        >
          Syntax highlighting for the languages you ship
        </h2>
        <div className="reel-marquee-mask relative overflow-hidden">
          <div className="reel-marquee flex w-max gap-3">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 gap-3">
                {LANGUAGE_LABELS.map((label) => (
                  <li
                    key={label}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-sm text-white/70"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section
        id="features"
        aria-labelledby="features-heading"
        className="mx-auto w-full max-w-6xl px-6 pb-24"
      >
        <h2
          id="features-heading"
          className="reel-reveal mb-10 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Everything you need to tell a story with code
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="reel-reveal group relative overflow-hidden rounded-2xl border border-white/10 bg-[#212121] p-5 text-left text-white/70 transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-16 -right-16 size-40 rounded-full bg-violet-500/0 blur-3xl transition-colors duration-500 group-hover:bg-violet-500/25"
                />
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-white/10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Icon className="size-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/60">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <h2
          id="how-heading"
          className="reel-reveal mb-10 text-center text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          From snippet to walkthrough in three steps
        </h2>
        <div className="relative">
          <div
            aria-hidden="true"
            className="reel-line absolute top-5 right-[16%] left-[16%] hidden h-px origin-left bg-gradient-to-r from-violet-500/60 via-white/20 to-orange-300/60 md:block"
          />
          <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li
                key={step.title}
                className="reel-reveal relative flex flex-col items-center text-center"
              >
                <span className="relative mb-4 flex size-10 items-center justify-center rounded-full border border-white/15 bg-[#212121] font-mono text-sm text-white">
                  {index + 1}
                </span>
                <h3 className="text-base font-semibold text-white">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm text-white/60">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing call to action */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="reel-reveal relative overflow-hidden rounded-3xl border border-white/10 bg-[#1e1e1e] px-6 py-14 text-center">
          <div
            aria-hidden="true"
            className="reel-glow pointer-events-none absolute inset-0 opacity-25 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-5">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Your next code walkthrough starts here
            </h2>
            <p className="max-w-xl text-sm text-white/60 sm:text-base">
              No sign-up, no upload. Everything runs locally in your browser.
            </p>
            <HeroCta />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <span>© {new Date().getFullYear()} CodeReel. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
