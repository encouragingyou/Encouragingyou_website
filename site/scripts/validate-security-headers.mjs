import assert from "node:assert/strict";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHtmlCacheControl } from "../src/lib/performance/policies.js";
import { extractInlineScriptHashes } from "../src/lib/security/policy.js";
import { startBuiltPreviewServer } from "./lib/preview-server.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const validationPort = Number(process.env.SECURITY_VALIDATION_PORT ?? "4333");

const htmlRoutes = [
  "/",
  "/contact/",
  "/privacy/",
  "/events-updates/community-events-and-workshops/"
];

function assertHeaderContains(headers, headerName, value) {
  const resolved = headers.get(headerName);

  assert.ok(resolved, `Expected ${headerName} to be present.`);
  assert.match(
    resolved,
    new RegExp(value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"),
    `Expected ${headerName} to include ${value}.`
  );
}

async function validateHtmlResponse(baseUrl, pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  const html = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  const csp = response.headers.get("content-security-policy") ?? "";

  assert.equal(response.status, 200, `Expected ${pathname} to return 200.`);
  assert.match(contentType, /text\/html/u, `Expected ${pathname} to return HTML.`);
  assert.equal(
    response.headers.get("cache-control"),
    resolveHtmlCacheControl(pathname),
    `Expected ${pathname} to keep the launch HTML cache policy.`
  );

  assertHeaderContains(response.headers, "x-content-type-options", "nosniff");
  assertHeaderContains(response.headers, "x-frame-options", "DENY");
  assertHeaderContains(
    response.headers,
    "referrer-policy",
    "strict-origin-when-cross-origin"
  );
  assertHeaderContains(response.headers, "permissions-policy", "camera=()");
  assertHeaderContains(response.headers, "cross-origin-opener-policy", "same-origin");
  assertHeaderContains(response.headers, "origin-agent-cluster", "?1");
  assertHeaderContains(response.headers, "x-permitted-cross-domain-policies", "none");

  assert.match(csp, /default-src 'self'/u, "Expected a same-origin default source.");
  assert.match(
    csp,
    /form-action 'self'/u,
    "Expected form submissions to stay same-origin."
  );
  assert.match(csp, /frame-ancestors 'none'/u, "Expected framing to be blocked.");
  assert.match(csp, /style-src 'self'/u, "Expected styles to stay same-origin.");
  assert.match(
    csp,
    /style-src-attr 'none'/u,
    "Expected inline style attributes to be blocked."
  );
  assert.match(csp, /script-src 'self'/u, "Expected scripts to stay same-origin.");
  assert.match(
    csp,
    /script-src-attr 'none'/u,
    "Expected inline script attributes to be blocked."
  );

  const inlineScriptHashes = extractInlineScriptHashes(html);

  assert.ok(
    inlineScriptHashes.length > 0,
    `Expected ${pathname} to contain the hashed inline scripts emitted by BaseLayout.`
  );

  for (const hash of inlineScriptHashes) {
    assert.match(
      csp,
      new RegExp(hash.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"),
      `Expected CSP for ${pathname} to include ${hash}.`
    );
  }

  assert.doesNotMatch(
    html,
    /\sstyle=/iu,
    `Expected ${pathname} to avoid inline style attributes so style-src-attr can stay 'none'.`
  );
  assert.doesNotMatch(
    html,
    /\son[a-z]+=/iu,
    `Expected ${pathname} to avoid inline event handlers so script-src-attr can stay 'none'.`
  );
}

async function validateApiResponses(baseUrl) {
  const origin = new URL(baseUrl).origin;

  const enquiryGet = await fetch(new URL("/api/enquiry/", baseUrl));
  assert.equal(
    enquiryGet.status,
    405,
    "Expected /api/enquiry/ GET to remain method-guarded."
  );
  assert.equal(
    enquiryGet.headers.get("cache-control"),
    "no-store",
    "Expected /api/enquiry/ GET to remain uncached."
  );

  const crossOriginAnalytics = await fetch(new URL("/api/analytics/", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://malicious.example"
    },
    body: JSON.stringify({
      eventName: "page_view",
      pageId: "home",
      routeFamily: "home",
      entryType: "direct"
    })
  });
  assert.equal(
    crossOriginAnalytics.status,
    403,
    "Expected analytics ingest to reject cross-origin POSTs."
  );

  const oversizedAnalytics = await fetch(new URL("/api/analytics/", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Referer: `${origin}/cookies/`
    },
    body: JSON.stringify({
      eventName: "page_view",
      pageId: "home",
      routeFamily: "home",
      entryType: "direct",
      filler: "x".repeat(8_000)
    })
  });
  assert.equal(
    oversizedAnalytics.status,
    413,
    "Expected analytics ingest to enforce the body-size limit."
  );

  const invalidPreferenceType = await fetch(
    new URL("/api/analytics-preference/", baseUrl),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin
      },
      body: JSON.stringify({
        action: "object"
      })
    }
  );
  assert.equal(
    invalidPreferenceType.status,
    415,
    "Expected analytics preference updates to enforce form POSTs."
  );

  const oversizedEnquiry = await fetch(new URL("/api/enquiry/", baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
      Origin: origin,
      Referer: `${origin}/contact/`
    },
    body: new URLSearchParams({
      surfaceId: "support-general",
      originPath: "/contact/",
      formId: "contact-form",
      renderedAt: "2026-04-23T11:59:55.000Z",
      name: "Alex",
      email: "alex@example.com",
      reason: "general",
      message: "x".repeat(20_000)
    })
  });
  assert.equal(
    oversizedEnquiry.status,
    413,
    "Expected enquiry submissions to enforce the body-size limit."
  );
}

async function main() {
  const server = await startBuiltPreviewServer({
    cwd: siteRoot,
    port: validationPort,
    env: {
      ENQUIRY_STORAGE_DIR: "./output/security/enquiries",
      ANALYTICS_STORAGE_DIR: "./output/security/analytics",
      ANALYTICS_MODE: "statistical"
    }
  });

  try {
    for (const route of htmlRoutes) {
      await validateHtmlResponse(server.baseUrl, route);
    }

    await validateApiResponses(server.baseUrl);

    console.log(
      `[security-validate] validated ${htmlRoutes.length} HTML routes and the public API guardrails`
    );
  } finally {
    await server.stop();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
