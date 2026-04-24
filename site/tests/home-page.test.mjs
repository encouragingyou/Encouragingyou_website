import test from "node:test";
import assert from "node:assert/strict";

import ctaBlocks from "../src/content/ctaBlocks/default.json" with { type: "json" };
import homePage from "../src/content/homePage/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };

const allPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];
const ctaIndex = new Map(ctaBlocks.blocks.map((cta) => [cta.id, cta]));
const homeActionIndex = new Map(homePage.actions.map((action) => [action.id, action]));
const pageIndex = new Map(allPages.map((page) => [page.id, page]));

function resolveActionHref(actionId) {
  const action = homeActionIndex.get(actionId);

  assert.ok(action, `Missing home action: ${actionId}`);

  if (action.ctaId) {
    const cta = ctaIndex.get(action.ctaId);

    assert.ok(cta, `Missing CTA: ${action.ctaId}`);
    return cta.href ?? pageIndex.get(cta.routeId).route;
  }

  return action.href ?? pageIndex.get(action.routeId).route;
}

test("homepage content locks the canonical conversion stack and ordered section contract", () => {
  assert.equal(homePage.conversionStack.primaryActionId, "join-session");
  assert.equal(homePage.conversionStack.secondaryActionId, "get-support");
  assert.deepEqual(
    homePage.sections.map((section) => section.id),
    [
      "quick-actions",
      "trust-strip",
      "live-sessions",
      "programme-teasers",
      "about-teaser",
      "community-support",
      "updates-surface",
      "involvement-cta",
      "faq-cluster",
      "contact-panel"
    ]
  );
  assert.deepEqual(
    homePage.sections.find((section) => section.id === "programme-teasers")
      .programmeSlugs,
    [
      "community-friendship",
      "personal-growth-life-skills",
      "career-support-cv-help",
      "community-support-intergenerational-connection"
    ]
  );
});

test("homepage trust routing now resolves to distinct routes instead of one blanket link", () => {
  const trustSection = homePage.sections.find((section) => section.id === "trust-strip");
  const trustHrefs = trustSection.trustItems.map((item) =>
    resolveActionHref(item.actionId)
  );

  assert.ok(trustHrefs.includes("/about/"));
  assert.ok(trustHrefs.includes("/privacy/"));
  assert.ok(trustHrefs.includes("/safeguarding/"));
  assert.ok(trustHrefs.includes("/sessions/"));
});

test("homepage state rules and launch boundaries stay explicit", () => {
  assert.equal(updatesFeed.items.length, 3);
  assert.equal(updatesFeed.items.filter((item) => item.showOnHome !== false).length, 2);
  assert.equal(homePage.stateRules.updates.emptyBehavior, "teaser");
  assert.ok(homePage.stateRules.contact.pendingFields.includes("publicPhone"));
  assert.ok(
    homePage.launchBoundaries.deferredToLaterRoutes.includes(
      "full event and update archive"
    )
  );
  assert.ok(
    homePage.launchBoundaries.intentionallyExcludedFromLaunch.includes(
      "invented testimonials or impact numbers"
    )
  );
});
