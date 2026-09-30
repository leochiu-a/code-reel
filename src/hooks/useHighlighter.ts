import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";

import { getHighlighter, getLoadedHighlighter } from "../services/shiki";

/**
 * Hook to get the highlighter instance from the shiki library.
 *
 * Once it has loaded, later mounts get it on their first render. The editor
 * then arrives complete in the navigation's own commit: a code-less first frame
 * would be the view transition's snapshot, and the follow-up render that adds
 * the code would land mid-animation and stall it.
 */
const useHighlighter = () => {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(getLoadedHighlighter);

  useEffect(() => {
    if (highlighter) return;
    let isActive = true;

    getHighlighter().then((loaded) => {
      if (isActive) {
        setHighlighter(loaded);
      }
    });

    return () => {
      isActive = false;
    };
  }, [highlighter]);

  return highlighter;
};

export default useHighlighter;
