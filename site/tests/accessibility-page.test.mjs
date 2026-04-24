import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import accessibilityStatement from "../src/content/accessibilityStatement/default.json" with { type: "json" };
import consentAwareMicrocopy from "../src/content/consentAwareMicrocopy/default.json" with { type: "json" };
import contactInfo from "../src/content/contactInfo/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import legalPages from "../src/content/legalPages/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };

const accessibilityRoutePath = new URL(
  "../src/pages/accessibility/index.astro",
  import.meta.url
);

test("accessibility statement is grounded in the live launch build and dedicated feedback flow", () => {
  const pageDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "accessibility"
  );
  const legalPage = legalPages.pages.find((entry) => entry.id === "accessibility");
  const routePage = routePages.pages.find((entry) => entry.pageId === "accessibility");
  const feedbackSurface = formSurfaces.surfaces.find(
    (entry) => entry.id === accessibilityStatement.settings.feedbackSurfaceId
  );

  assert.ok(pageDefinition, "Expected accessibility page definition to exist.");
  assert.ok(legalPage, "Expected accessibility legal-page record to exist.");
  assert.ok(routePage, "Expected accessibility route metadata to exist.");
  assert.ok(feedbackSurface, "Expected accessibility feedback form surface to exist.");

  assert.equal(pageDefinition.contentStatus, "seeded");
  assert.equal(legalPage.contentState, "seeded");
  assert.equal(accessibilityStatement.settings.standardTarget, "WCAG 2.2 AA");
  assert.equal(accessibilityStatement.settings.lastReviewed, "2026-04-23");
  assert.equal(feedbackSurface.defaultReasonId, "accessibility");
  assert.equal(feedbackSurface.reasonFieldMode, "hidden");
  assert.equal(feedbackSurface.showUpdatesOptIn, false);
  assert.ok(
    contactInfo.reasonOptions.some((option) => option.id === "accessibility"),
    "Expected accessibility reason option to exist."
  );
  assert.equal(
    consentAwareMicrocopy.settings.accessibilityFeedbackSurfaceId,
    feedbackSurface.id
  );
  assert.ok(accessibilityStatement.page.limitations.length >= 3);
  assert.match(routePage.metaDescription, /dedicated route to report a barrier/u);
});

test("accessibility route uses the structured statement components instead of the old placeholder", async () => {
  const source = await readFile(accessibilityRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<PolicyContents/u);
  assert.match(source, /<SupportForm/u);
  assert.match(source, /model\.limitations/u);
  assert.match(source, /model\.reviewTriggers/u);
  assert.doesNotMatch(source, /<LaunchPlaceholder/u);
  assert.doesNotMatch(source, /getLegalPlaceholderModel/u);
});
