export type Theme =
  | "prisma"
  | "tailwind"
  | "vercel"
  | "trigger"
  | "supabase"
  | "openai"
  | "mintlify"
  | "clerk"
  | "elevenlabs"
  | "resend"
  | "nuxt"
  | "browserbase"
  | "cloudflare"
  | "gemini"
  | "stripe"
  | "firecrawl"
  | "aws"
  | "auth0"
  | "one-dark"
  | "dracula"
  | "github-light";

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
  borderRadius?: number;
  borderShadow: string;
}
