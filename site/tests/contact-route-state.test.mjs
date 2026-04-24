import test from "node:test";
import assert from "node:assert/strict";

import contactInfo from "../src/content/contactInfo/default.json" with { type: "json" };
import siteSettings from "../src/content/siteSettings/default.json" with { type: "json" };
import { deriveContactRouteState } from "../src/lib/domain/contact-route-state.js";

test("contact route state keeps launch contact and location truth explicit", () => {
  const state = deriveContactRouteState(contactInfo, siteSettings);

  assert.equal(state.email.state, "available");
  assert.equal(state.email.href, "mailto:admin@encouragingyou.co.uk");
  assert.equal(state.phone.state, "withheld");
  assert.equal(state.phone.href, null);
  assert.equal(state.social.state, "available");
  assert.equal(state.social.value, "@encouragingyou1");
  assert.equal(state.location.localityLabel, "Rochdale");
  assert.equal(state.location.venueState, "shared-on-enquiry");
  assert.equal(state.location.mapState, "withheld");
  assert.equal(state.location.publicDirectionsUrl, null);
});
