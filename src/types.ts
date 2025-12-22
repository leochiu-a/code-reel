
export type Theme = 'nord' | 'dracula' | 'one-dark' | 'github-light' | 'monokai' | 'night-owl';

export type Language = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'rust' | 'go' | 'cpp';

export interface EditorSettings {
  theme: Theme;
  language: Language;
  padding: number;
  background: string;
  showLineNumbers: boolean;
  windowControls: boolean;
  fontSize: number;
  borderRadius: number;
}
