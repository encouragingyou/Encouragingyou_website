import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveAnalyticsMode,
  resolveAnalyticsPageId,
  resolveAnalyticsRouteFamily,
  sanitizeAnalyticsEvent
} from "../src/lib/analytics/contract.js";
import { resolveAnalyticsPreferenceState } from "../src/lib/analytics/preferences.js";

test("analytics route helpers classify seeded routes into stable reporting families", () => {
  assert.equal(
    resolveAnalyticsPageId("/programmes/community-friendship/"),
    "programme-community-friendship"
  );
  assert.equal(
    resolveAnalyticsRouteFamily(
      "programme-community-friendship",
      "/programmes/community-friendship/"
    ),
    "programmes"
  );
  assert.equal(
    resolveAnalyticsRouteFamily("session-cv-support", "/sessions/cv-support/"),
    "sessions"
  );
  assert.equal(resolveAnalyticsRouteFamily("volunteer", "/volunteer/"), "get-involved");
  assert.equal(resolveAnalyticsRouteFamily("privacy", "/privacy/"), "trust");
});

test("analytics event sanitizer keeps the contract narrow and rejects unexpected payloads", () => {
  assert.deepEqual(
    sanitizeAnalyticsEvent({
      eventName: "cta_click",
      pageId: "home",
      routeFamily: "home",
      surface: "hero",
      destinationFamily: "sessions",
      destinationType: "internal-route",
      variant: "primary"
    }),
    {
      eventName: "cta_click",
      dimensions: {
        pageId: "home",
        routeFamily: "home",
        surface: "hero",
        destinationFamily: "sessions",
        destinationType: "internal-route",
        variant: "primary"
      }
    }
  );

  assert.equal(
    sanitizeAnalyticsEvent({
      eventName: "cta_click",
      pageId: "home",
      routeFamily: "home",
      surface: "hero",
      destinationFamily: "sessions",
      destinationType: "internal-route",
      variant: "primary",
      message: "do not allow free text"
    }),
    null
  );
});

test("analytics preference state honors objection cookies and browser privacy signals", () => {
  const objectedCookies = {
    get(name) {
      return name === "ey_analytics_pref" ? { value: "objected" } : undefined;
    }
  };

  const originalAnalyticsMode = process.env.ANALYTICS_MODE;

  process.env.ANALYTICS_MODE = "statistical";

  try {
    assert.equal(
      resolveAnalyticsPreferenceState({
        cookies: objectedCookies,
        headers: new Headers(),
        pageId: "home",
        pathname: "/"
      }).state,
      "objected"
    );

    assert.equal(
      resolveAnalyticsPreferenceState({
        cookies: null,
        headers: new Headers({
          "sec-gpc": "1"
        }),
        pageId: "home",
        pathname: "/"
      }).state,
      "browser-privacy-signal"
    );
  } finally {
    if (originalAnalyticsMode === undefined) {
      delete process.env.ANALYTICS_MODE;
    } else {
      process.env.ANALYTICS_MODE = originalAnalyticsMode;
    }
  }
});

test("preview deployments force analytics fully off even if production mode is configured", () => {
  assert.equal(
    resolveAnalyticsMode("statistical", {
      deploymentChannel: "preview"
    }),
    "off"
  );
  assert.equal(
    resolveAnalyticsMode("consent", {
      deploymentChannel: "ci"
    }),
    "off"
  );
  assert.equal(
    resolveAnalyticsMode("consent", {
      deploymentChannel: "production"
    }),
    "consent"
  );
});
