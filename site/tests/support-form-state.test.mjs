import test from "node:test";
import assert from "node:assert/strict";

import {
  normalizeSupportFormPayload,
  validateEnquirySubmission,
  validateSupportForm
} from "../src/lib/state/support-form.js";

const reasonOptions = [
  { id: "join-session", label: "Join a session" },
  { id: "volunteer", label: "Volunteer enquiry" }
];

test("normalizeSupportFormPayload trims input and resolves reason labels", () => {
  const payload = normalizeSupportFormPayload(
    {
      name: "  Alex  ",
      email: " ALEX@EXAMPLE.COM ",
      reason: "join-session",
      message: "  I would like to know what happens on a first visit.  ",
      updates: "yes"
    },
    reasonOptions
  );

  assert.deepEqual(payload, {
    surfaceId: "",
    originPath: "",
    formId: "",
    contextId: null,
    renderedAt: "",
    honeypot: "",
    name: "Alex",
    email: "alex@example.com",
    reason: "join-session",
    reasonLabel: "Join a session",
    message: "I would like to know what happens on a first visit.",
    updatesOptIn: true
  });
});

test("validateSupportForm returns field-level errors for incomplete submissions", () => {
  const result = validateSupportForm(
    {
      name: "A",
      email: "not-an-email",
      reason: "",
      reasonLabel: "",
      message: "Too short",
      updatesOptIn: false
    },
    reasonOptions
  );

  assert.equal(result.isValid, false);
  assert.deepEqual(result.errors, {
    name: "Enter the name we should use when replying.",
    email: "Enter a valid email address so we can reply.",
    reason: "Choose the type of enquiry.",
    message: "Add a little more detail so the team can route your enquiry."
  });
});

test("validateEnquirySubmission enforces surface, route, and context metadata", () => {
  const result = validateEnquirySubmission(
    {
      surfaceId: "support-general",
      originPath: "/contact/",
      formId: "contact-form",
      contextId: "session:cv-support",
      renderedAt: "2026-04-23T12:00:00.000Z",
      honeypot: "",
      name: "Alex",
      email: "alex@example.com",
      reason: "volunteer",
      reasonLabel: "Volunteer enquiry",
      message: "I would like to know what happens on a first visit.",
      updatesOptIn: true
    },
    {
      surfaceId: "support-general",
      allowedOriginPaths: ["/contact/"],
      allowedContextIds: [],
      reasonOptions
    }
  );

  assert.equal(result.isValid, false);
  assert.equal(result.code, "invalid-context");
  assert.equal(
    result.formError,
    "This prefilled route is no longer available. Start again from the page you were using."
  );
  assert.deepEqual(result.fieldErrors, {});
});
