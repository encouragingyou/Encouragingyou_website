import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import legalPages from "../src/content/legalPages/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import privacyNotice from "../src/content/privacyNotice/default.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };

const privacyRoutePath = new URL("../src/pages/privacy/index.astro", import.meta.url);

test("privacy notice is grounded in the live enquiry surfaces and launch-state flags", () => {
  const pageDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "privacy"
  );
  const legalPage = legalPages.pages.find((entry) => entry.id === "privacy");
  const routePage = routePages.pages.find((entry) => entry.pageId === "privacy");

  assert.ok(pageDefinition, "Expected privacy page definition to exist.");
  assert.ok(legalPage, "Expected privacy legal-page record to exist.");
  assert.ok(routePage, "Expected privacy route metadata to exist.");

  assert.equal(pageDefinition.contentStatus, "seeded");
  assert.equal(legalPage.contentState, "seeded");
  assert.match(routePage.metaDescription, /safeguarding enquiries/u);
  assert.deepEqual(
    privacyNotice.page.collectionPoints.map((point) => point.surfaceId).sort(),
    formSurfaces.surfaces.map((surface) => surface.id).sort()
  );
  assert.ok(
    formSurfaces.surfaces.every(
      (surface) =>
        Array.isArray(surface.privacyHighlights) && surface.privacyHighlights.length
    ),
    "Every live form surface should now expose point-of-collection privacy highlights."
  );
  assert.equal(privacyNotice.settings.analyticsStatus, "configured");
  assert.equal(privacyNotice.settings.nonEssentialCookiesStatus, "absent");
  assert.equal(privacyNotice.settings.newsletterProcessorStatus, "not-configured");
  assert.equal(privacyNotice.settings.crmProcessorStatus, "not-configured");
  assert.equal(privacyNotice.settings.retentionMode, "manual-review");
  assert.equal(
    privacyNotice.page.systems.find((system) => system.id === "analytics")?.status,
    "active"
  );
  assert.ok(
    privacyNotice.page.reviewTriggers.some((trigger) =>
      /analytics|cookies/u.test(trigger)
    )
  );
  assert.match(
    privacyNotice.page.collectionPoints.find(
      (point) => point.id === "safeguarding-concern"
    ).retention,
    /do not publish a fixed deletion window/u
  );
});

test("privacy route uses the structured legal components instead of the old launch summary", async () => {
  const source = await readFile(privacyRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<PolicyContents/u);
  assert.match(source, /<PrivacyCollectionPointCard/u);
  assert.match(source, /model\.collectionPoints/u);
  assert.match(source, /model\.reviewTriggers/u);
  assert.doesNotMatch(source, /questionPanel/u);
  assert.doesNotMatch(source, /launch-safe summary/u);
});
