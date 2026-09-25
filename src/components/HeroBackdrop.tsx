"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";

// three.js ships in its own chunk that loads after hydration, so it never
// competes with the hero copy for first paint.
const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

export function HeroBackdrop() {
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[820px] overflow-hidden"
    >
      {/* Static glow that shows before WebGL is ready, or when it is unavailable. */}
      <div className="absolute left-1/2 top-[-240px] h-[640px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(124,58,237,0.35),rgba(245,158,107,0.12)_55%,transparent)] blur-2xl" />
      <div
        className={`absolute inset-0 transition-opacity duration-[1500ms] ${ready ? "opacity-100" : "opacity-0"}`}
      >
        <HeroScene onReady={handleReady} />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-b from-transparent to-[#181818]" />
    </div>
  );
}
