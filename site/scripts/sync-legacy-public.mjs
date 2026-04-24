import { mkdir, cp, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  adoptedLegacyAssetDirectories,
  adoptedLegacyRootFiles,
  astroManagedRoutes,
  wrappedLegacyRoutes
} from "../src/lib/legacy/bridge-manifest.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(siteRoot, "..");
const publicRoot = resolve(siteRoot, "public");

async function copyEntry(entry) {
  const sourcePath = resolve(repoRoot, entry.sourcePath);
  const relativeTargetPath = entry.publicPath.replace(/^\//u, "");
  const targetPath = resolve(publicRoot, relativeTargetPath);

  await mkdir(dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { recursive: true, force: true });

  return {
    sourcePath,
    targetPath
  };
}

async function copyLegacyRoute(entry) {
  const sourcePath = resolve(repoRoot, entry.sourcePath);
  const targetPath = resolve(publicRoot, entry.publicPath.replace(/^\//u, ""));

  await mkdir(dirname(targetPath), { recursive: true });
  await cp(sourcePath, targetPath, { force: true });

  return {
    sourcePath,
    targetPath
  };
}

async function removeStaleLegacyEntry(relativePublicPath) {
  const targetPath = resolve(publicRoot, relativePublicPath.replace(/^\//u, ""));

  await rm(targetPath, { recursive: true, force: true });
}

async function removeStaleAstroManagedRoute(entry) {
  if (entry.route.includes("[") || entry.route === "/") {
    return null;
  }

  const routePath = entry.route.replace(/^\//u, "").replace(/\/$/u, "");

  if (!routePath) {
    return null;
  }

  const targetPath = resolve(publicRoot, routePath, "index.html");

  await rm(targetPath, { force: true });

  return targetPath;
}

await mkdir(publicRoot, { recursive: true });

await Promise.all([removeStaleLegacyEntry("/assets"), removeStaleLegacyEntry("/fonts")]);

const results = [];

for (const entry of astroManagedRoutes) {
  await removeStaleAstroManagedRoute(entry);
}

for (const entry of [...adoptedLegacyAssetDirectories, ...adoptedLegacyRootFiles]) {
  results.push(await copyEntry(entry));
}

for (const entry of wrappedLegacyRoutes) {
  results.push(await copyLegacyRoute(entry));
}

for (const result of results) {
  console.log(`[legacy-sync] ${result.sourcePath} -> ${result.targetPath}`);
}
