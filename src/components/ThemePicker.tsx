"use client";

import React, { useCallback, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Highlighter } from "shiki";

import {
  DEFAULT_EDITOR_SETTINGS,
  THEME_BACKGROUND_MAP,
  THEMES,
  resolveShikiThemeName,
} from "../constants";
import { getThemeBackground, getThemeForeground } from "../services/shiki";
import { computeThemePreviewBackground } from "../utils/themePreviewBackground";
import type { EditorSettings, Theme } from "../types";
import CodeEditor from "./CodeEditor";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Tokenised once per theme to pick the colours the trigger's swatch shows.
const SWATCH_SAMPLE = 'const greet = (name) => `Hi ${name}`; return "ok";';
const SWATCH_BARS = ["62%", "38%", "80%"];

const PREVIEW_CODE = `const preview = "Hello";\nconsole.log(preview);`;
const PREVIEW_HEIGHT = 140;

type ThemeOption = {
  key: Theme;
  label: string;
  /** Background of the whole card, behind the preview. */
  cardBackground: string;
  foreground: string;
  /** Canvas background, used by the swatch and the preview. */
  background: string;
  codeBackground: string;
  colors: string[];
  defaults: Partial<EditorSettings>;
  previewSettings: EditorSettings;
};

const buildThemeOptions = (
  highlighter: Highlighter | null | undefined,
  language: EditorSettings["language"],
): ThemeOption[] =>
  (Object.entries(THEMES) as [Theme, (typeof THEMES)[Theme]][]).map(([key, theme]) => {
    const shikiTheme = resolveShikiThemeName(theme);
    const mappedBackground = THEME_BACKGROUND_MAP[key];
    const codeBackground = highlighter ? getThemeBackground(highlighter, shikiTheme) : "#0b0b0b";
    const foreground = highlighter ? getThemeForeground(highlighter, shikiTheme) : "#ededed";
    const background = computeThemePreviewBackground(
      mappedBackground,
      theme.defaults?.background,
      codeBackground,
    );

    let colors = ["#ffffff40", "#ffffff40", "#ffffff40"];
    if (highlighter) {
      const tokenColors = highlighter
        .codeToTokens(SWATCH_SAMPLE, { lang: "javascript", theme: shikiTheme })
        .tokens.flat()
        .map((token) => token.color?.toLowerCase())
        .filter((color): color is string => Boolean(color) && color !== foreground.toLowerCase());
      const distinct = [...new Set(tokenColors)];
      colors = SWATCH_BARS.map((_, index) => distinct[index] ?? foreground);
    }

    return {
      key,
      label: theme.label,
      cardBackground:
        mappedBackground ??
        (highlighter ? codeBackground : (theme.defaults?.background ?? "#0b0b0b")),
      foreground,
      background,
      codeBackground,
      colors,
      defaults: theme.defaults ?? {},
      previewSettings: {
        theme: key,
        language,
        padding: 20,
        background,
        showLineNumbers: false,
        windowControls: false,
        fontSize: 11,
        borderRadius: 16,
        borderShadow: DEFAULT_EDITOR_SETTINGS.borderShadow,
      },
    };
  });

const ThemeSwatch: React.FC<{ option: ThemeOption; className?: string }> = ({
  option,
  className,
}) => (
  <div
    className={cn("flex items-center justify-center rounded-md p-[14%]", className)}
    style={{ background: option.background }}
  >
    <div
      className="flex w-full flex-col gap-[3px] rounded-[3px] p-[10%]"
      style={{ background: option.codeBackground }}
    >
      {SWATCH_BARS.map((width, index) => (
        <span
          key={width}
          className="h-[3px] rounded-full"
          style={{ width, background: option.colors[index] }}
        />
      ))}
    </div>
  </div>
);

interface ThemePreviewListProps {
  options: ThemeOption[];
  activeTheme: Theme;
  highlighter?: Highlighter | null;
  onSelect: (option: ThemeOption) => void;
}

// Every card renders a full CodeEditor preview, so the list is memoised on
// what the previews depend on: unrelated settings changes (shadow, padding, …)
// would otherwise re-render all of them while the drawer is open.
const ThemePreviewList = React.memo<ThemePreviewListProps>(
  ({ options, activeTheme, highlighter, onSelect }) => (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pb-5">
      {options.map((option) => {
        const isActive = option.key === activeTheme;
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option)}
            aria-pressed={isActive}
            className={cn(
              "w-full shrink-0 cursor-pointer overflow-hidden rounded-xl border text-left transition",
              isActive
                ? "border-emerald-400/60 ring-2 ring-emerald-400/20"
                : "border-white/10 hover:border-white/30",
            )}
            style={{ background: option.cardBackground, color: option.foreground }}
          >
            <div className="px-3 pt-3 text-sm font-medium">{option.label}</div>
            <div className="pointer-events-none mt-3 overflow-hidden">
              <CodeEditor
                code={PREVIEW_CODE}
                settings={option.previewSettings}
                showPreview={true}
                highlighter={highlighter}
                containerWidth="100%"
                containerHeight={PREVIEW_HEIGHT}
                minCaptureHeight={PREVIEW_HEIGHT}
                minWidth="0"
                resizable={false}
              />
            </div>
          </button>
        );
      })}
    </div>
  ),
);
ThemePreviewList.displayName = "ThemePreviewList";

interface ThemePickerProps {
  activeTheme: Theme;
  language: EditorSettings["language"];
  highlighter?: Highlighter | null;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
}

const ThemePicker: React.FC<ThemePickerProps> = ({
  activeTheme,
  language,
  highlighter,
  onSettingsChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = useMemo(() => buildThemeOptions(highlighter, language), [highlighter, language]);
  const active = options.find((option) => option.key === activeTheme) ?? options[0];

  const selectTheme = useCallback(
    (option: ThemeOption) => {
      onSettingsChange({
        theme: option.key,
        ...option.defaults,
        background:
          THEME_BACKGROUND_MAP[option.key] ?? option.defaults.background ?? option.background,
      });
    },
    [onSettingsChange],
  );

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} modal={false}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex w-full cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-white/5 p-1.5 pr-3 text-left text-sm text-slate-100 transition-colors hover:bg-white/10"
        >
          <ThemeSwatch option={active} className="h-8 w-12 shrink-0 p-1.5" />
          <span className="flex-1 truncate">{active.label}</span>
          <ChevronRight className="size-4 text-white/50" />
        </button>
      </SheetTrigger>
      {/* Non-modal so the canvas stays visible (no dimming) while themes are
          compared; it stays open after a pick and closes on an outside click.
          It starts below the 64px header, over the settings panel. */}
      <SheetContent
        side="right"
        className="top-16 h-auto w-80 gap-0 border-white/10 bg-[#212121] sm:max-w-none"
      >
        <SheetHeader className="px-5 pt-5 pb-3">
          <SheetTitle className="text-sm">Themes</SheetTitle>
          <SheetDescription className="text-xs">
            Pick a look; the canvas updates as you go.
          </SheetDescription>
        </SheetHeader>
        <ThemePreviewList
          options={options}
          activeTheme={activeTheme}
          highlighter={highlighter}
          onSelect={selectTheme}
        />
      </SheetContent>
    </Sheet>
  );
};

export default ThemePicker;
