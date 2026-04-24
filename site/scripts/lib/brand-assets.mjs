import { mkdir, stat } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

import sharp from "sharp";

const PNG_OPTIONS = {
  compressionLevel: 9,
  adaptiveFiltering: true
};

const WEBP_OPTIONS = {
  lossless: true,
  effort: 6
};

const brandAssetConfigs = [
  {
    id: "encouragingyou-mark",
    sourcePath: "public/brand/encouragingyou-mark.png",
    widths: [64, 128, 192]
  },
  {
    id: "encouragingyou-wordmark",
    sourcePath: "public/brand/encouragingyou-wordmark.png",
    widths: [180, 360, 544]
  }
];

function getVariantTargetPath(siteRoot, sourcePath, width, format) {
  const absoluteSourcePath = resolve(siteRoot, sourcePath);
  const sourceExtension = extname(absoluteSourcePath);

  return absoluteSourcePath.replace(
    new RegExp(`${sourceExtension}$`, "u"),
    `-${width}.${format}`
  );
}

async function renderVariant(sourcePath, targetPath, width, format) {
  await mkdir(dirname(targetPath), { recursive: true });

  const pipeline = sharp(sourcePath, { animated: false }).resize({
    width,
    fit: "inside",
    withoutEnlargement: true
  });

  if (format === "png") {
    await pipeline.png(PNG_OPTIONS).toFile(targetPath);
    return;
  }

  if (format === "webp") {
    await pipeline.webp(WEBP_OPTIONS).toFile(targetPath);
    return;
  }

  throw new Error(`Unsupported brand asset format: ${format}`);
}

export async function optimizeBrandAssets({ siteRoot }) {
  const renders = [];

  for (const asset of brandAssetConfigs) {
    const sourcePath = resolve(siteRoot, asset.sourcePath);
    await stat(sourcePath);

    const metadata = await sharp(sourcePath).metadata();
    const widths = asset.widths.filter(
      (width) => typeof metadata.width !== "number" || width <= metadata.width
    );

    for (const width of widths) {
      for (const format of ["png", "webp"]) {
        const targetPath = getVariantTargetPath(siteRoot, asset.sourcePath, width, format);

        await renderVariant(sourcePath, targetPath, width, format);

        renders.push({
          id: asset.id,
          format,
          width,
          targetPath
        });
      }
    }
  }

  return renders;
}
