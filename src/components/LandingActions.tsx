"use client";

import { useRef } from "react";
import Link from "next/link";

import { Button } from "@/components/animate-ui/components/buttons/button";
import ArrowRightIcon from "@/components/ui/arrow-right-icon";
import GithubIcon from "@/components/ui/github-icon";
import type { AnimatedIconHandle } from "@/components/ui/types";
import { REPOSITORY_URL } from "@/constants";

// These live in a client component on purpose. Button's asChild path hands the
// child to animate-ui's Slot, which reads children.type during render to build
// a motion component. A Server Component's children cross the RSC boundary as a
// lazy reference with no .type yet, so Slot throws. Creating the elements on
// the client keeps them plain React elements.

export const NavActions = () => (
  <div className="absolute top-7 right-5 hidden items-center gap-3 md:flex">
    <Button size="sm" variant="ghost" asChild>
      <a
        href={REPOSITORY_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="CodeReel on GitHub"
        className="border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
      >
        <GithubIcon className="size-4" />
        GitHub
      </a>
    </Button>
    <Button size="sm" asChild>
      <Link href="/app" prefetch>
        Open editor
      </Link>
    </Button>
  </div>
);

export const HeroCta = () => {
  const arrowRef = useRef<AnimatedIconHandle>(null);

  return (
    <Button size="lg" className="w-full pr-5 sm:w-auto" asChild>
      <Link
        href="/app"
        prefetch
        onMouseEnter={() => arrowRef.current?.startAnimation()}
        onMouseLeave={() => arrowRef.current?.stopAnimation()}
      >
        Get started <ArrowRightIcon ref={arrowRef} className="inline-flex size-5" />
      </Link>
    </Button>
  );
};
