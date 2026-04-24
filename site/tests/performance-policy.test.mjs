import test from "node:test";
import assert from "node:assert/strict";

import { getMediaAsset } from "../src/lib/media/catalog.ts";
import {
  getMediaFallbackRender,
  getMediaPictureSources,
  getMediaPublicUrl
} from "../src/lib/media/delivery.js";
import {
  resolveHtmlCacheControl,
  resolvePerformanceTier
} from "../src/lib/performance/policies.js";

test("route tiers resolve to the expected launch page families", () => {
  assert.equal(resolvePerformanceTier("/").id, "first-impression");
  assert.equal(resolvePerformanceTier("/about/").id, "first-impression");
  assert.equal(
    resolvePerformanceTier("/programmes/community-friendship/").id,
    "illustration-heavy"
  );
  assert.equal(resolvePerformanceTier("/sessions/cv-support/").id, "live-session");
  assert.equal(resolvePerformanceTier("/privacy/").id, "utility-trust");
  assert.equal(
    resolvePerformanceTier("/events-updates/community-events-and-workshops/").id,
    "editorial"
  );
});

test("HTML cache policy stays browser-revalidating for launch", () => {
  assert.equal(resolveHtmlCacheControl("/"), "public, max-age=0");
  assert.equal(resolveHtmlCacheControl("/privacy/"), "public, max-age=0");
});

test("media delivery resolves to curated public derivatives instead of source masters", () => {
  const hero = getMediaAsset("hero-home");
  const heroFallback = getMediaFallbackRender(hero);
  const heroSources = getMediaPictureSources(hero);
  const icon = getMediaAsset("icon-contact");
  const iconFallback = getMediaFallbackRender(icon);

  assert.equal(heroFallback?.publicPath, "/images/hero-1200.webp");
  assert.equal(
    getMediaPublicUrl(hero, "https://www.encouragingyou.co.uk"),
    "https://www.encouragingyou.co.uk/images/hero-1200.webp"
  );
  assert.equal(heroSources[0]?.mimeType, "image/avif");
  assert.match(heroSources[0]?.srcset ?? "", /\/images\/hero-800\.avif 800w/u);
  assert.match(heroSources[1]?.srcset ?? "", /\/images\/hero-1200\.webp 1200w/u);
  assert.equal(iconFallback?.publicPath, "/icons/contact.webp");
});
