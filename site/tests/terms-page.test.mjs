import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import legalPages from "../src/content/legalPages/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import sitePolicy from "../src/content/sitePolicy/default.json" with { type: "json" };

const termsRoutePath = new URL("../src/pages/terms/index.astro", import.meta.url);

test("terms and site policy page is grounded in the live feature set", () => {
  const pageDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "terms"
  );
  const legalPage = legalPages.pages.find((entry) => entry.id === "terms");
  const routePage = routePages.pages.find((entry) => entry.pageId === "terms");

  assert.ok(pageDefinition, "Expected terms page definition to exist.");
  assert.ok(legalPage, "Expected terms legal-page record to exist.");
  assert.ok(routePage, "Expected terms route metadata to exist.");

  assert.equal(pageDefinition.contentStatus, "seeded");
  assert.equal(legalPage.contentState, "seeded");
  assert.equal(sitePolicy.page.sections.length, 7);
  assert.ok(
    sitePolicy.page.sections.some((section) => section.id === "downloads"),
    "Expected a dedicated downloads section."
  );
  assert.ok(
    sitePolicy.page.sections.some((section) => section.id === "external-links"),
    "Expected an external-links section."
  );
  assert.match(
    routePage.metaDescription,
    /external links, downloads, and content ownership/u
  );
});

test("terms route uses the structured site policy template instead of the old placeholder", async () => {
  const source = await readFile(termsRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<PolicyContents/u);
  assert.match(source, /model\.sections\.map/u);
  assert.match(source, /model\.policyState/u);
  assert.doesNotMatch(source, /<LaunchPlaceholder/u);
  assert.doesNotMatch(source, /getLegalPlaceholderModel/u);
});
