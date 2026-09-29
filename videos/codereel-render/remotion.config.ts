import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";

// The editor's frame (src/components/Frame.tsx) is styled with Tailwind.
Config.overrideWebpackConfig((config) => enableTailwind(config));
