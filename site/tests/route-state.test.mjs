import test from "node:test";
import assert from "node:assert/strict";

import { isActivePath, normalizePathname } from "../src/lib/state/route-state.js";

test("normalizePathname removes duplicate trailing separators and query noise", () => {
  assert.equal(
    normalizePathname("sessions/cv-support/?from=home"),
    "/sessions/cv-support"
  );
  assert.equal(normalizePathname("/"), "/");
  assert.equal(normalizePathname("/sessions//"), "/sessions");
});

test("isActivePath matches section routes as active for nested pages", () => {
  assert.equal(isActivePath("/sessions/cv-support/", "/sessions/"), true);
  assert.equal(isActivePath("/get-involved/", "/sessions/"), false);
  assert.equal(isActivePath("/", "/"), true);
});
