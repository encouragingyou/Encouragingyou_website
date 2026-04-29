import test from "node:test";
import assert from "node:assert/strict";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import careerSupport from "../src/content/programmes/career-support-cv-help.json" with { type: "json" };
import cvSupport from "../src/content/sessions/cv-support.json" with { type: "json" };

test("career support page content keeps the programme story broader than the live CV session while preserving the handoff", () => {
  const page = programmePageContent.pages.find(
    (entry) => entry.pageId === "programme-career-support-cv-help"
  );
  const faqGroup = faqs.groups.find(
    (entry) => entry.id === "programme-career-support-cv-help"
  );

  assert.ok(page, "Expected page-specific Career Support content to exist.");
  assert.equal(
    page.hero.title,
    "Get help with CVs, applications, interviews, and next steps."
  );
  assert.match(page.hero.summary, /unfinished application, interview questions/u);
  assert.equal(page.hero.primaryAction.label, "See CV support");
  assert.equal(page.hero.secondaryAction.label, "Contact the team");
  assert.equal(page.experienceSection.items.length, 3);
  assert.equal(page.relatedSessionsSection.panels.length, 3);
  assert.equal(page.relatedSessionsSection.activeNotice.action.label, "See CV support");
  assert.equal(
    page.relatedSessionsSection.fallbackNotice.action.label,
    "Contact the team"
  );
  assert.equal(page.faqSection.groupId, "programme-career-support-cv-help");
  assert.equal(page.ctaBand.actions.length, 3);
  assert.ok(page.evidenceNotice);
  assert.match(
    page.evidenceNotice.body,
    /interview preparation, work or college next steps/u
  );

  assert.ok(faqGroup, "Expected a dedicated Career Support FAQ group.");
  assert.equal(faqGroup.items.length, 4);
  assert.match(
    faqGroup.items.map((item) => item.answer).join(" "),
    /Saturday CV support/u
  );
});

test("career support programme content keeps programme-level guidance separate from session-level logistics", () => {
  assert.deepEqual(
    careerSupport.bodySections.map((section) => section.id),
    ["what-this-route-covers", "how-support-should-feel", "how-the-live-route-works"]
  );
  assert.match(careerSupport.summary, /CVs, applications, interviews/u);
  assert.match(
    careerSupport.deliverySummary,
    /session page owns exact timing, calendar access, what to bring, and ask-before-attending detail/u
  );
  assert.deepEqual(careerSupport.relatedSessionIds, [cvSupport.slug]);
  assert.deepEqual(careerSupport.trustSignalIds, [
    "youth-led",
    "privacy-clarity",
    "visible-safeguarding"
  ]);
  assert.match(
    careerSupport.trustNotes.join(" "),
    /Rochdale can stay public while exact venue detail is shared on enquiry/u
  );
  assert.match(careerSupport.outcomeBullets.join(" "), /applications, interviews/u);
});
