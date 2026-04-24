import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };

const volunteerRoutePath = new URL("../src/pages/volunteer/index.astro", import.meta.url);
const roleCardPath = new URL(
  "../src/components/ui/InvolvementRoleCard.astro",
  import.meta.url
);
const infoSectionPath = new URL(
  "../src/components/sections/InvolvementInfoSection.astro",
  import.meta.url
);

test("volunteer route content defines role pathways, screening guidance, and a volunteer-only enquiry surface", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "volunteer");
  const volunteerFaq = faqs.groups.find((group) => group.id === "volunteer");
  const volunteerSurface = formSurfaces.surfaces.find(
    (surface) => surface.id === "volunteer-enquiry"
  );

  assert.ok(page, "Expected volunteer route content to exist.");
  assert.ok(volunteerFaq, "Expected volunteer FAQ group to exist.");
  assert.ok(volunteerSurface, "Expected volunteer form surface to exist.");

  assert.equal(
    page.intro.title,
    "Volunteer in a way that feels clear, supported, and fair."
  );
  assert.equal(page.pathwaysSection.items.length, 3);
  assert.ok(page.supportSection);
  assert.ok(page.screeningSection);
  assert.ok(page.timeCommitmentSection);
  assert.equal(page.processSection.steps.length, 3);
  assert.equal(page.faqSection.groupId, "volunteer");
  assert.equal(page.formSurfaceId, "volunteer-enquiry");
  assert.deepEqual(volunteerSurface.allowedReasonIds, ["volunteer"]);
  assert.equal(volunteerSurface.defaultReasonId, "volunteer");
  assert.equal(
    volunteerSurface.messageHelper,
    "Let us know how you'd like to help and how much time you can offer."
  );
  assert.match(volunteerSurface.successMessage, /volunteer enquiry is with the team/u);
  assert.equal(volunteerFaq.items.length, 4);
});

test("volunteer route uses the dedicated involvement-family sections instead of the old placeholder shell", async () => {
  const [routeSource, roleCardSource, infoSectionSource] = await Promise.all([
    readFile(volunteerRoutePath, "utf8"),
    readFile(roleCardPath, "utf8"),
    readFile(infoSectionPath, "utf8")
  ]);

  assert.match(routeSource, /structuredData=\{model\.structuredData\}/u);
  assert.match(routeSource, /<InvolvementRoleCard/u);
  assert.match(routeSource, /<InvolvementInfoSection/u);
  assert.match(routeSource, /id=\{model\.volunteerFormId\}/u);
  assert.match(routeSource, /model\.pathwaysSection/u);
  assert.doesNotMatch(routeSource, /LaunchPlaceholder/u);
  assert.match(roleCardSource, /involvement-role-card__title/u);
  assert.match(infoSectionSource, /layout-grid layout-grid--cards/u);
});
