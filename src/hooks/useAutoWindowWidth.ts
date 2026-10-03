import { useEffect, useMemo, useState } from "react";
import { EDITOR_INSET, LINE_NUMBER_GUTTER, MIN_WINDOW_WIDTH } from "../components/CodeEditor";
import { firaCode } from "../fonts";
import type { EditorSettings } from "../types";
import { measureCodeWidth } from "../utils/measureCode";

/** True once the page's fonts have loaded, so text can be measured in them. */
const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    void document.fonts.ready.then(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);
  return ready;
};

/**
 * The code window width that fits the widest line across every step, so it
 * holds still from step to step. Never narrower than the minimum.
 */
const useAutoWindowWidth = (codes: string[], settings: EditorSettings) => {
  const fontsReady = useFontsReady();
  const gutter = settings.showLineNumbers ? LINE_NUMBER_GUTTER : 0;
  const codesKey = codes.join("\u0000");

  // Only measured once the code font has loaded: its fallback has other widths.
  return useMemo(() => {
    if (!fontsReady) return MIN_WINDOW_WIDTH;
    const font = `${settings.fontSize}px ${firaCode.style.fontFamily}`;
    const codeWidth = measureCodeWidth(codesKey.split("\u0000"), font);
    return Math.max(MIN_WINDOW_WIDTH, codeWidth + 2 * EDITOR_INSET + gutter);
  }, [codesKey, fontsReady, settings.fontSize, gutter]);
};

export default useAutoWindowWidth;
