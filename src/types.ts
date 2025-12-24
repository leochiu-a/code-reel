export type Theme =
  | "nord"
  | "dracula"
  | "one-dark"
  | "github-dark"
  | "monokai"
  | "night-owl"
  | "catppuccin-macchiato"
  | "material-theme-palenight"
  | "synthwave-84";

export type Language =
  | "javascript"
  | "typescript"
  | "react"
  | "vue"
  | "python"
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
