import test from "node:test";
import assert from "node:assert/strict";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import sessionPageContent from "../src/content/sessionPageContent/default.json" with { type: "json" };
import youthClub from "../src/content/sessions/youth-club.json" with { type: "json" };

test("youth club session page content keeps first-visit belonging and the wider programme bridge explicit", () => {
  const page = sessionPageContent.pages.find(
    (entry) => entry.pageId === "session-youth-club"
  );

  assert.ok(page, "Expected page-specific youth club content to exist.");
  assert.equal(
    page.intro.title,
    "Youth club with games, conversation, and space to join in at your pace."
  );
  assert.equal(
    page.intro.supportingNote,
    "Come as you are. If a first visit feels like a big step, a young person or parent/carer can ask first."
  );
  assert.match(page.atAGlanceSection.summary, /18:45 for 120 minutes/u);
  assert.equal(
    page.atAGlanceSection.title,
    "Make the first visit feel welcoming before anyone travels."
  );
  assert.equal(
    page.expectationSection.title,
    "A first visit should feel welcoming, social, and easy to grow into."
  );
  assert.equal(
    page.supportSection.title,
    "Belonging should feel possible before the first visit."
  );
  assert.equal(page.expectationSection.items.length, 3);
  assert.equal(page.supportSection.items.length, 3);
  assert.equal(page.supportSection.note.action.label, "Contact the team");
  assert.equal(page.relatedProgrammeSection.actionLabel, "See wider route");
  assert.match(
    page.relatedProgrammeSection.summary,
    /speaking to people, joining in at your pace, and feeling comfortable coming back/u
  );
  assert.equal(page.fallbackNotice.action.label, "Contact the team");
  assert.deepEqual(
    page.ctaBand.actions.map((action) => action.label),
    ["Contact the team", "See wider community route", "See all sessions"]
  );
});

test("youth club uses a dedicated FAQ group instead of the generic joining-session answers", () => {
  const faqGroup = faqs.groups.find((group) => group.id === "session-youth-club");
  const genericGroup = faqs.groups.find((group) => group.id === "join-session");

  assert.ok(faqGroup, "Expected a dedicated youth club FAQ group to exist.");
  assert.deepEqual(faqGroup.pageContexts, ["session-youth-club"]);
  assert.equal(faqGroup.items.length, 4);
  assert.equal(faqGroup.items[0].question, "Do I need to know anyone before I come?");
  assert.match(
    faqGroup.items[1].answer,
    /games, activities, conversation, and chill time/u
  );
  assert.ok(genericGroup, "Expected the generic join-session FAQ group to exist.");
  assert.doesNotMatch(genericGroup.pageContexts.join(" "), /session-youth-club/u);
});

test("youth club canonical session data stays belonging-led without inventing operational specifics", () => {
  assert.match(
    youthClub.summary,
    /meet people, join in at your pace, and feel comfortable coming back/u
  );
  assert.equal(youthClub.faqGroupIds[0], "session-youth-club");
  assert.deepEqual(youthClub.programmeIds, ["community-friendship"]);
  assert.match(youthClub.featureBullets.join(" "), /A quieter first visit is okay/u);
  assert.equal(youthClub.schedule.startTime, "18:45");
  assert.equal(youthClub.schedule.durationMinutes, 120);
  assert.match(
    youthClub.trustNotes.join(" "),
    /Exact venue detail is shared on enquiry/u
  );
});
