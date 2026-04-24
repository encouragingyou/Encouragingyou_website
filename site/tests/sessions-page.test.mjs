import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import routePages from "../src/content/routePages/default.json" with { type: "json" };
import cvSupport from "../src/content/sessions/cv-support.json" with { type: "json" };
import youthClub from "../src/content/sessions/youth-club.json" with { type: "json" };

const sessionsIndexPath = new URL("../src/pages/sessions/index.astro", import.meta.url);
const sessionHubCardPath = new URL(
  "../src/components/ui/SessionHubCard.astro",
  import.meta.url
);

test("sessions route content defines live comparison, reassurance, and escalation surfaces", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "sessions");

  assert.ok(page, "Expected sessions route content to exist.");
  assert.equal(
    page.intro.title,
    "Recurring offers that are easy to understand and easy to return to."
  );
  assert.equal(page.actions.primaryLabel, "Get support");
  assert.equal(page.actions.secondaryLabel, "See programmes");
  assert.equal(
    page.scheduleSection.title,
    "Choose the Saturday route that fits best right now."
  );
  assert.equal(
    page.guidanceSection.title,
    "Practical detail and reassurance should stay public."
  );
  assert.equal(page.guidancePanels.length, 3);
  assert.equal(page.faqSection.groupId, "join-session");
  assert.equal(page.ctaBand.actions.length, 3);
  assert.equal(page.ctaBand.note.action.label, "Ask a question");
});

test("session domain keeps each live route attached to a wider programme instead of collapsing the hierarchy", () => {
  assert.deepEqual(cvSupport.programmeIds, ["career-support-cv-help"]);
  assert.deepEqual(youthClub.programmeIds, ["community-friendship"]);
  assert.equal(cvSupport.calendar.status, "available");
  assert.equal(youthClub.calendar.status, "available");
  assert.equal(cvSupport.location.disclosurePolicy, "shared-on-enquiry");
  assert.equal(youthClub.location.disclosurePolicy, "shared-on-enquiry");
});

test("sessions route uses the live-rail and dedicated hub-card components rather than the old summary-card listing", async () => {
  const [routeSource, cardSource] = await Promise.all([
    readFile(sessionsIndexPath, "utf8"),
    readFile(sessionHubCardPath, "utf8")
  ]);

  assert.match(routeSource, /structuredData=\{model\.structuredData\}/u);
  assert.match(routeSource, /<SessionsLiveRail/u);
  assert.match(routeSource, /<SessionHubCard/u);
  assert.match(routeSource, /model\.ctaBand/u);
  assert.doesNotMatch(routeSource, /<SessionSummaryCard/u);
  assert.match(cardSource, /Inside \{programmeTitle\}/u);
  assert.match(cardSource, /calendarAction/u);
});
