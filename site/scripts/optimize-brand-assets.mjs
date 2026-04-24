import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { optimizeBrandAssets } from "./lib/brand-assets.mjs";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const renders = await optimizeBrandAssets({ siteRoot });

for (const render of renders) {
  console.log(
    `[brand-optimize] ${render.id} ${render.width}w ${render.format} -> ${render.targetPath}`
  );
}
