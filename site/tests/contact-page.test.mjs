import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import contactInfo from "../src/content/contactInfo/default.json" with { type: "json" };
import faqs from "../src/content/faqs/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };

const contactRoutePath = new URL("../src/pages/contact/index.astro", import.meta.url);

test("contact route content defines real decision paths, contact methods, and location handling", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "contact");
  const faqGroup = faqs.groups.find((group) => group.id === "contact");
  const supportForm = formSurfaces.surfaces.find(
    (surface) => surface.id === "support-general"
  );
  const pageDefinition = pageDefinitions.launchPages.find(
    (entry) => entry.id === "contact"
  );

  assert.ok(page, "Expected contact route content to exist.");
  assert.ok(faqGroup, "Expected contact FAQ group to exist.");
  assert.ok(supportForm, "Expected support-general form surface to exist.");
  assert.ok(pageDefinition, "Expected contact page definition to exist.");

  assert.equal(page.intro.title, "We're here to help you find the right next step.");
  assert.deepEqual(
    page.routeCards.map((card) => card.routeId),
    ["join-session", "referral", "volunteer", "partner"]
  );
  assert.equal(page.contactMethodsSection.cards.length, 4);
  assert.equal(page.locationSection.cards.length, 3);
  assert.equal(page.faqSection.groupId, "contact");
  assert.equal(faqGroup.items.length, 4);
  assert.match(
    supportForm.intro,
    /general question, a support request, or a first contact/u
  );
  assert.equal(supportForm.reasonFieldLabel, "This message is about");
  assert.match(supportForm.successMessage, /message is with the team/u);
  assert.equal(pageDefinition.contentStatus, "seeded");
  assert.equal(contactInfo.locationGuidance.generalLocalityLabel, "Rochdale");
  assert.equal(contactInfo.locationGuidance.publicDirectionsUrl, null);
  assert.equal(contactInfo.mapEmbedAllowedAtLaunch, false);
});

test("contact route uses the structured contact family instead of the old FAQ-only stub", async () => {
  const source = await readFile(contactRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<PageIntro/u);
  assert.match(source, /<InvolvementPathwayCard/u);
  assert.match(source, /<ContactMethodCard/u);
  assert.match(source, /id="contact-form"/u);
  assert.match(
    source,
    /data-contact-form-transport=\{model\.contactState\.formTransport\}/u
  );
  assert.doesNotMatch(source, /support-layout/u);
  assert.doesNotMatch(source, /LaunchPlaceholder/u);
});
