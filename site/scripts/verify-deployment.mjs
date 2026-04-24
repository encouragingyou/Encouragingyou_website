import { parseArgs } from "node:util";
import { setTimeout as delay } from "node:timers/promises";

import { deploymentChannels } from "../src/lib/deployment/context.js";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeBaseUrl(value) {
  try {
    return new URL(value).toString();
  } catch {
    throw new Error(`Invalid --base-url value: ${value}`);
  }
}

function normalizeChannel(value) {
  if (!deploymentChannels.includes(value)) {
    throw new Error(`Unsupported deployment channel: ${value}`);
  }

  return value;
}

function normalizeSurface(value) {
  if (!["public", "admin", "shared"].includes(value)) {
    throw new Error(`Unsupported deployment surface: ${value}`);
  }

  return value;
}

function toHeadersMap(headers) {
  return Object.fromEntries([...headers.entries()].map(([key, value]) => [key, value]));
}

async function fetchText(baseUrl, pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  const text = await response.text();

  return {
    response,
    text,
    headers: toHeadersMap(response.headers)
  };
}

async function fetchJson(baseUrl, pathname) {
  const response = await fetch(new URL(pathname, baseUrl));
  const text = await response.text();

  return {
    response,
    json: JSON.parse(text),
    text,
    headers: toHeadersMap(response.headers)
  };
}

function expectHeader(headers, headerName, expectedValue) {
  const value = headers[headerName.toLowerCase()];
  assert(
    value === expectedValue,
    `Expected ${headerName}=${expectedValue}, received ${value}`
  );
}

const { values } = parseArgs({
  allowPositionals: false,
  options: {
    "base-url": {
      type: "string"
    },
    baseUrl: {
      type: "string"
    },
    channel: {
      type: "string",
      default: "production"
    },
    surface: {
      type: "string",
      default: "shared"
    },
    expectReleaseId: {
      type: "string"
    },
    expectReleaseSha: {
      type: "string"
    },
    attempts: {
      type: "string",
      default: "36"
    },
    waitMs: {
      type: "string",
      default: "5000"
    }
  }
});

const baseUrlValue = values.baseUrl ?? values["base-url"];

assert(baseUrlValue, "--base-url is required.");

const baseUrl = normalizeBaseUrl(baseUrlValue);
const channel = normalizeChannel(values.channel);
const surface = normalizeSurface(values.surface);
const attempts = Number(values.attempts);
const waitMs = Number(values.waitMs);

assert(
  Number.isInteger(attempts) && attempts > 0,
  "--attempts must be a positive integer."
);
assert(Number.isInteger(waitMs) && waitMs > 0, "--waitMs must be a positive integer.");

let healthCheck = null;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  healthCheck = await fetchJson(baseUrl, "/api/health/").catch(() => null);

  const releaseMatches =
    healthCheck?.json?.deployment?.releaseSha === values.expectReleaseSha ||
    !values.expectReleaseSha;
  const releaseIdMatches =
    healthCheck?.json?.deployment?.releaseId === values.expectReleaseId ||
    !values.expectReleaseId;
  const channelMatches = healthCheck?.json?.deployment?.channel === channel;
  const surfaceMatches = healthCheck?.json?.deployment?.surface === surface;

  if (
    healthCheck?.response?.ok &&
    releaseMatches &&
    releaseIdMatches &&
    channelMatches &&
    surfaceMatches
  ) {
    break;
  }

  if (attempt === attempts) {
    throw new Error(
      `Timed out waiting for ${baseUrl} to report channel=${channel}, surface=${surface}, releaseId=${values.expectReleaseId ?? "(any)"}, releaseSha=${values.expectReleaseSha ?? "(any)"}`
    );
  }

  await delay(waitMs);
}

assert(healthCheck, "Expected a deployment health response.");
assert(healthCheck.response.ok, "Deployment health endpoint did not return HTTP 200.");
assert(
  healthCheck.json.status === "ok",
  `Deployment health reported ${healthCheck.json.status}.`
);
assert(
  healthCheck.json.deployment.channel === channel,
  `Expected health channel ${channel}, received ${healthCheck.json.deployment.channel}.`
);
assert(
  healthCheck.json.deployment.surface === surface,
  `Expected health surface ${surface}, received ${healthCheck.json.deployment.surface}.`
);

if (values.expectReleaseId) {
  assert(
    healthCheck.json.deployment.releaseId === values.expectReleaseId,
    `Expected releaseId ${values.expectReleaseId}, received ${healthCheck.json.deployment.releaseId}.`
  );
}

if (values.expectReleaseSha) {
  assert(
    healthCheck.json.deployment.releaseSha === values.expectReleaseSha,
    `Expected releaseSha ${values.expectReleaseSha}, received ${healthCheck.json.deployment.releaseSha}.`
  );
}

