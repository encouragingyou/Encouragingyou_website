import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import involvementRoutes from "../src/content/involvementRoutes/default.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };

const getInvolvedRoutePath = new URL(
  "../src/pages/get-involved/index.astro",
  import.meta.url
);

test("get involved route content defines five distinct pathways plus a spotlight and final CTA band", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "get-involved");
  const involvementForm = formSurfaces.surfaces.find(
    (surface) => surface.id === "involvement-general"
  );

  assert.ok(page, "Expected get-involved route content to exist.");
  assert.equal(page.intro.title, "Get involved in a way that works for you.");
  assert.deepEqual(
    page.routeCards.map((card) => card.routeId),
    ["join-session", "volunteer", "partner", "referral", "supporter"]
  );
  assert.equal(page.processSection.steps.length, 3);
  assert.ok(page.spotlightSection);
  assert.equal(page.ctaBand.actions.length, 3);
  assert.match(
    involvementForm.intro,
    /join, volunteer, partner, refer someone, or support the work in another practical way/u
  );
  assert.match(involvementForm.successMessage, /involvement route that fits best/u);
});

test("involvement route content distinguishes live, route-ready, contact-led, and opportunity-led states", () => {
  const pathStates = Object.fromEntries(
    involvementRoutes.routes.map((route) => [route.id, route.pathState])
  );

  assert.equal(pathStates["join-session"], "live-route");
  assert.equal(pathStates.volunteer, "route-ready");
  assert.equal(pathStates.partner, "route-ready");
  assert.equal(pathStates.referral, "contact-led");
  assert.equal(pathStates.supporter, "opportunity-route");
});

test("get involved route uses the shared involvement-family components and structured data", async () => {
  const source = await readFile(getInvolvedRoutePath, "utf8");

  assert.match(source, /structuredData=\{model\.structuredData\}/u);
  assert.match(source, /<InvolvementPathwayCard/u);
  assert.match(source, /model\.featuredPathway/u);
  assert.match(source, /<InvolvementProcessList/u);
  assert.match(source, /<InvolvementOpportunitySurface/u);
  assert.match(source, /<CtaBand/u);
});
