import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import socialPreviewManifest from "../src/data/generated/social-preview-manifest.json" with { type: "json" };
import {
  buildRobotsTxt,
  buildSitemapXml,
  getDiscoveryContent,
  listRouteRecords,
  listSitemapRouteRecords
} from "../src/lib/content/discovery.js";

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicRoot = resolve(siteRoot, "public");
const discoveryContent = getDiscoveryContent();

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function unique(values) {
  return new Set(values);
}

const allRoutes = listRouteRecords();
const sitemapRoutes = listSitemapRouteRecords();
const expectedRobots = buildRobotsTxt();
const expectedSitemap = buildSitemapXml(sitemapRoutes);
const robotsPath = resolve(publicRoot, "robots.txt");
const sitemapPath = resolve(publicRoot, "sitemap.xml");
const actualRobots = await readFile(robotsPath, "utf8");
const actualSitemap = await readFile(sitemapPath, "utf8");

assert(actualRobots === expectedRobots, "robots.txt does not match generated policy");
assert(actualSitemap === expectedSitemap, "sitemap.xml does not match generated policy");

for (const route of sitemapRoutes) {
  assert(route.indexable, `Sitemap route must be indexable: ${route.route}`);
}

const coveredRouteFamilies = unique(
  socialPreviewManifest.assets.flatMap((asset) => asset.routeFamilies)
);
const requiredRouteFamilies = unique(
  allRoutes
    .filter((route) => route.pageId !== "not-found")
    .map((route) => route.routeFamily)
);

for (const routeFamily of requiredRouteFamilies) {
  assert(
    coveredRouteFamilies.has(routeFamily),
    `Missing social preview asset for route family: ${routeFamily}`
  );
}

for (const asset of socialPreviewManifest.assets) {
  const outputPath = resolve(publicRoot, asset.publicPath.replace(/^\//u, ""));

  await access(outputPath);
}

assert(
  discoveryContent.sitemap.lastmodStrategy === "omit-until-trustworthy",
  "Unexpected sitemap lastmod strategy"
);

console.log(
  `[discovery-validate] validated ${sitemapRoutes.length} sitemap routes, ${socialPreviewManifest.assets.length} social preview assets, and robots policy`
);
