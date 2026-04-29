import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import communitySupport from "../src/content/programmes/community-support-intergenerational-connection.json" with { type: "json" };

const programmeDetailPath = new URL(
  "../src/pages/programmes/[slug].astro",
  import.meta.url
);
const programmeTemplatePath = new URL(
  "../src/components/sections/ProgrammeDetailTemplate.astro",
  import.meta.url
);

test("community support page content defines the cross-age promise, audience routing, and contact-led state truth", () => {
  const page = programmePageContent.pages.find(
    (entry) => entry.pageId === "programme-community-support-intergenerational-connection"
  );
  const faqGroup = faqs.groups.find(
    (entry) => entry.id === "programme-community-support-intergenerational-connection"
  );

  assert.ok(page, "Expected page-specific Community Support content to exist.");
  assert.equal(
    page.hero.title,
    "Bringing people together across generations through support and connection."
  );
  assert.equal(page.hero.primaryAction.label, "Contact the team");
  assert.equal(page.hero.secondaryAction.label, "See current sessions");
  assert.equal(page.experienceSection.items.length, 3);
  assert.equal(page.audienceRoutesSection.items.length, 4);
  assert.equal(page.relatedSessionsSection.panels.length, 3);
  assert.equal(
    page.relatedSessionsSection.enquiryNotice.action.label,
    "Contact the team"
  );
  assert.equal(
    page.relatedSessionsSection.emptyState.primaryAction.label,
    "Contact the team"
  );
  assert.equal(
    page.relatedSessionsSection.emptyState.secondaryAction.label,
    "See current sessions"
  );
  assert.equal(
    page.faqSection.groupId,
    "programme-community-support-intergenerational-connection"
  );
  assert.equal(page.ctaBand.actions.length, 3);
  assert.equal(page.ctaBand.note.action.label, "See safeguarding");
  assert.ok(page.evidenceNotice);
  assert.match(
    page.evidenceNotice.body,
    /Regulated care claims, transport or home-visit promises/u
  );

  assert.ok(faqGroup, "Expected a dedicated Community Support FAQ group.");
  assert.equal(faqGroup.items.length, 4);
  assert.match(
    faqGroup.items.map((item) => item.answer).join(" "),
    /Not always|does not currently support claims about regulated care/u
  );
});

test("community support programme content keeps the wider welcome honest without implying care services", () => {
  assert.deepEqual(
    communitySupport.bodySections.map((section) => section.id),
    ["what-this-route-covers", "who-this-route-is-for", "how-access-works-now"]
  );
  assert.match(communitySupport.summary, /Contact-led community support/u);
  assert.match(
    communitySupport.deliverySummary,
    /short enquiry rather than a standing community-events timetable/u
  );
  assert.deepEqual(communitySupport.trustSignalIds, [
    "youth-led",
    "privacy-clarity",
    "visible-safeguarding"
  ]);
  assert.match(
    communitySupport.trustNotes.join(" "),
    /must not imply regulated care, home support, or specialist services/u
  );
  assert.match(communitySupport.bodySections[2].body.join(" "), /public venue/u);
});

test("programme family template supports the shared audience-routing section for broader multi-audience offers", async () => {
  const [routeSource, templateSource] = await Promise.all([
    readFile(programmeDetailPath, "utf8"),
    readFile(programmeTemplatePath, "utf8")
  ]);

  assert.match(routeSource, /audienceRoutesSection=\{model\.audienceRoutesSection\}/u);
  assert.match(templateSource, /audienceRoutesSection \? \(/u);
  assert.match(templateSource, /actions=\{\[item\.action\]\}/u);
});
