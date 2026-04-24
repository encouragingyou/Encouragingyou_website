import test from "node:test";
import assert from "node:assert/strict";

import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };

test("events updates route content keeps the page distinct from live sessions while staying useful at low volume", () => {
  const page = routePages.pages.find((entry) => entry.pageId === "events-updates");

  assert.ok(page, "Expected events-updates route content to exist.");
  assert.equal(
    page.intro.title,
    "A calm place for public dates, updates, and current opportunities."
  );
  assert.equal(page.overviewPanels.length, 3);
  assert.equal(page.notice.title, "Publishing rhythm");
  assert.equal(page.ctaBand.actions.length, 3);
  assert.equal(page.emptyState.primaryAction.label, "Join a session");
});

test("events updates feed seeds a featured event notice plus practical update and opportunity items without inventing dated news", () => {
  assert.equal(updatesFeed.items.length, 3);
  assert.equal(updatesFeed.categories.length, 3);
  assert.equal(updatesFeed.items.filter((item) => item.featured).length, 1);
  assert.equal(updatesFeed.items.find((item) => item.featured).updateType, "event");
  assert.equal(updatesFeed.items.find((item) => item.featured).showOnHome, false);
  assert.equal(
    updatesFeed.items.find((item) => item.id === "community-events-watch").eventLifecycle,
    "date-to-be-confirmed"
  );
  assert.equal(
    updatesFeed.items.find((item) => item.id === "live-support-routes").updateType,
    "update"
  );
  assert.equal(
    updatesFeed.items.find((item) => item.id === "live-support-routes").updateLifecycle,
    "current"
  );
  assert.equal(
    updatesFeed.items.find((item) => item.id === "get-involved-open").updateType,
    "opportunity"
  );
  assert.ok(updatesFeed.items.every((item) => typeof item.slug === "string"));
  assert.ok(updatesFeed.items.every((item) => item.detail.sections.length >= 1));
  assert.equal(
    updatesFeed.items.filter((item) => item.mediaId === "volunteer-partner-cta").length,
    1
  );
  assert.equal(
    updatesFeed.items.find((item) => item.id === "get-involved-open").detail.intro.title,
    "Volunteer, partner, or refer someone through one clear route"
  );
});

test("events updates page is now seeded rather than outline-only in the canonical page inventory", () => {
  const page = pageDefinitions.launchPages.find((entry) => entry.id === "events-updates");

  assert.ok(page, "Expected events-updates page definition to exist.");
  assert.equal(page.contentStatus, "seeded");
});
