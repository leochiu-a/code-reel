import type { ThemeRegistration } from "shiki";
import type { FrameId } from "./components/frames";
import type { EditorSettings, Theme } from "./types";
import PRISMA_SHIKI_THEME from "./themes/prisma";
import TAILWIND_SHIKI_THEME from "./themes/tailwind";
import TRIGGER_SHIKI_THEME from "./themes/trigger";
import VERCEL_SHIKI_THEME from "./themes/vercel";
import {
  SUPABASE_SHIKI_THEME,
  OPENAI_SHIKI_THEME,
  MINTLIFY_SHIKI_THEME,
  CLERK_SHIKI_THEME,
  ELEVENLABS_SHIKI_THEME,
  RESEND_SHIKI_THEME,
  NUXT_SHIKI_THEME,
  BROWSERBASE_SHIKI_THEME,
  CLOUDFLARE_SHIKI_THEME,
  GEMINI_SHIKI_THEME,
  STRIPE_SHIKI_THEME,
  FIRECRAWL_SHIKI_THEME,
  AWS_SHIKI_THEME,
  AUTH0_SHIKI_THEME,
} from "./themes/ray";

// Shared by the themes that use the plain window rather than a frame of their own.
const WINDOW_SHADOW =
  "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px, rgba(255, 255, 255, 0.4) 0px 0px 0px 1.5px inset, rgba(0, 0, 0, 0.45) 0px 25px 20px -20px";

export type ThemeConfig = {
  label: string;
  shikiTheme: string | ThemeRegistration;
  /** What picking the theme applies; every theme brings its own canvas. */
  defaults: Partial<EditorSettings> & { background: string };
  frame?: FrameId;
};

