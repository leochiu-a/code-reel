import type { EditorSettings, Theme } from "./types";

export const GRADIENTS = [
  // fleet dark
  "linear-gradient(152deg, rgb(87% 61% 43%) 0%, rgb(49% 14% 95%) 100%)",
  // github dark
  "linear-gradient(135deg, #E233FF 0%, #FF6B00 100%)",
  // Material Palenight
  "linear-gradient(135deg, #54D2EF 0%, #2AA6DA 100%)",
  // dracula
  "linear-gradient(135deg,  rgba(171,73,222,1) 0%,rgba(73,84,222,1) 100%)",
  // night owl
  "linear-gradient(140deg, rgb(9, 171, 241), rgb(5, 105, 148), rgb(4, 84, 118), rgb(6, 119, 167))",
  // synthwave-84
  "linear-gradient(to right top, #7f469d, #8242aa, #833db7, #8338c4, #8233d2, #8a35da, #9336e2, #9b38ea, #af41ee, #c24af2, #d554f7, #e65ffb)",
];

export const THEMES: Record<Theme, { label: string; shikiTheme: string }> = {
  "one-dark": {
    label: "One Dark",
    shikiTheme: "one-dark-pro",
  },
  dracula: {
    label: "Dracula",
    shikiTheme: "dracula",
  },
  nord: {
    label: "Nord",
    shikiTheme: "nord",
  },
  "github-dark": {
    label: "GitHub Dark",
    shikiTheme: "github-dark",
  },
  monokai: {
    label: "Monokai",
    shikiTheme: "monokai",
  },
  "night-owl": {
    label: "Night Owl",
    shikiTheme: "night-owl",
  },
  "catppuccin-macchiato": {
    label: "Catppuccin Macchiato",
    shikiTheme: "catppuccin-macchiato",
  },
  "material-theme-palenight": {
    label: "Material Theme Palenight",
    shikiTheme: "material-theme-palenight",
  },
  "synthwave-84": {
    label: "Synthwave 84",
    shikiTheme: "synthwave-84",
  },
};

export const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    monaco: "javascript",
    shiki: "javascript",
  },
  typescript: {
    label: "TypeScript",
    monaco: "typescript",
    shiki: "typescript",
  },
  react: { label: "React", monaco: "javascript", shiki: "jsx" },
  vue: { label: "Vue", monaco: "vue", shiki: "vue" },
  python: { label: "Python", monaco: "python", shiki: "python" },
  rust: { label: "Rust", monaco: "rust", shiki: "rust" },
  go: { label: "Go", monaco: "go", shiki: "go" },
  cpp: { label: "C++", monaco: "cpp", shiki: "cpp" },
  html: { label: "HTML", monaco: "html", shiki: "html" },
  css: { label: "CSS", monaco: "css", shiki: "css" },
} as const;

export const MAGIC_MOVE_DURATION_MS = 800;
export const MAGIC_MOVE_DELAY_MOVE_S = 0.4;
// Keep the step switch in sync with ShikiMagicMove so the next step starts
// after the move delay + animation duration finishes.
export const PLAY_ANIMATION_INTERVAL_MS = MAGIC_MOVE_DURATION_MS + MAGIC_MOVE_DELAY_MOVE_S * 1000;

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: "one-dark",
  language: "javascript",
  padding: 64,
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  showLineNumbers: false,
  windowControls: true,
  fontSize: 16,
  borderRadius: 16,
  borderShadow: "border-none",
};

export const EXPORT_PAGE_PATH = "/?export=1";
export const EXPORT_VIDEO_FPS = 60;
export const EXPORT_CAPTURE_QUALITY = 92;
export const EXPORT_CAPTURE_FORMAT = "png" as const;
export const EXPORT_DEVICE_SCALE = 2;
export const EXPORT_VIEWPORT = { width: 1600, height: 900 };
export const EXPORT_PROCESSING_BUFFER_MS = 2000;
