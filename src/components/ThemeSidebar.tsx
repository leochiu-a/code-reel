import React, { useMemo } from "react";
import type { Highlighter } from "shiki";

import {
  DEFAULT_EDITOR_SETTINGS,
  THEME_BACKGROUND_MAP,
  THEMES,
  resolveShikiThemeName,
} from "../constants";
import { getThemeBackground, getThemeForeground } from "../services/shiki";
import type { EditorSettings, Theme } from "../types";
import CodeEditor from "./CodeEditor";

interface ThemeSidebarProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  highlighter?: Highlighter | null;
}

const ThemeSidebar: React.FC<ThemeSidebarProps> = ({
  settings,
  onSettingsChange,
  highlighter,
}) => {
  const previewCode = `const preview = "Hello";\nconsole.log(preview);`;
  const previewHeight = 140;
  const themeItems = useMemo(
    () =>
      Object.entries(THEMES).map(([key, theme]) => {
        const shikiTheme = resolveShikiThemeName(theme);
        const mappedBackground = THEME_BACKGROUND_MAP[key as Theme];
        const codeBackground = highlighter
          ? getThemeBackground(highlighter, shikiTheme)
          : "#0b0b0b";
        const background = highlighter
          ? codeBackground
          : theme.defaults?.background ?? "#0b0b0b";
        const foreground = highlighter
          ? getThemeForeground(highlighter, shikiTheme)
          : "#ededed";
        const previewSettings: EditorSettings = {
          theme: key as Theme,
          language: settings.language,
          padding: 20,
          background: mappedBackground ?? theme.defaults?.background ?? settings.background,
          showLineNumbers: false,
          windowControls: false,
          fontSize: 11,
          borderRadius: 12,
          borderShadow: DEFAULT_EDITOR_SETTINGS.borderShadow,
        };

        return {
          key: key as Theme,
          label: theme.label,
          background: mappedBackground ?? background,
          foreground,
          defaults: theme.defaults ?? {},
          codeBackground,
          previewSettings,
        };
      }),
    [highlighter, settings.background, settings.language],
  );

  return (
    <aside className="hidden h-full w-72 flex-col gap-4 overflow-y-auto bg-[#212121] p-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)] lg:flex">
      <div className="space-y-2">
        <span className="text-xs font-medium text-white/90">THEMES</span>
        <p className="text-xs text-white/50">Pick a look for the editor preview.</p>
      </div>
      <div className="grid gap-3">
        {themeItems.map((theme) => {
          const isActive = settings.theme === theme.key;
          return (
            <button
              key={theme.key}
              type="button"
              onClick={() =>
                onSettingsChange({
                  theme: theme.key,
                  ...theme.defaults,
                  ...(THEME_BACKGROUND_MAP[theme.key]
                    ? { background: THEME_BACKGROUND_MAP[theme.key] }
                    : {}),
                })
              }
              className={`group w-full overflow-hidden rounded-xl border text-left transition ${
                isActive
                  ? "border-emerald-400/60 ring-2 ring-emerald-400/20"
                  : "border-white/10 hover:border-white/30"
              }`}
              style={{
                background: theme.background,
                color: theme.foreground,
              }}
              aria-pressed={isActive}
            >
              <div className="px-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{theme.label}</span>
                </div>
              </div>
              <div className="pointer-events-none mt-3 overflow-hidden">
                <CodeEditor
                  code={previewCode}
                  settings={theme.previewSettings}
                  showPreview={true}
                  highlighter={highlighter}
                  containerWidth="100%"
                  containerHeight={previewHeight}
                  minCaptureHeight={previewHeight}
                  minWidth="0"
                  resizable={false}
                />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ThemeSidebar;