if (surface === "admin") {
  const [root, login, adminHome, contact, robots, sitemap] = await Promise.all([
    fetchText(baseUrl, "/"),
    fetchText(baseUrl, "/admin/login/"),
    fetchText(baseUrl, "/admin/"),
    fetchText(baseUrl, "/contact/"),
    fetchText(baseUrl, "/robots.txt"),
    fetchText(baseUrl, "/sitemap.xml")
  ]);

  for (const page of [root, login, adminHome]) {
    assert(page.response.ok, `Expected ${page.response.url} to return 200.`);
    expectHeader(page.headers, "x-deployment-channel", channel);
    expectHeader(page.headers, "x-deployment-surface", surface);

    if (values.expectReleaseId) {
      expectHeader(page.headers, "x-release-id", values.expectReleaseId);
    }

    if (values.expectReleaseSha) {
      expectHeader(page.headers, "x-release-sha", values.expectReleaseSha);
    }
  }

  assert(
    root.response.url.endsWith("/admin/login/"),
    "Admin root should resolve into the isolated login route."
  );
  assert(
    adminHome.response.url.endsWith("/admin/login/"),
    "Unauthenticated admin home should resolve into the login route."
  );
  assert.equal(
    contact.response.status,
    404,
    "Admin surface must not expose public routes."
  );
  assert(
    login.headers["x-robots-tag"]?.includes("noindex"),
    "Admin login route must emit noindex headers."
  );
  assert(
    login.text.includes("Invitation-only CMS access"),
    "Admin login route content is incomplete."
  );
  assert(
    /User-agent: \*\nDisallow: \//u.test(robots.text),
    "Admin robots.txt must disallow all crawling."
  );
  assert(
    !/<loc>/u.test(sitemap.text),
    "Admin sitemap.xml should not advertise public URLs."
  );
  assert.equal(
    healthCheck.json.indexing.searchAllowed,
    false,
    "Admin surface must never be search-indexable."
  );
  assert.equal(
    healthCheck.json.surface.publicRoutesEnabled,
    false,
    "Admin surface must not expose public routes."
  );
  assert.equal(
    healthCheck.json.surface.adminRoutesEnabled,
    true,
    "Admin surface must expose admin routes."
  );
  assert.equal(
    healthCheck.json.admin.portalEnabled,
    true,
    "Admin surface must keep the admin portal enabled."
  );
  assert.equal(
    healthCheck.json.admin.cryptoReady,
    true,
    "Admin surface must report cryptographic readiness."
  );
  assert.equal(
    healthCheck.json.storage.adminReady,
    true,
    "Admin surface storage is not writable."
  );

  console.log(
    `[deploy-verify] ${channel}/${surface} verification passed for ${baseUrl} (${healthCheck.json.deployment.releaseId})`
  );
  process.exit(0);
}

const [home, contact, privacy, cookies, admin, robots, sitemap] = await Promise.all([
  fetchText(baseUrl, "/"),
  fetchText(baseUrl, "/contact/"),
  fetchText(baseUrl, "/privacy/"),
  fetchText(baseUrl, "/cookies/"),
  fetchText(baseUrl, "/admin/"),
  fetchText(baseUrl, "/robots.txt"),
  fetchText(baseUrl, "/sitemap.xml")
]);

for (const page of [home, contact, privacy, cookies]) {
  assert(page.response.ok, `Expected ${page.response.url} to return 200.`);
  expectHeader(page.headers, "x-deployment-channel", channel);
  expectHeader(page.headers, "x-deployment-surface", surface);

  if (values.expectReleaseId) {
    expectHeader(page.headers, "x-release-id", values.expectReleaseId);
  }

  if (values.expectReleaseSha) {
    expectHeader(page.headers, "x-release-sha", values.expectReleaseSha);
  }
}

if (surface === "public") {
  assert.equal(
    admin.response.status,
    404,
    "Public surface must not expose admin routes."
  );
} else {
  assert(
    admin.response.ok,
    "Shared surface should still expose the authenticated admin entry route."
  );
  assert(
    admin.response.url.endsWith("/admin/login/"),
    "Shared surface should resolve the unauthenticated admin entry into the login route."
  );
}
assert(home.text.includes('id="main"'), "Homepage is missing the main landmark.");
assert(
  home.text.includes("/privacy/"),
  "Homepage footer does not expose the privacy route."
);
assert(
  contact.text.includes("api/enquiry/"),
  "Contact route does not expose the enquiry surface."
);
assert(
  privacy.text.includes('id="rights"') &&
    privacy.text.includes("Your choices and rights"),
  "Privacy route content is incomplete."
);
assert(cookies.text.includes("analytics"), "Cookie route content is incomplete.");

if (channel === "preview") {
  assert(
    home.headers["x-robots-tag"]?.includes("noindex"),
    "Preview deployment must emit X-Robots-Tag noindex."
  );
  assert(
    /<meta name="robots" content="noindex,follow"/u.test(home.text),
    "Preview homepage must render a noindex robots directive."
  );
  assert(
    home.text.includes('data-analytics-mode="off"'),
    "Preview homepage must keep analytics disabled."
  );
  assert(
    /User-agent: \*\nDisallow: \//u.test(robots.text),
    "Preview robots.txt must disallow all crawling."
  );
  assert(
    !/<loc>/u.test(sitemap.text),
    "Preview sitemap.xml should not advertise public URLs."
  );
} else {
  assert(
    !home.headers["x-robots-tag"],
    "Production/local deployment should not emit preview-only X-Robots-Tag."
  );
  assert(
    !/<meta name="robots" content="noindex,follow"/u.test(home.text),
    "Production/local homepage should stay indexable."
  );
  assert(
    /User-agent: \*/u.test(robots.text) && /Sitemap:/u.test(robots.text),
    "Production/local robots.txt must publish the sitemap."
  );
  assert(
    /<loc>/u.test(sitemap.text),
    "Production/local sitemap.xml is unexpectedly empty."
  );
}

console.log(
  `[deploy-verify] ${channel}/${surface} verification passed for ${baseUrl} (${healthCheck.json.deployment.releaseId})`
);
