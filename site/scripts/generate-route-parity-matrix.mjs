import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  adoptedLegacyAssetDirectories,
  adoptedLegacyRootFiles,
  astroManagedRoutes,
  legacyBuildScripts,
  legacyRuntimeScripts,
  wrappedLegacyRoutes
} from "../src/lib/legacy/bridge-manifest.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(siteRoot, "..");
const outputPath = resolve(repoRoot, "docs", "migration", "06-route-parity-matrix.json");

const matrix = {
  generatedAt: new Date().toISOString(),
  runtimeRoot: "site",
  routes: {
    astroManaged: astroManagedRoutes,
    wrappedLegacy: wrappedLegacyRoutes
  },
  staticAssets: {
    directories: adoptedLegacyAssetDirectories
  },
  metadataFiles: adoptedLegacyRootFiles,
  runtimeScripts: legacyRuntimeScripts,
  buildScripts: legacyBuildScripts
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(matrix, null, 2)}\n`, "utf8");

console.log(`[route-parity] Wrote ${outputPath}`);
