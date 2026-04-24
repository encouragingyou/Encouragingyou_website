import discoveryContent from "../../content/discovery/default.json" with { type: "json" };
import pageDefinitions from "../../content/pageDefinitions/launch.json" with { type: "json" };
import seoContent from "../../content/seo/default.json" with { type: "json" };
import updatesFeed from "../../content/updatesFeed/default.json" with { type: "json" };
import {
  resolveDeploymentChannel,
  resolveDeploymentSurface,
  resolvePublicSiteUrl,
  shouldAllowSearchIndexing
} from "../deployment/context.js";
import {
  buildEditorialDetailHref,
  buildEditorialFeedModel
} from "../domain/editorial-feed.js";

const launchPages = pageDefinitions.launchPages;
const pageIndex = new Map(launchPages.map((page) => [page.id, page]));
const seoDirectiveIndex = new Map(
  seoContent.pageDirectives.map((directive) => [directive.pageId, directive])
);
const editorialFeed = buildEditorialFeedModel(updatesFeed);

export function normalizeDiscoveryPath(pathname = "/") {
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

function resolveDiscoveryOptions(options = {}) {
  const deploymentChannel = resolveDeploymentChannel(options);
  const deploymentSurface = resolveDeploymentSurface({
    ...options,
    deploymentChannel
  });

  return {
    deploymentChannel,
    deploymentSurface,
    publicSiteUrl: resolvePublicSiteUrl(options),
    searchIndexingAllowed: shouldAllowSearchIndexing(deploymentChannel, deploymentSurface)
  };
}

export function buildAbsoluteSiteUrl(pathname = "/", options = {}) {
  const { publicSiteUrl } = resolveDiscoveryOptions(options);

  return new URL(normalizeDiscoveryPath(pathname), publicSiteUrl).toString();
}

export function getDiscoveryContent() {
  return discoveryContent;
}

export function getLaunchPageById(pageId) {
  return pageIndex.get(pageId) ?? null;
}

export function getSeoDirectiveByPageId(pageId) {
  return seoDirectiveIndex.get(pageId) ?? null;
}

export function deriveDiscoveryRouteFamily(pageId, template = null) {
  if (pageId === "home") {
    return "home";
  }

  if (pageId === "about") {
    return "about";
  }

  if (pageId === "programmes" || template === "programme-index") {
    return "programmes";
  }

  if (template === "programme-detail" || pageId.startsWith("programme-")) {
    return "programme-detail";
  }

  if (pageId === "sessions" || template === "session-index") {
    return "sessions";
  }

  if (template === "session-detail" || pageId.startsWith("session-")) {
    return "session-detail";
  }

  if (pageId === "events-updates" || template === "updates-index") {
    return "events-updates";
  }

  if (pageId === "get-involved" || template === "get-involved-hub") {
    return "get-involved";
  }

  if (pageId === "volunteer" || template === "volunteer-detail") {
    return "volunteer";
  }

  if (pageId === "partner" || template === "partner-detail") {
    return "partner";
  }

  if (pageId === "contact" || template === "contact") {
    return "contact";
  }

  if (
    template === "safeguarding" ||
    pageId === "safeguarding" ||
    pageId.startsWith("safeguarding-")
  ) {
    return "safeguarding";
  }

  if (template === "legal") {
    return "legal";
  }

  return pageId;
}

export function listRouteRecords(options = {}) {
  const staticRoutes = launchPages.map((page) => {
    const directive = getSeoDirectiveByPageId(page.id);

    if (!directive) {
      throw new Error(`Missing SEO directive for page id: ${page.id}`);
    }

    return {
      kind: "static",
      pageId: page.id,
      template: page.template,
      routeFamily: deriveDiscoveryRouteFamily(page.id, page.template),
      route: normalizeDiscoveryPath(page.route),
      canonicalUrl: buildAbsoluteSiteUrl(page.route, options),
      title: page.title,
      indexable: directive.indexing === "index"
    };
  });

  const editorialRoutes = editorialFeed.detailItems.map((item) => {
    const route = buildEditorialDetailHref(item);

    return {
      kind: "editorial-detail",
      pageId: `editorial-${item.slug}`,
      template: "editorial-detail",
      routeFamily: "editorial-detail",
      route: normalizeDiscoveryPath(route),
      canonicalUrl: buildAbsoluteSiteUrl(route, options),
      title: item.detail.intro.title,
      indexable: item.indexVisible
    };
  });

  return [...staticRoutes, ...editorialRoutes];
}

export function isSitemapEligibleRoute(pathname) {
  const normalized = normalizeDiscoveryPath(pathname);

  return !discoveryContent.sitemap.excludeRoutePrefixes.some((prefix) =>
    normalized.startsWith(prefix)
  );
}

export function listSitemapRouteRecords(options = {}) {
  const { searchIndexingAllowed } = resolveDiscoveryOptions(options);

  if (!searchIndexingAllowed) {
    return [];
  }

  return listRouteRecords(options).filter(
    (record) => record.indexable && isSitemapEligibleRoute(record.route)
  );
}

export function getSocialPreviewFamilyByRouteFamily(routeFamily) {
  return (
    discoveryContent.socialPreview.families.find((family) =>
      family.routeFamilies.includes(routeFamily)
    ) ?? null
  );
}

export function buildSitemapXml(routeRecords = listSitemapRouteRecords()) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
  ];

  for (const record of routeRecords) {
    lines.push("  <url>");
    lines.push(`    <loc>${record.canonicalUrl}</loc>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");

  return `${lines.join("\n")}\n`;
}

export function buildRobotsTxt(options = {}) {
  const { searchIndexingAllowed } = resolveDiscoveryOptions(options);

  if (!searchIndexingAllowed) {
    return "User-agent: *\nDisallow: /\n";
  }

  const lines = [];

  for (const policy of discoveryContent.robots.policies) {
    lines.push(`User-agent: ${policy.userAgent}`);

    for (const allowedPath of policy.allow) {
      lines.push(`Allow: ${allowedPath}`);
    }

    for (const disallowedPath of policy.disallow) {
      lines.push(`Disallow: ${disallowedPath}`);
    }

    lines.push("");
  }

  lines.push(
    `Sitemap: ${buildAbsoluteSiteUrl(discoveryContent.robots.sitemapPath, options)}`
  );

  return `${lines.join("\n")}\n`;
}
