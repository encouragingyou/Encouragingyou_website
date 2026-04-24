import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSessionEnquiryHref,
  getEnquiryContextById,
  isAllowedOriginPath,
  getReasonOptionsForSurface
} from "../src/lib/forms/enquiry-contract.js";

test("session enquiry links route through contact with a stable context handoff", () => {
  assert.equal(
    buildSessionEnquiryHref("cv-support"),
    "/contact/?context=session%3Acv-support#contact-form"
  );
  assert.equal(
    buildSessionEnquiryHref("youth-club"),
    "/contact/?context=session%3Ayouth-club#contact-form"
  );
});

test("surface-specific reason options stay constrained by the structured contract", () => {
  assert.deepEqual(
    getReasonOptionsForSurface("volunteer-enquiry").map((reason) => reason.id),
    ["volunteer"]
  );
  assert.deepEqual(
    getReasonOptionsForSurface("partner-enquiry").map((reason) => reason.id),
    ["partner", "referral"]
  );
  assert.deepEqual(
    getReasonOptionsForSurface("accessibility-feedback").map((reason) => reason.id),
    ["accessibility"]
  );
});

test("session enquiry contexts preserve the session route and reason mapping", () => {
  const context = getEnquiryContextById("session:cv-support");

  assert.ok(context);
  assert.equal(context.reasonId, "cv-support");
  assert.equal(context.routePath, "/sessions/cv-support/");
  assert.match(context.body, /prefilled for CV support/u);
});

test("accessibility feedback form stays bound to the accessibility route", () => {
  assert.equal(isAllowedOriginPath("accessibility-feedback", "/accessibility/"), true);
  assert.equal(isAllowedOriginPath("accessibility-feedback", "/contact/"), false);
});
