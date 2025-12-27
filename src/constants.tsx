import type { EditorSettings, Theme } from "./types";

export const GRADIENTS = [
  // arc dark
  "linear-gradient(to right bottom, #393939, #343435, #2f3030, #2b2b2c, #262727)",
  // coldark cold
  "linear-gradient(140deg, rgb(165, 142, 251), rgb(233, 191, 248))",
  // coldark dark
  "linear-gradient(to left top, #162b46, #192c45, #1c2e45, #1e2f44, #213043)",
  // aura dark / dracula
  "linear-gradient(135deg,  rgba(171,73,222,1) 0%,rgba(73,84,222,1) 100%)",
  // duotone dark
  "#ffcc99",
  // duotone sea
  "linear-gradient(to right bottom, #1e737e, #186b76, #13636d, #0d5b65, #06535d)",
  // fleet dark
  "linear-gradient(152deg, rgb(87% 61% 43%) 0%, rgb(49% 14% 95%) 100%)",
  // github dark
  "linear-gradient(135deg, #E233FF 0%, #FF6B00 100%)",
  // github dark dimmed
  "linear-gradient(140deg, rgb(241 160 61), rgb(192 74 65),  rgb(115, 52, 52))",
  // github light
  "linear-gradient(-45deg, rgba(73,84,222,1) 0%,rgba(73,221,216,1) 100%)",
  // holi dark
  "#122f6d",
  // one light
  "linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)",
  // material ocean
  "linear-gradient(to right bottom, #2be7b5, #1edea2, #16d58f, #13cb7c, #16c268, #0db866, #04ae64, #00a462, #00976c, #008971, #007b72, #006d6d)",
  // material light / material palenight
  "linear-gradient(135deg, #54D2EF 0%, #2AA6DA 100%)",
  // material volcano
  "linear-gradient(140deg, rgb(241, 160, 61), rgb(192, 74, 65), rgb(115, 52, 52))",
  // moonlight
  "linear-gradient(135deg, #6a3cc0 0%, #240573 100%)",
  // night owl
  "linear-gradient(140deg, rgb(9, 171, 241), rgb(5, 105, 148), rgb(4, 84, 118), rgb(6, 119, 167))",
  // one dark
  "#814CE2",
  // panda
  "#1a1a1a",
  // poimandres
  "linear-gradient(140deg, rgb(165, 142, 251), rgb(65, 206, 189))",
  // shades of purple
  "#8663ed",
  // synthwave-84
  "linear-gradient(to right top, #7f469d, #8242aa, #833db7, #8338c4, #8233d2, #8a35da, #9336e2, #9b38ea, #af41ee, #c24af2, #d554f7, #e65ffb)",
  // vitesse dark
  "linear-gradient(0deg, #6394bf, #a1b567)",
  // vscode dark
  "linear-gradient(to right bottom, #1cb1f2, #00a9f2, #00a0f2, #0097f1, #008def, #0086f1, #007ff2, #0078f2, #0071f6, #006afa, #0062fd, #0059ff)",
  // xcode dark
  "linear-gradient(to top, #a18cd1 0%, #fbc2eb 100%)",
  // xcode light
  "linear-gradient(to right bottom, #ffcc99, #f6bd83, #edad6e, #e49e59, #da8f44)",
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
export const HIGHLIGHT_STEP_DELAY_MS = 300;
// Keep the step switch in sync with ShikiMagicMove so the next step starts
// after the move delay + animation duration finishes.
export const PLAY_ANIMATION_INTERVAL_MS = MAGIC_MOVE_DURATION_MS + MAGIC_MOVE_DELAY_MOVE_S * 1000;

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: "one-dark",
  language: "javascript",
  padding: 64,
  background: "linear-gradient(152deg, rgb(87% 61% 43%) 0%, rgb(49% 14% 95%) 100%)",
  showLineNumbers: false,
  windowControls: true,
  fontSize: 16,
  borderRadius: 16,
  borderShadow:
    "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px, rgba(255, 255, 255, 0.4) 0px 0px 0px 1.5px inset, rgba(0, 0, 0, 0.45) 0px 25px 20px -20px",
};

export const EXPORT_PAGE_PATH = "/?export=1";
export const EXPORT_VIDEO_FPS = 60;
export const EXPORT_CAPTURE_QUALITY = 92;
export const EXPORT_CAPTURE_FORMAT = "png" as const;
export const EXPORT_DEVICE_SCALE = 2;
export const EXPORT_VIEWPORT = { width: 1600, height: 900 };
export const EXPORT_PROCESSING_BUFFER_MS = 2000;
