import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import faqs from "../src/content/faqs/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import involvementRoutes from "../src/content/involvementRoutes/default.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };

const partnerRoutePath = new URL("../src/pages/partner/index.astro", import.meta.url);
const proofBoundaryPath = new URL(
  "../src/components/ui/ProofBoundaryPanel.astro",
  import.meta.url
);

test("partner route content defines audiences, collaboration modes, proof boundaries, and a partner-led enquiry surface", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "partner");
  const partnerFaq = faqs.groups.find((group) => group.id === "partner");
  const partnerSurface = formSurfaces.surfaces.find(
    (surface) => surface.id === "partner-enquiry"
  );
  const partnerPath = involvementRoutes.routes.find((route) => route.id === "partner");

  assert.ok(page, "Expected partner route content to exist.");
  assert.ok(partnerFaq, "Expected partner FAQ group to exist.");
  assert.ok(partnerSurface, "Expected partner form surface to exist.");
  assert.ok(partnerPath, "Expected partner involvement path to exist.");

  assert.equal(
    page.intro.title,
    "Start a partnership conversation that is clear, local, and proportionate."
  );
  assert.equal(page.audienceSection.items.length, 3);
  assert.equal(page.pathwaysSection.items.length, 3);
  assert.ok(page.supportSection);
  assert.ok(page.proofBoundary);
  assert.equal(page.processSection.steps.length, 3);
  assert.equal(page.faqSection.groupId, "partner");
  assert.equal(page.formSurfaceId, "partner-enquiry");
  assert.deepEqual(partnerSurface.allowedReasonIds, ["partner", "referral"]);
  assert.equal(partnerSurface.defaultReasonId, "partner");
  assert.equal(partnerSurface.submitLabel, "Send partnership enquiry");
  assert.match(partnerSurface.successMessage, /partnership enquiry is with the team/u);
  assert.equal(partnerFaq.items.length, 4);
  assert.equal(partnerPath.pathState, "route-ready");
});

test("partner route uses the shared involvement family and proof-boundary component instead of the old placeholder shell", async () => {
  const [routeSource, proofBoundarySource] = await Promise.all([
    readFile(partnerRoutePath, "utf8"),
    readFile(proofBoundaryPath, "utf8")
  ]);

  assert.match(routeSource, /structuredData=\{model\.structuredData\}/u);
  assert.match(routeSource, /<InvolvementRoleCard/u);
  assert.match(routeSource, /<InvolvementInfoSection/u);
  assert.match(routeSource, /<ProofBoundaryPanel/u);
  assert.match(routeSource, /id=\{model\.partnerFormId\}/u);
  assert.doesNotMatch(routeSource, /LaunchPlaceholder/u);
  assert.match(proofBoundarySource, /Safe to publish now/u);
  assert.match(proofBoundarySource, /Held back until verified/u);
});
