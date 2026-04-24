import test from "node:test";
import assert from "node:assert/strict";

import involvementRoutes from "../src/content/involvementRoutes/default.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };
import { buildEditorialFeedModel } from "../src/lib/domain/editorial-feed.js";
import {
  deriveInvolvementPathwayState,
  selectInvolvementOpportunitySpotlight
} from "../src/lib/domain/involvement-hub-state.js";

const joinSessionRoute = involvementRoutes.routes.find(
  (route) => route.id === "join-session"
);
const supporterRoute = involvementRoutes.routes.find((route) => route.id === "supporter");

test("join-session pathway reflects live and limited session availability honestly", () => {
  const liveState = deriveInvolvementPathwayState(joinSessionRoute, {
    sessionAvailability: "available",
    liveCount: 2
  });
  const limitedState = deriveInvolvementPathwayState(joinSessionRoute, {
    sessionAvailability: "unavailable",
    liveCount: 0
  });

  assert.equal(liveState.statusLabel, "2 live Saturday sessions");
  assert.equal(liveState.tone, "success");
  assert.match(liveState.supportingText, /Sessions is the clearest immediate route/u);
  assert.equal(limitedState.statusLabel, "Dates confirmed directly");
  assert.equal(limitedState.tone, "accent");
});

test("supporter pathway stays useful whether or not a public opportunity is live", () => {
  const quietState = deriveInvolvementPathwayState(supporterRoute, {
    opportunityItem: null
  });
  const liveOpportunityState = deriveInvolvementPathwayState(supporterRoute, {
    opportunityItem: { id: "published-opportunity" }
  });

  assert.equal(quietState.statusLabel, "No separate public opportunity is live");
  assert.equal(quietState.tone, "soft");
  assert.equal(liveOpportunityState.statusLabel, "A current public opportunity is live");
  assert.equal(liveOpportunityState.tone, "accent");
});

test("hub spotlight selects the current published opportunity from the editorial feed", () => {
  const editorialFeed = buildEditorialFeedModel(updatesFeed);
  const opportunityItem = selectInvolvementOpportunitySpotlight(
    editorialFeed.publicItems.filter((item) => item.updateType === "opportunity")
  );

  assert.ok(opportunityItem, "Expected a public opportunity item.");
  assert.equal(opportunityItem.id, "get-involved-open");
  assert.equal(opportunityItem.routeId, "get-involved");
});
