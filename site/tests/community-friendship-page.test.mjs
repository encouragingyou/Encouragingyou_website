import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import communityFriendship from "../src/content/programmes/community-friendship.json" with { type: "json" };

const programmeDetailPath = new URL(
  "../src/pages/programmes/[slug].astro",
  import.meta.url
);

test("community and friendship page content defines the route-specific promise, reassurance, and live-link contract", () => {
  const page = programmePageContent.pages.find(
    (entry) => entry.pageId === "programme-community-friendship"
  );
  const faqGroup = faqs.groups.find(
    (entry) => entry.id === "programme-community-friendship"
  );

  assert.ok(page, "Expected page-specific Community & Friendship content to exist.");
  assert.equal(
    page.hero.title,
    "Speak to people, join in at your pace, and feel comfortable coming back."
  );
  assert.match(page.hero.summary, /games, conversation, low-pressure friendship/u);
  assert.equal(page.experienceSection.items.length, 3);
  assert.equal(page.relatedSessionsSection.panels.length, 2);
  assert.ok(page.relatedSessionsSection.activeNotice);
  assert.ok(page.relatedSessionsSection.fallbackNotice);
  assert.equal(page.faqSection.groupId, "programme-community-friendship");
  assert.ok(page.evidenceNotice);
  assert.ok(
    page.evidenceNotice.body.includes("Named participant stories"),
    "Expected the proof boundary to keep named stories out until approved."
  );

  assert.ok(faqGroup, "Expected a dedicated Community & Friendship FAQ group.");
  assert.equal(faqGroup.items.length, 4);
  assert.match(faqGroup.items.map((item) => item.answer).join(" "), /shared on enquiry/u);
});

test("community and friendship programme content keeps the programme story distinct from the session logistics", () => {
  assert.deepEqual(
    communityFriendship.bodySections.map((section) => section.id),
    [
      "what-this-programme-is",
      "what-participation-can-feel-like",
      "how-the-live-route-works"
    ]
  );
  assert.match(communityFriendship.summary, /speaking to people/u);
  assert.match(communityFriendship.summary, /feeling comfortable coming back/u);
  assert.match(communityFriendship.deliverySummary, /session page handles exact timing/u);
  assert.match(
    communityFriendship.trustNotes.join(" "),
    /venue details are shared on enquiry/u
  );
  assert.match(
    communityFriendship.outcomeBullets.join(" "),
    /joining in at your own pace/u
  );
});

test("programme detail route passes community-specific structured surfaces through the shared family template", async () => {
  const source = await readFile(programmeDetailPath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /experienceSection=\{model\.experienceSection\}/u);
  assert.match(source, /faqSection=\{model\.faqSection\}/u);
  assert.match(source, /faqGroupId=\{model\.faqGroupId\}/u);
  assert.match(source, /evidenceNotice=\{model\.evidenceNotice\}/u);
});
