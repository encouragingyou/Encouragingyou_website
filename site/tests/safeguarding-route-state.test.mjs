import test from "node:test";
import assert from "node:assert/strict";

import safeguardingInfo from "../src/content/safeguardingInfo/default.json" with { type: "json" };
import {
  deriveSafeguardingRouteState,
  getSafeguardingBranchState
} from "../src/lib/domain/safeguarding-route-state.js";

test("deriveSafeguardingRouteState exposes the launch safeguarding surface and current trust states", () => {
  const state = deriveSafeguardingRouteState(safeguardingInfo);

  assert.equal(state.immediateDanger.statusLabel, "Call 999 first");
  assert.equal(state.publicConcernRoute.namedLeadState, "withheld");
  assert.equal(state.secureConcernForm.state, "available");
  assert.equal(state.secureConcernForm.surfaceId, "safeguarding-concern");
  assert.equal(state.policyDocument.state, "awaiting-publication");
  assert.match(state.publicConcernRoute.mailtoHref, /subject=Safeguarding%20concern/u);
  assert.equal(state.routes.length, 2);
});

test("getSafeguardingBranchState keeps child and adult routes separate but linked", () => {
  const child = getSafeguardingBranchState(safeguardingInfo, "child");
  const adult = getSafeguardingBranchState(safeguardingInfo, "adult");

  assert.equal(child.pageId, "safeguarding-child");
  assert.equal(child.alternatePageId, "safeguarding-adult");
  assert.match(child.branch.steps.map((step) => step.title).join(" "), /999/u);

  assert.equal(adult.pageId, "safeguarding-adult");
  assert.equal(adult.alternatePageId, "safeguarding-child");
  assert.match(
    adult.branch.limitations.join(" "),
    /response times|statutory adult-safeguarding action/u
  );
});
