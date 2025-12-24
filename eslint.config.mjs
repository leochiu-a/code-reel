import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tailwind from "eslint-plugin-tailwindcss";

const eslintConfig = defineConfig(
  [
    ...nextVitals,
    ...nextTs,
    globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
    ...tailwind.configs["flat/recommended"],
  ],
  {
    settings: {
      // https://github.com/tailwindlabs/tailwindcss/discussions/16661#discussioncomment-14977292
      tailwindcss: {
        config: false,
      },
    },
  },
);

export default eslintConfig;
