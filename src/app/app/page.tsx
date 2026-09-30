"use client";

import { useSyncExternalStore } from "react";

import App from "@/components/App";
import { PageTransition } from "@/components/PageTransition";

const subscribe = () => () => {};

export default function Page() {
  // The editor reads localStorage and browser APIs as it renders, so it skips
  // the server render and hydration. A client-side navigation renders it at
  // once, in the navigation's own commit, which lets the landing page's
  // template card morph into it; a lazy chunk would suspend and break the pair.
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  return isClient ? (
    <PageTransition>
      <App />
    </PageTransition>
  ) : null;
}
