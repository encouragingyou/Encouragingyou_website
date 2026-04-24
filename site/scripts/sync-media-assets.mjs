import { mkdir, copyFile, rm, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

import mediaLibrary from "../src/content/mediaLibrary/default.json" with { type: "json" };
import { optimizeBrandAssets } from "./lib/brand-assets.mjs";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(siteRoot, "..");
const publicRoot = resolve(siteRoot, "public");
const buildReportPath = resolve(siteRoot, "src/data/generated/media-build-report.json");

const formatHandlers = {
  avif: (image) => image.avif({ quality: 52, effort: 6 }),
  webp: (image) => image.webp({ quality: 84, effort: 6 }),
  png: (image) => image.png({ compressionLevel: 9 })
};

async function ensureCleanManagedPublicDirectories() {
  await Promise.all([
    rm(resolve(publicRoot, "images"), { recursive: true, force: true }),
    rm(resolve(publicRoot, "icons"), { recursive: true, force: true })
  ]);

  await Promise.all([
    mkdir(resolve(publicRoot, "images"), { recursive: true }),
    mkdir(resolve(publicRoot, "icons"), { recursive: true })
  ]);
}

async function copyMasterAsset(asset) {
  const sourcePath = resolve(repoRoot, asset.canonicalSourcePath);
  const targetPath = resolve(siteRoot, asset.masterAssetPath);

  await mkdir(dirname(targetPath), { recursive: true });
  await copyFile(sourcePath, targetPath);

  const metadata = await sharp(sourcePath).metadata();

  if (
    metadata.width !== asset.masterDimensions.width ||
    metadata.height !== asset.masterDimensions.height
  ) {
    throw new Error(
      `Master dimensions for ${asset.id} do not match the manifest. Expected ${asset.masterDimensions.width}x${asset.masterDimensions.height}, received ${metadata.width}x${metadata.height}.`
    );
  }

  return {
    sourcePath,
    targetPath
  };
}

async function renderCompatibilityAsset(asset) {
  const sourcePath = resolve(repoRoot, asset.canonicalSourcePath);
  const outputs = [];

  for (const render of asset.compatibilityRenders) {
    const targetPath = resolve(publicRoot, render.publicPath.replace(/^\//u, ""));

    await mkdir(dirname(targetPath), { recursive: true });

    if (render.format === "svg") {
      await copyFile(sourcePath, targetPath);
    } else {
      const transform = formatHandlers[render.format];

      if (!transform) {
        throw new Error(`Unsupported compatibility render format: ${render.format}`);
      }

      let pipeline = sharp(sourcePath, { animated: false });

      if (render.width || render.height) {
        pipeline = pipeline.resize(render.width, render.height, {
          fit: "inside",
          withoutEnlargement: true
        });
      }

      await transform(pipeline).toFile(targetPath);
    }

    outputs.push({
      publicPath: render.publicPath,
      targetPath
    });
  }

  return outputs;
}

await ensureCleanManagedPublicDirectories();

const report = {
  version: mediaLibrary.version,
  generatedAt: new Date().toISOString(),
  assets: []
};

for (const asset of mediaLibrary.assets) {
  const master = await copyMasterAsset(asset);
  const renders = await renderCompatibilityAsset(asset);

  report.assets.push({
    id: asset.id,
    kind: asset.kind,
    master,
    compatibilityRenders: renders
  });

  console.log(`[media-sync] ${master.sourcePath} -> ${master.targetPath}`);

  for (const render of renders) {
    console.log(`[media-sync] ${asset.id} -> ${render.targetPath}`);
  }
}

const brandRenders = await optimizeBrandAssets({ siteRoot });

for (const render of brandRenders) {
  console.log(
    `[media-sync] ${render.id} ${render.width}w ${render.format} -> ${render.targetPath}`
  );
}

await mkdir(dirname(buildReportPath), { recursive: true });
await writeFile(buildReportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`[media-sync] wrote ${buildReportPath}`);
