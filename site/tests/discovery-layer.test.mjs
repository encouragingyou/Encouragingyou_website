import test from "node:test";
import assert from "node:assert/strict";

import socialPreviewManifest from "../src/data/generated/social-preview-manifest.json" with { type: "json" };
import {
  buildRobotsTxt,
  listRouteRecords,
  listSitemapRouteRecords
} from "../src/lib/content/discovery.js";
import { buildServiceStructuredData } from "../src/lib/content/structured-data.js";

const publicDiscoveryOptions = {
  deploymentChannel: "production",
  deploymentSurface: "public",
  siteUrl: "https://www.encouragingyou.co.uk"
};

test("sitemap route policy includes only canonical indexable public routes", () => {
  const routes = listSitemapRouteRecords(publicDiscoveryOptions).map(
    (record) => record.route
  );

  assert(routes.includes("/"));
  assert(routes.includes("/programmes/"));
  assert(routes.includes("/events-updates/live-support-stays-on-sessions/"));
  assert(!routes.includes("/privacy/"));
  assert(!routes.includes("/cookies/"));
  assert(!routes.includes("/accessibility/"));
  assert(!routes.includes("/terms/"));
  assert(!routes.includes("/system/components/"));
});

test("robots policy stays minimal and publishes the canonical sitemap location", () => {
  const robots = buildRobotsTxt(publicDiscoveryOptions);

  assert.match(robots, /User-agent: \*/u);
  assert.match(robots, /Allow: \//u);
  assert.match(robots, /Disallow: \/api\//u);
  assert.match(robots, /Disallow: \/system\//u);
  assert.match(robots, /Sitemap: https:\/\/www\.encouragingyou\.co\.uk\/sitemap\.xml/u);
});

test("preview discovery output blocks crawling and rewrites canonicals to the preview host", () => {
  const previewOptions = {
    deploymentChannel: "preview",
    deploymentSurface: "public",
    renderExternalUrl: "https://encouragingyou-pr-48.onrender.com"
  };
  const previewRoutes = listRouteRecords(previewOptions);
  const home = previewRoutes.find((record) => record.route === "/");

  assert.equal(buildRobotsTxt(previewOptions), "User-agent: *\nDisallow: /\n");
  assert.deepEqual(listSitemapRouteRecords(previewOptions), []);
  assert.equal(home?.canonicalUrl, "https://encouragingyou-pr-48.onrender.com/");
});

test("social preview manifest covers every live route family", () => {
  const coveredFamilies = new Set(
    socialPreviewManifest.assets.flatMap((asset) => asset.routeFamilies)
  );
  const liveFamilies = new Set(
    listRouteRecords(publicDiscoveryOptions)
      .filter((record) => record.pageId !== "not-found")
      .map((record) => record.routeFamily)
  );

  for (const family of liveFamilies) {
    assert(coveredFamilies.has(family), `Missing social preview asset for ${family}`);
  }
});

test("service schema can be embedded without emitting a nested context key", () => {
  const service = buildServiceStructuredData({
    name: "Community & Friendship",
    description: "Belonging-led support.",
    includeContext: false
  });

  assert.equal(service["@type"], "Service");
  assert.equal(service["@context"], undefined);
  assert.equal(service.provider.name, "EncouragingYou CIC");
});
