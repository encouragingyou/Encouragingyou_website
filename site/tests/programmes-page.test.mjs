import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import routePages from "../src/content/routePages/default.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import careerSupport from "../src/content/programmes/career-support-cv-help.json" with { type: "json" };
import communityFriendship from "../src/content/programmes/community-friendship.json" with { type: "json" };
import communitySupport from "../src/content/programmes/community-support-intergenerational-connection.json" with { type: "json" };
import personalGrowth from "../src/content/programmes/personal-growth-life-skills.json" with { type: "json" };

const programmes = [communityFriendship, personalGrowth, careerSupport, communitySupport];
const programmesIndexPath = new URL(
  "../src/pages/programmes/index.astro",
  import.meta.url
);
const programmeDetailPath = new URL(
  "../src/pages/programmes/[slug].astro",
  import.meta.url
);

test("programme domain distinguishes live-linked, overview-only, and enquiry-led pillars", () => {
  assert.equal(programmes.length, 4);
  assert.deepEqual(
    programmes
      .filter((programme) => programme.existingDeliveryMode === "active-session-linked")
      .map((programme) => programme.slug)
      .sort(),
    ["career-support-cv-help", "community-friendship"]
  );
  assert.deepEqual(
    programmes
      .filter((programme) => programme.existingDeliveryMode === "launch-overview-only")
      .map((programme) => programme.slug),
    ["personal-growth-life-skills"]
  );
  assert.deepEqual(
    programmes
      .filter((programme) => programme.existingDeliveryMode === "growth-planned")
      .map((programme) => programme.slug),
    ["community-support-intergenerational-connection"]
  );

  for (const programme of programmes) {
    assert.ok(programme.audienceSummary);
    assert.ok(programme.deliverySummary);
    assert.ok(programme.audienceHighlights.length >= 2);
    assert.ok(programme.trustNotes.length >= 1);
  }
});

test("programmes route content keeps comparison, audience routing, and CTA surfaces explicit", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "programmes");

  assert.ok(page, "Expected programmes route content to exist.");
  assert.equal(page.intro.title, "Support that meets people where they are.");
  assert.equal(page.overviewPanels.length, 3);
  assert.equal(page.audienceSection.items.length, 4);
  assert.equal(page.ctaBand.actions.length, 3);
  assert.equal(
    programmePageContent.defaults.relatedSessionsSection.eyebrow,
    "Taking the next step"
  );
  assert.equal(
    programmePageContent.defaults.relatedSessionsSection.title,
    "Use the clearest route available right now."
  );
});

test("programme routes use the shared overview card and family template primitives", async () => {
  const [indexSource, detailSource] = await Promise.all([
    readFile(programmesIndexPath, "utf8"),
    readFile(programmeDetailPath, "utf8")
  ]);

  assert.match(indexSource, /structuredData=\{model\.structuredData\}/u);
  assert.match(indexSource, /<ProgrammePillarCard/u);
  assert.match(indexSource, /model\.liveSessions/u);
  assert.match(detailSource, /<ProgrammeDetailTemplate/u);
  assert.doesNotMatch(detailSource, /model\.sections\.map/u);
});
