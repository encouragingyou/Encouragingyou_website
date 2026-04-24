import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      ".astro/**",
      ".vercel/**",
      "dist/**",
      "node_modules/**",
      "output/**",
      "public/**",
      "src/data/generated/**"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs["flat/recommended"],
  {
    files: ["src/**/*.{js,mjs,ts,astro}"],
    languageOptions: {
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  },
  {
    files: ["tests/**/*.{js,mjs,ts}", "scripts/**/*.{js,mjs,ts}", "*.config.mjs"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  eslintConfigPrettier
];
