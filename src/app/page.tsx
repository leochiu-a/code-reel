import SparklesIcon from "@/components/ui/sparkles-icon";
import GearIcon from "@/components/ui/gear-icon";
import PlayerIcon from "@/components/ui/player-icon";
import LogoText from "@/components/LogoText";
import { CodePreview } from "@/components/CodePreview";
import { HeroCta, NavActions } from "@/components/LandingActions";

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
    <main className="relative min-h-screen bg-[#181818] text-neutral-100">
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
      <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-6 px-6 pt-28 pb-12 text-center md:pt-32">
        <h1 className="max-w-3xl text-4xl font-semibold text-white sm:text-5xl md:text-6xl">
          Animate every highlight. Share every step.
        </h1>
        <p className="max-w-2xl text-sm text-white/60 sm:text-base">
          CodeReel turns your code into short, polished walkthroughs.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <HeroCta />
        </div>
      </section>

      {/* Code preview (client island) */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <CodePreview />
      </section>

      {/* Features section */}
      <section id="features" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-[#212121] p-5 text-left text-white/70 hover:scale-[1.02] transition-transform duration-200"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-white/10">
                  <Icon className="size-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                <p className="mt-2 text-sm text-white/60">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-6xl px-6 pb-10">
        <div className="flex flex-col items-center justify-center gap-4 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <span>© 2025 CodeReel. All rights reserved.</span>
        </div>
      </footer>
    </main>
  );
}
