import { useEffect, useState } from "react";
import type { Highlighter } from "shiki";

import { getHighlighter } from "../services/shiki";

/**
 * Hook to get the highlighter instance from the shiki library.
 */
const useHighlighter = () => {
  const [highlighter, setHighlighter] = useState<Highlighter | null>(null);

  useEffect(() => {
    let isActive = true;

    getHighlighter().then((loaded) => {
      if (isActive) {
        setHighlighter(loaded);
      }
    });

    return () => {
      isActive = false;
    };
  }, []);

  return highlighter;
};

export default useHighlighter;
