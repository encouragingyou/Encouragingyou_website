import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import personalGrowth from "../src/content/programmes/personal-growth-life-skills.json" with { type: "json" };

const programmeDetailPath = new URL(
  "../src/pages/programmes/[slug].astro",
  import.meta.url
);
const programmeTemplatePath = new URL(
  "../src/components/sections/ProgrammeDetailTemplate.astro",
  import.meta.url
);

test("personal growth page content defines an enquiry-led delivery path without inventing a live timetable", () => {
  const page = programmePageContent.pages.find(
    (entry) => entry.pageId === "programme-personal-growth-life-skills"
  );
  const faqGroup = faqs.groups.find(
    (entry) => entry.id === "programme-personal-growth-life-skills"
  );

  assert.ok(page, "Expected page-specific Personal Growth content to exist.");
  assert.equal(
    page.hero.title,
    "Build confidence, resilience, and skills for everyday life."
  );
  assert.equal(page.experienceSection.items.length, 3);
  assert.equal(page.relatedSessionsSection.panels.length, 3);
  assert.equal(page.relatedSessionsSection.emptyState.primaryAction.label, "Get support");
  assert.equal(
    page.relatedSessionsSection.emptyState.secondaryAction.label,
    "See current sessions"
  );
  assert.ok(page.relatedSessionsSection.overviewNotice);
  assert.equal(page.faqSection.groupId, "programme-personal-growth-life-skills");
  assert.ok(page.evidenceNotice);
  assert.match(
    page.evidenceNotice.body,
    /mentor profiles, outcome claims, or workshop photography/u
  );

  assert.ok(faqGroup, "Expected a dedicated Personal Growth FAQ group.");
  assert.equal(faqGroup.items.length, 4);
  assert.match(
    faqGroup.items.map((item) => item.answer).join(" "),
    /not yet|confirmed on enquiry/u
  );
});

test("personal growth programme content keeps the route grounded in confidence-building and enquiry-led delivery", () => {
  assert.deepEqual(
    personalGrowth.bodySections.map((section) => section.id),
    ["what-this-route-can-cover", "how-support-can-feel", "how-the-next-step-works"]
  );
  assert.match(personalGrowth.summary, /practical life-skills/u);
  assert.match(personalGrowth.deliverySummary, /starts with an enquiry/u);
  assert.deepEqual(personalGrowth.trustSignalIds, [
    "youth-led",
    "privacy-clarity",
    "visible-safeguarding"
  ]);
});

test("programme family template supports the shared low-schedule empty state contract", async () => {
  const routeSource = await readFile(programmeDetailPath, "utf8");
  const templateSource = await readFile(programmeTemplatePath, "utf8");

  assert.match(routeSource, /relatedSessionsSection=\{model\.relatedSessionsSection\}/u);
  assert.match(templateSource, /relatedSessionsSection\.emptyState/u);
  assert.match(templateSource, /<EmptyState/u);
  assert.match(templateSource, /action=\{relatedSessionsSection\.notice\.action\}/u);
});
