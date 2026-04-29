import test from "node:test";
import assert from "node:assert/strict";

import sessionPageContent from "../src/content/sessionPageContent/default.json" with { type: "json" };
import cvSupport from "../src/content/sessions/cv-support.json" with { type: "json" };

test("cv support session page content keeps operational detail on the live route while preserving the wider programme handoff", () => {
  const page = sessionPageContent.pages.find(
    (entry) => entry.pageId === "session-cv-support"
  );

  assert.ok(page, "Expected page-specific CV support content to exist.");
  assert.equal(
    page.intro.title,
    "CV support for drafts, applications, interviews, and next steps."
  );
  assert.equal(page.atAGlanceSection.timingLabel, "When it runs");
  assert.match(page.atAGlanceSection.summary, /16:45 for 120 minutes/u);
  assert.equal(page.expectationSection.items.length, 3);
  assert.equal(page.supportSection.items.length, 3);
  assert.equal(page.supportSection.note.action.label, "Contact the team");
  assert.equal(page.relatedProgrammeSection.actionLabel, "See wider route");
  assert.equal(page.fallbackNotice.action.label, "Contact the team");
  assert.deepEqual(
    page.ctaBand.actions.map((action) => action.label),
    ["Contact the team", "See wider career support", "See all sessions"]
  );
  assert.match(
    page.relatedProgrammeSection.summary,
    /every-Saturday 16:45 timing, 120-minute duration/u
  );
});

test("session detail content seeds both live sessions into the shared family contract", () => {
  assert.equal(sessionPageContent.pages.length, 2);

  for (const page of sessionPageContent.pages) {
    assert.ok(page.atAGlanceSection.title);
    assert.ok(page.expectationSection.items.length >= 2);
    assert.ok(page.supportSection.items.length >= 2);
    assert.ok(page.ctaBand.actions.length >= 2);
  }
});

test("cv support canonical session data stays session-specific and does not collapse back into the broader programme promise", () => {
  assert.match(cvSupport.summary, /One-to-one help with CVs, applications, interviews/u);
  assert.match(cvSupport.eventDescription, /interviews/u);
  assert.match(cvSupport.featureBullets.join(" "), /interview question, blank document/u);
  assert.match(cvSupport.trustNotes.join(" "), /Safeguarding and privacy routes/u);
  assert.equal(cvSupport.schedule.startTime, "16:45");
  assert.equal(cvSupport.schedule.durationMinutes, 120);
  assert.deepEqual(cvSupport.programmeIds, ["career-support-cv-help"]);
});