// Recreations of ray.so's brand themes, each with its own frame, then a few
// classic editor themes on the plain window.
export const THEMES: Record<Theme, ThemeConfig> = {
  prisma: {
    label: "Prisma",
    shikiTheme: PRISMA_SHIKI_THEME,
    defaults: {
      background: "linear-gradient(140deg, #0c1d26 0%, #0a0c17 100%)",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "prisma",
  },
  tailwind: {
    label: "Tailwind",
    shikiTheme: TAILWIND_SHIKI_THEME,
    defaults: {
      background: "linear-gradient(140deg, #0f172a, #0b1220)",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "tailwind",
  },
  vercel: {
    label: "Vercel",
    shikiTheme: VERCEL_SHIKI_THEME,
    defaults: {
      background: "linear-gradient(140deg, #232323, #1f1f1f)",
      borderShadow: "border-none",
      padding: 96,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "vercel",
  },
  trigger: {
    label: "Trigger.dev",
    shikiTheme: TRIGGER_SHIKI_THEME,
    defaults: {
      background: "#121317",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "trigger",
  },
  supabase: {
    label: "Supabase",
    shikiTheme: SUPABASE_SHIKI_THEME,
    defaults: {
      background: "#121212",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "supabase",
  },
  openai: {
    label: "OpenAI",
    shikiTheme: OPENAI_SHIKI_THEME,
    defaults: {
      background: "#121a29",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "openai",
  },
  mintlify: {
    label: "Mintlify",
    shikiTheme: MINTLIFY_SHIKI_THEME,
    defaults: {
      background: "#121212",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "mintlify",
  },
  clerk: {
    label: "Clerk",
    shikiTheme: CLERK_SHIKI_THEME,
    defaults: {
      background: "#222222",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "clerk",
  },
  elevenlabs: {
    label: "ElevenLabs",
    shikiTheme: ELEVENLABS_SHIKI_THEME,
    defaults: {
      background: "#111111",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "elevenlabs",
  },
  resend: {
    label: "Resend",
    shikiTheme: RESEND_SHIKI_THEME,
    defaults: {
      background: "#000000",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "resend",
  },
  nuxt: {
    label: "Nuxt",
    shikiTheme: NUXT_SHIKI_THEME,
    defaults: {
      background: "#0b0c11",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "nuxt",
  },
  browserbase: {
    label: "Browserbase",
    shikiTheme: BROWSERBASE_SHIKI_THEME,
    defaults: {
      background: "#000000",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "browserbase",
  },
  cloudflare: {
    label: "Cloudflare",
    shikiTheme: CLOUDFLARE_SHIKI_THEME,
    defaults: {
      background: "#0c0c0c",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "cloudflare",
  },
  gemini: {
    label: "Gemini",
    shikiTheme: GEMINI_SHIKI_THEME,
    defaults: {
      background: "#0e1016",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "gemini",
  },
  stripe: {
    label: "Stripe",
    shikiTheme: STRIPE_SHIKI_THEME,
    defaults: {
      background: "#0a2540",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "stripe",
  },
  firecrawl: {
    label: "Firecrawl",
    shikiTheme: FIRECRAWL_SHIKI_THEME,
    defaults: {
      background: "#000000",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "firecrawl",
  },
  aws: {
    label: "AWS",
    shikiTheme: AWS_SHIKI_THEME,
    defaults: {
      background: "#151d26",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: false,
      windowControls: false,
    },
    frame: "aws",
  },
  auth0: {
    label: "Auth0",
    shikiTheme: AUTH0_SHIKI_THEME,
    defaults: {
      background: "linear-gradient(215deg, #191919 30%, #4612a7 60%, #375aed 100%)",
      borderShadow: "border-none",
      padding: 64,
      showLineNumbers: true,
      windowControls: false,
    },
    frame: "auth0",
  },
  "one-dark": {
    label: "One Dark Pro",
    shikiTheme: "one-dark-pro",
    defaults: {
      background: "linear-gradient(152deg, rgb(87% 61% 43%) 0%, rgb(49% 14% 95%) 100%)",
      padding: 64,
      borderShadow: WINDOW_SHADOW,
    },
  },
  dracula: {
    label: "Dracula",
    shikiTheme: "dracula",
    defaults: {
      background: "linear-gradient(135deg, rgba(171,73,222,1) 0%, rgba(73,84,222,1) 100%)",
      padding: 64,
      borderShadow: WINDOW_SHADOW,
    },
  },
  "github-light": {
    label: "GitHub Light",
    shikiTheme: "github-light",
    defaults: {
      background: "linear-gradient(-45deg, rgba(73,84,222,1) 0%, rgba(73,221,216,1) 100%)",
      padding: 64,
      borderShadow: WINDOW_SHADOW,
    },
  },
};

export const resolveShikiThemeName = (themeConfig: ThemeConfig) =>
  typeof themeConfig.shikiTheme === "string" ? themeConfig.shikiTheme : themeConfig.shikiTheme.name;

/** The settings a theme brings with it when picked. */
export const getThemeSettings = (theme: Theme): Partial<EditorSettings> => ({
  theme,
  ...THEMES[theme].defaults,
});

export const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && Object.hasOwn(THEMES, value);

export const LANGUAGES = {
  javascript: {
    label: "JavaScript",
    shiki: "javascript",
  },
  typescript: {
    label: "TypeScript",
    shiki: "typescript",
  },
  react: { label: "React", shiki: "jsx" },
  vue: { label: "Vue", shiki: "vue" },
  python: { label: "Python", shiki: "python" },
  shell: { label: "Shell", shiki: "shell" },
  markdown: { label: "Markdown", shiki: "markdown" },
  rust: { label: "Rust", shiki: "rust" },
  go: { label: "Go", shiki: "go" },
  cpp: { label: "C++", shiki: "cpp" },
  html: { label: "HTML", shiki: "html" },
  css: { label: "CSS", shiki: "css" },
} as const;

type PreviewStep = {
  code: string;
  highlightLines?: number[];
};

export const PREVIEW_STEPS: PreviewStep[] = [
  {
    code: `export default function ProductPage({ productId, referrer }) {
  const handleSubmit = (orderDetails) => {
    post("/product/" + productId + "/buy", {
      referrer,
      orderDetails,
    });
  };`,
    highlightLines: [2],
  },
  {
    code: `import { useCallback } from "react";

export default function ProductPage({ productId, referrer }) {
  const handleSubmit = useCallback((orderDetails) => {
    post("/product/" + productId + "/buy", {
      referrer,
      orderDetails,
    });
  }, [productId, referrer]);`,
    highlightLines: [4, 9],
  },
];

export const MAGIC_MOVE_DURATION_MS = 800;
export const MAGIC_MOVE_DELAY_MOVE_S = 0.4;
export const HIGHLIGHT_STEP_DELAY_MS = 300;
// Keep the step switch in sync with ShikiMagicMove so the next step starts
// after the move delay + animation duration finishes.
export const PLAY_ANIMATION_INTERVAL_MS = MAGIC_MOVE_DURATION_MS + MAGIC_MOVE_DELAY_MOVE_S * 1000;

// Fixed for every theme; the settings panel does not expose it.
export const DEFAULT_BORDER_RADIUS = 16;

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  theme: "one-dark",
  language: "javascript",
  padding: 64,
  background: "linear-gradient(152deg, rgb(87% 61% 43%) 0%, rgb(49% 14% 95%) 100%)",
  showLineNumbers: true,
  windowControls: true,
  fontSize: 20,
  borderShadow: WINDOW_SHADOW,
};

// Shared by the landing page's template cards and the editor frame, so a card
// morphs into the editor when it is opened. Frame names its code window
// `${name}-code`, and globals.css styles both layers by these names.
export const EDITOR_VIEW_TRANSITION = "editor-frame";

export const REPOSITORY_URL = "https://github.com/leochiu-a/code-reel";
export const FEEDBACK_URL = `${REPOSITORY_URL}/issues/new`;
