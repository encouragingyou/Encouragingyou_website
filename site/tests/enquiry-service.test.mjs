import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  processEnquirySubmission,
  resetEnquiryRateLimitStore
} from "../src/lib/server/enquiry-service.js";

function createHeaders() {
  return new Headers({
    origin: "https://example.test",
    referer: "https://example.test/contact/",
    host: "example.test",
    "user-agent": "node-test",
    "x-forwarded-for": "203.0.113.7"
  });
}

function createBaseFormData() {
  const formData = new FormData();

  formData.set("surfaceId", "support-general");
  formData.set("originPath", "/contact/");
  formData.set("formId", "contact-form");
  formData.set("renderedAt", "2026-04-23T11:59:55.000Z");
  formData.set("name", "Alex");
  formData.set("email", "alex@example.com");
  formData.set("reason", "general");
  formData.set(
    "message",
    "I would like to understand the best first step before I travel."
  );
  formData.set("updates", "yes");

  return formData;
}

function createSafeguardingFormData() {
  const formData = new FormData();

  formData.set("surfaceId", "safeguarding-concern");
  formData.set("originPath", "/safeguarding/child/");
  formData.set("formId", "safeguarding-concern");
  formData.set("renderedAt", "2026-04-23T11:59:55.000Z");
  formData.set("name", "Concerned adult");
  formData.set("email", "concern@example.com");
  formData.set("reason", "safeguarding");
  formData.set(
    "message",
    "I am worried about a young person and want to share a clear non-emergency safeguarding concern."
  );

  return formData;
}

test.beforeEach(() => {
  resetEnquiryRateLimitStore();
});

test("processEnquirySubmission stores a valid enquiry and returns a success reference", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-enquiry-"));

  try {
    const result = await processEnquirySubmission({
      requestUrl: "https://example.test/api/enquiry",
      headers: createHeaders(),
      formData: createBaseFormData(),
      now: new Date("2026-04-23T12:00:05.000Z"),
      storageDir
    });

    assert.equal(result.ok, true);
    assert.equal(result.state, "success");
    assert.match(result.referenceId, /^EY-20260423-[A-F0-9]{6}$/u);

    const storedRecord = JSON.parse(
      await readFile(join(storageDir, `${result.referenceId}.json`), "utf8")
    );

    assert.equal(storedRecord.reason.routingKey, "general-intake");
    assert.equal(storedRecord.sender.email, "alex@example.com");
    assert.equal(storedRecord.sender.updatesOptIn, true);
    assert.equal(storedRecord.originPath, "/contact/");
    assert.notEqual(storedRecord.requestMeta.ipHash, null);
    assert.notEqual(storedRecord.requestMeta.ipHash, "127.0.0.1");
    assert.equal(storedRecord.requestMeta.userAgent, "node-test");
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("processEnquirySubmission blocks honeypot submissions before storage", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-enquiry-"));
  const formData = createBaseFormData();

  formData.set("website", "filled-by-bot");

  try {
    const result = await processEnquirySubmission({
      requestUrl: "https://example.test/api/enquiry",
      headers: createHeaders(),
      formData,
      now: new Date("2026-04-23T12:00:05.000Z"),
      storageDir
    });

    assert.equal(result.ok, false);
    assert.equal(result.state, "spam-blocked");
    assert.equal(result.code, "honeypot-blocked");
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("processEnquirySubmission trusts same-host submissions when requestUrl uses the configured site origin", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-enquiry-"));

  try {
    const headers = new Headers({
      origin: "http://127.0.0.1:4173",
      referer: "http://127.0.0.1:4173/contact/",
      host: "127.0.0.1:4173",
      "user-agent": "node-test"
    });
    const result = await processEnquirySubmission({
      requestUrl: "https://www.encouragingyou.co.uk/api/enquiry/",
      headers,
      formData: createBaseFormData(),
      now: new Date("2026-04-23T12:00:05.000Z"),
      storageDir
    });

    assert.equal(result.ok, true);
    assert.equal(result.state, "success");
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("processEnquirySubmission rate-limits repeated submissions from the same requester", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-enquiry-"));

  try {
    let finalResult = null;

    for (let index = 0; index < 21; index += 1) {
      const formData = createBaseFormData();

      formData.set(
        "message",
        `I would like to understand the best first step before I travel. Attempt ${index}.`
      );

      finalResult = await processEnquirySubmission({
        requestUrl: "https://example.test/api/enquiry",
        headers: createHeaders(),
        formData,
        now: new Date("2026-04-23T12:00:05.000Z"),
        storageDir
      });
    }

    assert.ok(finalResult);
    assert.equal(finalResult.ok, false);
    assert.equal(finalResult.state, "rate-limited");
    assert.equal(finalResult.code, "rate-limited");
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});

test("processEnquirySubmission accepts the dedicated safeguarding surface on safeguarding routes", async () => {
  const storageDir = await mkdtemp(join(tmpdir(), "encouragingyou-enquiry-"));

  try {
    const headers = new Headers({
      origin: "https://example.test",
      referer: "https://example.test/safeguarding/child/",
      host: "example.test",
      "user-agent": "node-test"
    });
    const result = await processEnquirySubmission({
      requestUrl: "https://example.test/api/enquiry",
      headers,
      formData: createSafeguardingFormData(),
      now: new Date("2026-04-23T12:00:05.000Z"),
      storageDir
    });

    assert.equal(result.ok, true);
    assert.equal(result.state, "success");

    const storedRecord = JSON.parse(
      await readFile(join(storageDir, `${result.referenceId}.json`), "utf8")
    );

    assert.equal(storedRecord.surfaceId, "safeguarding-concern");
    assert.equal(storedRecord.originPath, "/safeguarding/child/");
    assert.equal(storedRecord.reason.routingKey, "safeguarding-intake");
  } finally {
    await rm(storageDir, { recursive: true, force: true });
  }
});
