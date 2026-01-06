export type Theme =
  | "vercel"
  | "arc-dark"
  | "coldark-cold"
  | "coldark-dark"
  | "nord"
  | "dracula"
  | "one-dark"
  | "github-dark"
  | "github-dark-dimmed"
  | "material-ocean"
  | "material-volcano"
  | "moonlight"
  | "monokai"
  | "night-owl"
  | "duotone-dark"
  | "duotone-sea"
  | "fleet-dark"
  | "holi-dark"
  | "panda"
  | "poimandres"
  | "shades-of-purple"
  | "catppuccin-macchiato"
  | "material-theme-palenight"
  | "synthwave-84"
  | "vitesse-dark"
  | "vscode-dark"
  | "xcode-dark";

export type Language =
  | "javascript"
  | "typescript"
  | "react"
  | "vue"
  | "python"
  | "shell"
  | "markdown"
  | "html"
  | "css"
  | "rust"
  | "go"
  | "cpp";

export interface EditorSettings {
  theme: Theme;
  language: Language;
  padding: number;
  background: string;
  showLineNumbers: boolean;
  windowControls: boolean;
  fontSize: number;
  borderRadius: number;
  borderShadow: string;
}
