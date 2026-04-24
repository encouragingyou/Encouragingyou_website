import test from "node:test";
import assert from "node:assert/strict";

import mediaLibrary from "../src/content/mediaLibrary/default.json" with { type: "json" };
import seo from "../src/content/seo/default.json" with { type: "json" };
import shellConfig from "../src/content/shellConfig/default.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };
import { buildEditorialFeedModel } from "../src/lib/domain/editorial-feed.js";

test("home SEO directive locks the canonical title override and indexable search intent", () => {
  const directive = seo.pageDirectives.find((entry) => entry.pageId === "home");

  assert.ok(directive, "Expected the home SEO directive to exist.");
  assert.equal(directive.indexing, "index");
  assert.equal(directive.titleOverride, "EncouragingYou | Youth-led support in Rochdale");
  assert.match(directive.primaryTopic, /Youth-led community support in Rochdale/u);
  assert.match(directive.searchIntent, /welcoming first step into support/u);
});

test("trust and utility routes are deliberately marked noindex instead of inheriting public-search defaults", () => {
  const noindexPageIds = seo.pageDirectives
    .filter((entry) => entry.indexing === "noindex")
    .map((entry) => entry.pageId)
    .sort();

  assert.deepEqual(noindexPageIds, [
    "accessibility",
    "component-preview",
    "cookies",
    "not-found",
    "privacy",
    "terms"
  ]);
});

test("default social-preview fallback exists and is explicitly blocked from safeguarding routes", () => {
  const fallbackAsset = mediaLibrary.assets.find(
    (asset) => asset.id === seo.defaults.defaultSocialMediaId
  );

  assert.ok(fallbackAsset, "Expected the SEO default social media asset to exist.");
  assert.equal(fallbackAsset.id, "hero-home");
  assert.equal(fallbackAsset.noticeId, "ai-illustration");
  assert.equal(fallbackAsset.launchApproved, true);
  assert.ok(
    fallbackAsset.restrictedRouteFamilies.includes("safeguarding"),
    "Expected the generic fallback illustration to stay blocked from safeguarding routes."
  );
});

test("editorial detail routes stay slug-based and only current public items remain index-visible", () => {
  const feed = buildEditorialFeedModel(updatesFeed);
  const item = feed.detailItems.find(
    (entry) => entry.slug === "community-events-and-workshops"
  );

  assert.ok(item, "Expected the seeded event detail item to exist.");
  assert.equal(item.detailHref, "/events-updates/community-events-and-workshops/");
  assert.equal(item.indexVisible, true);
  assert.equal(item.detailVisible, true);
  assert.equal(item.detailTemplate, "event-detail");
});

test("contact route owns a contextual related-links group for internal-link reinforcement", () => {
  const group = shellConfig.relatedRouteGroups.find((entry) =>
    entry.pageIds.includes("contact")
  );

  assert.ok(group, "Expected the contact related-routes group to exist.");
  assert.equal(group.title, "Related routes");
  assert.deepEqual(
    group.links.map((link) => link.routeId),
    ["sessions", "programmes", "safeguarding"]
  );
});
