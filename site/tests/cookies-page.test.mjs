import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import legalPages from "../src/content/legalPages/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import storageAccess from "../src/content/storageAccess/default.json" with { type: "json" };

const cookiesRoutePath = new URL("../src/pages/cookies/index.astro", import.meta.url);

test("cookie notice is grounded in the launch analytics-objection state and audited registry", () => {
  const pageDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "cookies"
  );
  const legalPage = legalPages.pages.find((entry) => entry.id === "cookies");
  const routePage = routePages.pages.find((entry) => entry.pageId === "cookies");

  assert.ok(pageDefinition, "Expected cookies page definition to exist.");
  assert.ok(legalPage, "Expected cookies legal-page record to exist.");
  assert.ok(routePage, "Expected cookies route metadata to exist.");

  assert.equal(pageDefinition.contentStatus, "seeded");
  assert.equal(legalPage.contentState, "seeded");
  assert.equal(storageAccess.settings.consentExperience, "informational-notice");
  assert.equal(storageAccess.settings.nonEssentialTechnologiesStatus, "absent");
  assert.equal(storageAccess.settings.consentRecordStorage, "cookie");
  assert.match(routePage.metaDescription, /first-party analytics model/u);
  assert.deepEqual(
    storageAccess.page.contents.map((item) => item.id),
    [
      "current-state",
      "active-registry",
      "absent-registry",
      "consent-decision",
      "analytics-preferences",
      "future-changes"
    ]
  );
  assert.equal(storageAccess.registry.active.length, 5);
  assert.ok(
    storageAccess.registry.active.every(
      (entry) => entry.consentRequirement === "not-required"
    )
  );
  assert.ok(
    storageAccess.registry.active.some(
      (entry) => entry.id === "first-party-statistical-analytics"
    )
  );
  assert.ok(
    storageAccess.registry.active.some(
      (entry) => entry.id === "analytics-objection-preference"
    )
  );
  assert.ok(
    storageAccess.registry.absent.some((entry) => entry.id === "web-storage-apis")
  );
  assert.ok(
    storageAccess.registry.futureGuardrails.some(
      (entry) => entry.id === "consent-mechanism"
    )
  );
});

test("cookies route uses the structured legal components instead of the old placeholder", async () => {
  const source = await readFile(cookiesRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<PolicyContents/u);
  assert.match(source, /<AnalyticsPreferencePanel/u);
  assert.match(source, /<StorageAccessCard/u);
  assert.match(source, /model\.activeEntries/u);
  assert.match(source, /analyticsControlSection/u);
  assert.match(source, /model\.futureGuardrails/u);
  assert.doesNotMatch(source, /<LaunchPlaceholder/u);
  assert.doesNotMatch(source, /getLegalPlaceholderModel/u);
});
