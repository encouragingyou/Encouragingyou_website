import mediaLibrary from "../../content/mediaLibrary/default.json" with { type: "json" };
import type { MediaAsset } from "../types/site-ui";

const assets: MediaAsset[] = mediaLibrary.assets.map((asset) => {
  return {
    ...asset,
    aspectRatio: asset.masterDimensions.width / asset.masterDimensions.height
  } as MediaAsset;
});

const mediaIndex = new Map(assets.map((asset) => [asset.id, asset]));

export function getMediaAsset(id: string) {
  const asset = mediaIndex.get(id);

  if (!asset) {
    throw new Error(`Unknown media asset id: ${id}`);
  }

  return asset;
}

export function getAllMediaAssets() {
  return assets;
}
