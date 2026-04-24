import test from "node:test";
import assert from "node:assert/strict";

import consentAwareMicrocopy from "../src/content/consentAwareMicrocopy/default.json" with { type: "json" };
import contactInfo from "../src/content/contactInfo/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import storageAccess from "../src/content/storageAccess/default.json" with { type: "json" };

test("consent-aware microcopy stays aligned with the live cookie-notice and form-surface state", () => {
  const updatesEnabledSurfaceIds = formSurfaces.surfaces
    .filter((surface) => surface.showUpdatesOptIn !== false)
    .map((surface) => surface.id)
    .sort();

  assert.equal(
    consentAwareMicrocopy.settings.cookiePreferenceEntryPoint,
    "cookie-notice-route"
  );
  assert.equal(storageAccess.settings.consentExperience, "informational-notice");
  assert.equal(consentAwareMicrocopy.settings.updatesOptInStrategy, "surface-controlled");
  assert.equal(
    consentAwareMicrocopy.settings.accessibilityFeedbackSurfaceId,
    "accessibility-feedback"
  );
  assert.deepEqual(updatesEnabledSurfaceIds, [
    "involvement-general",
    "partner-enquiry",
    "support-general",
    "volunteer-enquiry"
  ]);
  assert.equal(contactInfo.locationGuidance.publicDirectionsUrl, null);
  assert.match(
    consentAwareMicrocopy.notices.cookieEntryPoint.whenNoBanner,
    /does not show a cookie banner at launch/u
  );
  assert.match(
    consentAwareMicrocopy.notices.cookieEntryPoint.whenNoBanner,
    /aggregate analytics model/u
  );
  assert.match(consentAwareMicrocopy.notices.calendarDownload.availableBody, /\.ics/u);
});
