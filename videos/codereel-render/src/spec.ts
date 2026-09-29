import { LANGUAGES, THEMES } from "../../../src/constants";
import type { Language, Theme } from "../../../src/types";

export type SpecStep = {
  code: string;
  /** 1-based lines to highlight while this step is on screen. */
  highlightLines: number[];
};

/** What an agent (or anyone) hands the renderer: the steps and how to show them. */
export type Spec = {
  language: Language;
  theme: Theme;
  steps: SpecStep[];
  /** Seconds each step stays still before the next transition starts. */
  hold: number;
  /** Overrides of the theme's own settings, as in the editor's settings panel. */
  padding?: number;
  background?: string;
  showLineNumbers?: boolean;
  windowControls?: boolean;
};

const DEFAULT_HOLD = 1;

const fail = (message: string): never => {
  throw new Error(`Invalid spec: ${message}`);
};

const isKeyOf = <T extends object>(map: T, key: unknown): key is keyof T =>
  typeof key === "string" && Object.hasOwn(map, key);

const optional = <T>(
  value: unknown,
  check: (v: unknown) => v is T,
  message: string,
): T | undefined => (value === undefined ? undefined : check(value) ? value : fail(message));

const isNonNegative = (v: unknown): v is number => typeof v === "number" && v >= 0;
const isString = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

const parseStep = (step: unknown, index: number): SpecStep => {
  const at = `"steps[${index}]"`;
  if (typeof step !== "object" || step === null) return fail(`${at} must be an object`);
  const { code, highlightLines = [] } = step as Record<string, unknown>;
  if (typeof code !== "string") return fail(`${at}.code must be a string`);
  if (!Array.isArray(highlightLines) || !highlightLines.every(Number.isInteger)) {
    return fail(`${at}.highlightLines must be an array of 1-based line numbers`);
  }
  // Tokens are placed by measured width, and a tab has none of its own: it
  // jumps to the next tab stop. Two spaces keep indentation readable.
  return { code: code.replaceAll("\t", "  "), highlightLines };
};

export const parseSpec = (input: unknown): Spec => {
  if (typeof input !== "object" || input === null) return fail("expected an object");
  const {
    language,
    theme,
    steps,
    hold = DEFAULT_HOLD,
    padding,
    background,
    showLineNumbers,
    windowControls,
  } = input as Record<string, unknown>;

  if (!isKeyOf(LANGUAGES, language)) {
    return fail(`"language" must be one of ${Object.keys(LANGUAGES).join(", ")}`);
  }
  if (!isKeyOf(THEMES, theme)) {
    return fail(`"theme" must be one of ${Object.keys(THEMES).join(", ")}`);
  }
  if (!Array.isArray(steps) || steps.length === 0) {
    return fail(`"steps" must be a non-empty array of { code, highlightLines? }`);
  }
  if (!isNonNegative(hold)) return fail(`"hold" must be a non-negative number of seconds`);

  return {
    language,
    theme,
    steps: steps.map(parseStep),
    hold,
    padding: optional(padding, isNonNegative, `"padding" must be a non-negative number of px`),
    background: optional(background, isString, `"background" must be a CSS background`),
    showLineNumbers: optional(showLineNumbers, isBoolean, `"showLineNumbers" must be a boolean`),
    windowControls: optional(windowControls, isBoolean, `"windowControls" must be a boolean`),
  };
};
