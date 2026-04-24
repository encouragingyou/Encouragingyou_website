import node from "@astrojs/node";
import { defineConfig } from "astro/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = dirname(fileURLToPath(import.meta.url));
const siteUrl =
  process.env.SITE_URL ??
  process.env.RENDER_EXTERNAL_URL ??
  "https://www.encouragingyou.co.uk";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone"
  }),
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
