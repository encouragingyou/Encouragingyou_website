import test from "node:test";
import assert from "node:assert/strict";

import { deriveSessionHubState } from "../src/lib/domain/session-hub-state.js";

test("session hub state marks the route available when all sessions are live and calendar-ready", () => {
  const state = deriveSessionHubState([
    { state: "scheduled", calendarState: "available" },
    { state: "scheduled", calendarState: "available" }
  ]);

  assert.equal(state.availability, "available");
  assert.equal(state.calendarAvailability, "available");
  assert.equal(state.liveCount, 2);
});

test("session hub state marks the route mixed when one session is live and another is paused", () => {
  const state = deriveSessionHubState([
    { state: "scheduled", calendarState: "available" },
    { state: "paused", calendarState: "unavailable" }
  ]);

  assert.equal(state.availability, "mixed");
  assert.equal(state.calendarAvailability, "partial");
  assert.equal(state.liveCount, 1);
});

test("session hub state keeps the route available when sessions are live but calendar files are missing", () => {
  const state = deriveSessionHubState([
    { state: "scheduled", calendarState: "unavailable" },
    { state: "scheduled", calendarState: "unavailable" }
  ]);

  assert.equal(state.availability, "available");
  assert.equal(state.calendarAvailability, "unavailable");
  assert.equal(state.calendarCount, 0);
});

test("session hub state marks the route unavailable when no public session dates are live", () => {
  const state = deriveSessionHubState([
    { state: "paused", calendarState: "unavailable" },
    { state: "contact-only", calendarState: "unavailable" }
  ]);

  assert.equal(state.availability, "unavailable");
  assert.equal(state.calendarAvailability, "unavailable");
  assert.equal(state.liveCount, 0);
});
