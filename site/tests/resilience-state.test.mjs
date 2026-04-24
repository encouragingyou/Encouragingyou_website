import test from "node:test";
import assert from "node:assert/strict";

import {
  getNotFoundModel,
  getContactPageModel,
  getEventsUpdatesIndexModel
} from "../src/lib/content/site-content.ts";
import {
  getResilienceStateContent,
  getResilienceSurfaceText
} from "../src/lib/content/resilience-state.js";

test("resilience taxonomy covers the shared product states required for launch", () => {
  const content = getResilienceStateContent();

  assert.deepEqual(
    content.taxonomy.map((state) => state.id),
    [
      "idle",
      "loading",
      "success",
      "validation-error",
      "submission-error",
      "empty-valid",
      "partial-content",
      "unavailable-enhancement",
      "missing-route",
      "archived-content",
      "system-fallback"
    ]
  );
});

test("404 model exposes broad recovery paths instead of a dead-end apology", () => {
  const model = getNotFoundModel();

  assert.equal(
    model.title,
    "That page is missing, but the main routes into support are still here."
  );
  assert.deepEqual(
    model.actions.map((action) => action.label),
    [
      "Go to the homepage",
      "Join a session",
      "Explore programmes",
      "Get involved",
      "Contact the team",
      "Read safeguarding"
    ]
  );
  assert.match(model.notice.body, /call 999/u);
});

test("contact and editorial routes consume shared resilience surfaces for partial and empty states", () => {
  const contactModel = getContactPageModel();
  const updatesModel = getEventsUpdatesIndexModel();

  assert.equal(contactModel.launchContactSurfaceId, "contact-launch-partial");
  assert.equal(contactModel.locationFallbackPanel?.stateId, "partial-content");
  assert.equal(
    contactModel.locationFallbackPanel?.title,
    "Public location detail stays intentionally limited."
  );
  assert.equal(updatesModel.emptyState.stateId, "empty-valid");
  assert.equal(updatesModel.filterEmptyState.stateId, "empty-valid");
});

test("support-form fallback copy is sourced from the shared resilience content", () => {
  assert.equal(
    getResilienceSurfaceText("form-validation-error"),
    "Check the highlighted fields before sending your message."
  );
  assert.equal(
    getResilienceSurfaceText("form-submission-error"),
    "Please try again or use the email link below so you are not left at a dead end."
  );
});
