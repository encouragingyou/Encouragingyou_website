import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = dirname(fileURLToPath(import.meta.url));
const vercelSiteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : null;
const siteUrl =
  process.env.SITE_URL ??
  process.env.RENDER_EXTERNAL_URL ??
  vercelSiteUrl ??
  "https://www.encouragingyou.co.uk";

export default defineConfig({
  output: "server",
  adapter: vercel(),
  site: siteUrl,
  trailingSlash: "always",
  security: {
    checkOrigin: false
  },
  build: {
    format: "directory"
  },
  vite: {
    resolve: {
      alias: {
        "@": resolve(siteRoot, "src"),
        "@components": resolve(siteRoot, "src/components"),
        "@content": resolve(siteRoot, "src/content"),
        "@data": resolve(siteRoot, "src/data"),
        "@layouts": resolve(siteRoot, "src/layouts"),
        "@lib": resolve(siteRoot, "src/lib"),
        "@styles": resolve(siteRoot, "src/styles")
      }
    }
  }
});
