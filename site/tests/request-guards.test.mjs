import test from "node:test";
import assert from "node:assert/strict";

import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  isTrustedSameOriginRequest,
  parseJsonRequestWithinLimit,
  requestBodyLimits
} from "../src/lib/security/request-guards.js";

test("same-origin guard accepts host-matched preview submissions and rejects foreign origins", () => {
  assert.equal(
    isTrustedSameOriginRequest({
      requestUrl: "https://www.encouragingyou.co.uk/api/enquiry/",
      headers: new Headers({
        origin: "http://127.0.0.1:4173",
        referer: "http://127.0.0.1:4173/contact/",
        host: "127.0.0.1:4173"
      })
    }),
    true
  );

  assert.equal(
    isTrustedSameOriginRequest({
      requestUrl: "https://www.encouragingyou.co.uk/api/analytics/",
      headers: new Headers({
        origin: "https://malicious.example",
        host: "www.encouragingyou.co.uk"
      })
    }),
    false
  );
});

test("content-type and body-size guards stay narrow", () => {
  assert.equal(
    hasAllowedContentType(
      new Headers({
        "content-type": "application/json; charset=utf-8"
      }),
      allowedRequestContentTypes.analyticsEvent
    ),
    true
  );
  assert.equal(
    hasAllowedContentType(
      new Headers({
        "content-type": "text/plain"
      }),
      allowedRequestContentTypes.analyticsEvent
    ),
    false
  );

  assert.equal(
    isBodySizeWithinLimit(
      new Headers({
        "content-length": String(requestBodyLimits.analyticsEvent)
      }),
      requestBodyLimits.analyticsEvent
    ),
    true
  );
  assert.equal(
    isBodySizeWithinLimit(
      new Headers({
        "content-length": String(requestBodyLimits.analyticsEvent + 1)
      }),
      requestBodyLimits.analyticsEvent
    ),
    false
  );
});

test("JSON parsing guard rejects empty and oversized payloads", async () => {
  const invalid = await parseJsonRequestWithinLimit(
    new Request("https://example.test/api/analytics/", {
      method: "POST",
      body: ""
    }),
    requestBodyLimits.analyticsEvent
  );
  assert.equal(invalid.ok, false);
  assert.equal(invalid.error, "invalid-json");

  const oversized = await parseJsonRequestWithinLimit(
    new Request("https://example.test/api/analytics/", {
      method: "POST",
      body: JSON.stringify({
        filler: "x".repeat(requestBodyLimits.analyticsEvent + 32)
      })
    }),
    requestBodyLimits.analyticsEvent
  );
  assert.equal(oversized.ok, false);
  assert.equal(oversized.error, "request-too-large");
});
