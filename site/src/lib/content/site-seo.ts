import { getMediaAsset } from "../media/catalog.ts";
import {
  resolveDeploymentChannel,
  shouldAllowSearchIndexing
} from "../deployment/context.js";
import { getMediaDimensions, getMediaPublicUrl } from "../media/delivery.js";
import type { MediaAsset, SeoMetaImage, SeoMetadata } from "../types/site-ui";
import { getPageById, getSeoContent, getSiteSettings } from "./content-source-adapter.ts";
import { getSocialPreviewAsset } from "./social-preview.js";

const seoContent = getSeoContent();
const defaultShareMedia = getMediaAsset(seoContent.defaults.defaultSocialMediaId);
const seoDirectiveIndex = new Map(
  seoContent.pageDirectives.map((directive) => [directive.pageId, directive])
);

type SeoBuildOptions = {
  pageId: string;
  path?: string;
  title?: string;
  description: string;
  summary?: string;
  breadcrumbLabel?: string;
  media?: MediaAsset | null;
  ogType?: "article" | "website";
  indexable?: boolean;
  robots?: string;
};

function normalizeSeoPath(pathname = "/") {
  const trimmed = pathname.trim() || "/";
  const withoutQuery = trimmed.split(/[?#]/u)[0] || "/";
  const withLeadingSlash = withoutQuery.startsWith("/")
    ? withoutQuery
    : `/${withoutQuery}`;
  const collapsed = withLeadingSlash.replace(/\/{2,}/gu, "/");

  if (collapsed === "/") {
    return "/";
  }

  if (/\.[a-z0-9]+$/iu.test(collapsed)) {
    return collapsed;
  }

  return collapsed.endsWith("/") ? collapsed : `${collapsed}/`;
}

function deriveRouteFamily(pageId: string, template?: string | null) {
  if (pageId === "home") {
    return "home";
  }

  if (pageId === "about") {
    return "about";
  }

  if (
    template === "safeguarding" ||
    pageId === "safeguarding" ||
    pageId.startsWith("safeguarding-")
  ) {
    return "safeguarding";
  }

  if (pageId === "get-involved" || pageId === "volunteer" || pageId === "partner") {
    return "get-involved";
  }

  if (pageId === "contact") {
    return "contact";
  }

  if (pageId === "events-updates") {
    return "events-updates";
  }

  return pageId;
}

function canUseMediaForSeo(media: MediaAsset, pageId: string, template?: string | null) {
  if (!media.launchApproved) {
    return false;
  }

  const routeFamily = deriveRouteFamily(pageId, template);

  return !media.restrictedRouteFamilies.includes(routeFamily);
}

function toSeoMetaImage(media: MediaAsset): SeoMetaImage {
  const siteSettings = getSiteSettings();
  const imageUrl = getMediaPublicUrl(media, siteSettings.siteUrl);
  const dimensions = getMediaDimensions(media);

  return {
    url: imageUrl ?? siteSettings.siteUrl,
    alt: media.alt || undefined,
    width: dimensions.width,
    height: dimensions.height
  };
}

function resolveShareImage(
  pageId: string,
  template: string | null | undefined,
  media: MediaAsset | null | undefined,
  indexable: boolean
) {
  const generatedPreview = getSocialPreviewAsset(pageId, template ?? undefined);

  if (generatedPreview) {
    return generatedPreview;
  }

  if (media && canUseMediaForSeo(media, pageId, template)) {
    return toSeoMetaImage(media);
  }

  if (!indexable || !canUseMediaForSeo(defaultShareMedia, pageId, template)) {
    return null;
  }

  return toSeoMetaImage(defaultShareMedia);
}

function resolveDefaultTitle(pageId: string, explicitTitle?: string) {
  const directive = seoDirectiveIndex.get(pageId);

  if (directive?.titleOverride) {
    return directive.titleOverride;
  }

  if (explicitTitle) {
    return explicitTitle;
  }

  const page = getPageById(pageId);

  if (page) {
    return `${page.title}${seoContent.defaults.titleSeparator}${seoContent.defaults.siteName}`;
  }

  throw new Error(`Missing title for page id: ${pageId}`);
}

function resolveIndexable(
  pageId: string,
  explicitIndexable?: boolean,
  deploymentChannel = resolveDeploymentChannel()
) {
  if (!shouldAllowSearchIndexing(deploymentChannel)) {
    return false;
  }

  if (typeof explicitIndexable === "boolean") {
    return explicitIndexable;
  }

  const directive = seoDirectiveIndex.get(pageId);

  return directive ? directive.indexing === "index" : true;
}

export function getSeoDirective(pageId: string) {
  return seoDirectiveIndex.get(pageId) ?? null;
}

export function listSeoDirectives() {
  return seoContent.pageDirectives;
}

export function buildSeoMetadata(options: SeoBuildOptions): SeoMetadata {
  const siteSettings = getSiteSettings();
  const deploymentChannel = resolveDeploymentChannel();
  const page = getPageById(options.pageId);
  const template = page?.template ?? null;
  const title = resolveDefaultTitle(options.pageId, options.title);
  const description = options.description.trim();
  const summary = options.summary?.trim() || description;
  const canonicalPath = normalizeSeoPath(options.path ?? page?.route ?? "/");
  const canonicalUrl = new URL(canonicalPath, siteSettings.siteUrl).toString();
  const indexable = resolveIndexable(
    options.pageId,
    options.indexable,
    deploymentChannel
  );
  const robots =
    options.robots ??
    (indexable ? seoContent.defaults.defaultRobots : seoContent.defaults.noindexRobots);
  const image = resolveShareImage(options.pageId, template, options.media, indexable);
  const breadcrumbLabel = options.breadcrumbLabel ?? page?.title ?? title;
  const openGraphType = (options.ogType ?? seoContent.defaults.defaultOgType) as
    | "article"
    | "website";

  return {
    title,
    description,
    summary,
    canonicalPath,
    canonicalUrl,
    robots,
    indexable,
    breadcrumbLabel,
    openGraph: {
      title,
      description,
      type: openGraphType,
      url: canonicalUrl,
      siteName: seoContent.defaults.siteName,
      locale: seoContent.defaults.locale,
      image
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      image
    }
  };
}
