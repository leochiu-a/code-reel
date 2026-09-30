import { ViewTransition } from "react";

/**
 * Wraps a page so a route change reads as one page leaving and another
 * arriving. It lives in each page rather than the layout: a layout persists
 * across navigations, so a wrapper there sees an update and stretches the whole
 * page from one size to the other instead.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
