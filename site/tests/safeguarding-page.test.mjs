import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import { getSafeguardingDetailPageModel } from "../src/lib/content/site-content.ts";

const safeguardingHubPath = new URL(
  "../src/pages/safeguarding/index.astro",
  import.meta.url
);
const safeguardingDetailTemplatePath = new URL(
  "../src/components/sections/SafeguardingDetailTemplate.astro",
  import.meta.url
);

test("safeguarding family content defines separate hub, child, and adult routes plus a dedicated concern surface", () => {
  const hubPage = routePages.pages.find((entry) => entry.pageId === "safeguarding");
  const childPage = routePages.pages.find(
    (entry) => entry.pageId === "safeguarding-child"
  );
  const adultPage = routePages.pages.find(
    (entry) => entry.pageId === "safeguarding-adult"
  );
  const childDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "safeguarding-child"
  );
  const adultDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "safeguarding-adult"
  );
  const safeguardingSurface = formSurfaces.surfaces.find(
    (surface) => surface.id === "safeguarding-concern"
  );

  assert.ok(hubPage, "Expected safeguarding hub content to exist.");
  assert.ok(childPage, "Expected child safeguarding content to exist.");
  assert.ok(adultPage, "Expected adult safeguarding content to exist.");
  assert.ok(childDefinition, "Expected child safeguarding page definition to exist.");
  assert.ok(adultDefinition, "Expected adult safeguarding page definition to exist.");
  assert.ok(safeguardingSurface, "Expected safeguarding concern surface to exist.");

  assert.equal(
    hubPage.intro.title,
    "Use the right safeguarding route quickly and clearly."
  );
  assert.equal(
    childPage.intro.title,
    "Raise child safeguarding concerns clearly and without delay."
  );
  assert.equal(
    adultPage.intro.title,
    "Raise adult safeguarding concerns clearly and without delay."
  );
  assert.deepEqual(safeguardingSurface.allowedReasonIds, ["safeguarding"]);
  assert.equal(safeguardingSurface.reasonFieldMode, "hidden");
  assert.equal(safeguardingSurface.showUpdatesOptIn, false);
});

test("safeguarding routes use the shared route family instead of the old summary-only page", async () => {
  const [hubSource, detailTemplateSource] = await Promise.all([
    readFile(safeguardingHubPath, "utf8"),
    readFile(safeguardingDetailTemplatePath, "utf8")
  ]);

  assert.match(hubSource, /<SafeguardingRouteCard/u);
  assert.match(hubSource, /id=\{model\.formId\}/u);
  assert.match(hubSource, /structuredData=\{model\.structuredData\}/u);
  assert.match(detailTemplateSource, /<SafeguardingEscalationGuide/u);
  assert.match(detailTemplateSource, /<ProofBoundaryPanel/u);
  assert.match(detailTemplateSource, /reasonFieldMode=\{model\.reasonFieldMode\}/u);
  assert.doesNotMatch(hubSource, /concern route by email/u);
});

test("safeguarding detail models keep the privacy action label and form-state copy intact", () => {
  const childModel = getSafeguardingDetailPageModel("child");

  assert.equal(childModel.privacyNoticeActionLabel, "Read the Privacy Notice");
  assert.equal(childModel.noScriptNote.length > 0, true);
  assert.equal(
    childModel.invalidStatusMessage,
    "Check the highlighted fields before sending your message."
  );
  assert.equal(childModel.submittingStatusMessage, "Sending your message...");
});
