import socialPreviewManifest from "../../data/generated/social-preview-manifest.json" with { type: "json" };
import { resolvePublicSiteUrl } from "../deployment/context.js";
import { deriveDiscoveryRouteFamily, getLaunchPageById } from "./discovery.js";

export function getSocialPreviewAsset(pageId, template) {
  const publicSiteUrl = resolvePublicSiteUrl();
  const page = getLaunchPageById(pageId);
  const routeFamily = deriveDiscoveryRouteFamily(
    pageId,
    template ?? page?.template ?? null
  );

  const asset =
    socialPreviewManifest.assets.find((entry) =>
      entry.routeFamilies.includes(routeFamily)
    ) ?? null;

  if (!asset) {
    return null;
  }

  return {
    url: new URL(asset.publicPath, publicSiteUrl).toString(),
    alt: asset.alt,
    width: asset.width,
    height: asset.height
  };
}
