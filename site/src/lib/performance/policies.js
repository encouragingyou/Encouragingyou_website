export const performanceBudgetVersion = "2026-04-24";

export const sharedPerformanceBudgets = {
  stylesheetsPerPageMax: 1,
  moduleScriptsPerPageMax: 1,
  fontPreloadsPerPageMax: 1,
  clientCssBytesMax: 96_000,
  clientScriptBytesMax: 16_000,
  astroGeneratedMediaCountMax: 0,
  thirdPartyRequestsMax: 0
};

export const routePerformanceTiers = [
  {
    id: "first-impression",
    label: "First impression routes",
    routes: ["/", "/about/"],
    htmlBytesMax: 52_000,
    eagerImageCountMax: 1
  },
  {
    id: "illustration-heavy",
    label: "Illustration-heavy content routes",
    prefixes: ["/programmes/", "/get-involved/", "/partner/", "/volunteer/"],
    htmlBytesMax: 58_000,
    eagerImageCountMax: 1
  },
  {
    id: "live-session",
    label: "Live session routes",
    prefixes: ["/sessions/"],
    htmlBytesMax: 56_000,
    eagerImageCountMax: 0
  },
  {
    id: "utility-trust",
    label: "Utility and trust routes",
    routes: [
      "/contact/",
      "/privacy/",
      "/cookies/",
      "/accessibility/",
      "/terms/",
      "/safeguarding/",
      "/safeguarding/child/",
      "/safeguarding/adult/"
    ],
    htmlBytesMax: 52_000,
    eagerImageCountMax: 0
  },
  {
    id: "editorial",
    label: "Editorial list and detail routes",
    prefixes: ["/events-updates/"],
    htmlBytesMax: 56_000,
    eagerImageCountMax: 1
  }
];

export const performanceSentinelRoutes = [
  "/",
  "/about/",
  "/programmes/",
  "/programmes/community-friendship/",
  "/sessions/",
  "/sessions/cv-support/",
  "/get-involved/",
  "/contact/",
  "/privacy/",
  "/events-updates/",
  "/events-updates/community-events-and-workshops/"
];

export const cachePolicy = {
  html: {
    marketing: "public, max-age=0",
    truthCritical: "public, max-age=0"
  },
  api: {
    sensitive: "no-store"
  },
  static: {
    hashedClientAssets: "public, max-age=31536000, immutable",
    fonts: "public, max-age=604800, stale-while-revalidate=86400",
    curatedMedia: "public, max-age=604800, stale-while-revalidate=86400",
    downloads: "public, max-age=3600, must-revalidate",
    discovery: "public, max-age=3600, must-revalidate",
    socialPreviews: "public, max-age=86400, must-revalidate",
    favicon: "public, max-age=86400, must-revalidate"
  }
};

export function normalizePerformancePath(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function resolvePerformanceTier(pathname) {
  const normalizedPath = normalizePerformancePath(pathname);

  const exactMatch = routePerformanceTiers.find((tier) =>
    tier.routes?.includes(normalizedPath)
  );

  if (exactMatch) {
    return exactMatch;
  }

  const prefixMatches = routePerformanceTiers.filter((tier) =>
    tier.prefixes?.some((prefix) => normalizedPath.startsWith(prefix))
  );

  if (prefixMatches.length === 0) {
    return routePerformanceTiers[routePerformanceTiers.length - 1];
  }

  return prefixMatches.sort((left, right) => {
    const leftPrefixLength = Math.max(...left.prefixes.map((prefix) => prefix.length));
    const rightPrefixLength = Math.max(...right.prefixes.map((prefix) => prefix.length));

    return rightPrefixLength - leftPrefixLength;
  })[0];
}

export function isTruthCriticalPath(pathname) {
  const normalizedPath = normalizePerformancePath(pathname);

  return (
    normalizedPath.startsWith("/contact/") ||
    normalizedPath.startsWith("/privacy/") ||
    normalizedPath.startsWith("/cookies/") ||
    normalizedPath.startsWith("/accessibility/") ||
    normalizedPath.startsWith("/terms/") ||
    normalizedPath.startsWith("/safeguarding/")
  );
}

export function resolveHtmlCacheControl(pathname) {
  return isTruthCriticalPath(pathname)
    ? cachePolicy.html.truthCritical
    : cachePolicy.html.marketing;
}
