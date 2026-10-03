import Auth0Frame from "./Auth0Frame";
import AwsFrame from "./AwsFrame";
import BrowserbaseFrame from "./BrowserbaseFrame";
import ClerkFrame from "./ClerkFrame";
import CloudflareFrame from "./CloudflareFrame";
import ElevenLabsFrame from "./ElevenLabsFrame";
import FirecrawlFrame from "./FirecrawlFrame";
import GeminiFrame from "./GeminiFrame";
import MintlifyFrame from "./MintlifyFrame";
import NuxtFrame from "./NuxtFrame";
import OpenAIFrame from "./OpenAIFrame";
import PrismaFrame from "./PrismaFrame";
import ResendFrame from "./ResendFrame";
import StripeFrame from "./StripeFrame";
import SupabaseFrame from "./SupabaseFrame";
import TailwindFrame from "./TailwindFrame";
import TriggerFrame from "./TriggerFrame";
import VercelFrame from "./VercelFrame";
import type { FrameComponent } from "./types";

// Brand frames ported from ray.so (MIT, github.com/raycast/ray-so). A theme
// without one gets the plain window.
export const FRAMES = {
  vercel: VercelFrame,
  tailwind: TailwindFrame,
  prisma: PrismaFrame,
  trigger: TriggerFrame,
  supabase: SupabaseFrame,
  openai: OpenAIFrame,
  mintlify: MintlifyFrame,
  clerk: ClerkFrame,
  elevenlabs: ElevenLabsFrame,
  resend: ResendFrame,
  nuxt: NuxtFrame,
  browserbase: BrowserbaseFrame,
  cloudflare: CloudflareFrame,
  gemini: GeminiFrame,
  stripe: StripeFrame,
  firecrawl: FirecrawlFrame,
  aws: AwsFrame,
  auth0: Auth0Frame,
} satisfies Record<string, FrameComponent>;

export type FrameId = keyof typeof FRAMES;
