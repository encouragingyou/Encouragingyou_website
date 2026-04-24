import test from "node:test";
import assert from "node:assert/strict";

import {
  getDeploymentHeaders,
  resolveDeploymentChannel,
  resolveDeploymentContext,
  resolveDeploymentSurface,
  resolvePublicSiteUrl,
  resolveReleaseId,
  shouldAllowSearchIndexing,
  shouldExposeAdminRoutes,
  shouldExposePublicRoutes
} from "../src/lib/deployment/context.js";
import { resolveAnalyticsStorageDir } from "../src/lib/analytics/store.js";
import { resolveEnquiryStorageDir } from "../src/lib/server/enquiry-service.js";

test("pull request detection takes precedence over a copied production channel flag", () => {
  assert.equal(
    resolveDeploymentChannel({
      deploymentChannel: "production",
      isPullRequest: "true",
      isRender: "true"
    }),
    "preview"
  );
});

test("public site URL resolution prefers explicit SITE_URL before the Render preview hostname", () => {
  assert.equal(
    resolvePublicSiteUrl({
      siteUrl: "https://www.encouragingyou.co.uk",
      renderExternalUrl: "https://encouragingyou-pr-12.onrender.com"
    }),
    "https://www.encouragingyou.co.uk/"
  );
  assert.equal(
    resolvePublicSiteUrl({
      siteUrl: "",
      renderExternalUrl: "https://encouragingyou-pr-12.onrender.com"
    }),
    "https://encouragingyou-pr-12.onrender.com/"
  );
});

test("release IDs and headers fall back to the deployed commit metadata", () => {
  const context = resolveDeploymentContext({
    deploymentChannel: "production",
    deploymentSurface: "public",
    releaseSha: "abcdef1234567890",
    siteUrl: "https://www.encouragingyou.co.uk"
  });

  assert.equal(resolveReleaseId({ releaseSha: "abcdef1234567890" }), "abcdef123456");
  assert.deepEqual(getDeploymentHeaders(context), {
    "X-Deployment-Channel": "production",
    "X-Deployment-Surface": "public",
    "X-Release-Id": "abcdef123456",
    "X-Release-Sha": "abcdef1234567890"
  });
});

test("preview and CI deployments are never search-indexable", () => {
  assert.equal(shouldAllowSearchIndexing("local", "shared"), true);
  assert.equal(shouldAllowSearchIndexing("production", "public"), true);
  assert.equal(shouldAllowSearchIndexing("preview", "public"), false);
  assert.equal(shouldAllowSearchIndexing("ci", "shared"), false);
  assert.equal(shouldAllowSearchIndexing("production", "admin"), false);
});

test("deployment surface defaults stay shared locally and public on hosted deploys", () => {
  assert.equal(
    resolveDeploymentSurface({
      deploymentChannel: "local",
      deploymentSurface: null,
      isRender: null
    }),
    "shared"
  );
  assert.equal(
    resolveDeploymentSurface({
      deploymentChannel: "ci",
      deploymentSurface: null,
      isRender: null
    }),
    "shared"
  );
  assert.equal(
    resolveDeploymentSurface({
      deploymentChannel: "production",
      deploymentSurface: null,
      isRender: "true"
    }),
    "public"
  );
  assert.equal(
    resolveDeploymentSurface({
      deploymentChannel: "production",
      deploymentSurface: "admin"
    }),
    "admin"
  );
});

test("route exposure follows the deployment surface boundary", () => {
  assert.equal(shouldExposePublicRoutes("shared"), true);
  assert.equal(shouldExposeAdminRoutes("shared"), true);
  assert.equal(shouldExposePublicRoutes("public"), true);
  assert.equal(shouldExposeAdminRoutes("public"), false);
  assert.equal(shouldExposePublicRoutes("admin"), false);
  assert.equal(shouldExposeAdminRoutes("admin"), true);
});

test("preview channels force writable runtime data into temp storage", () => {
  assert.match(
    resolveAnalyticsStorageDir({
      deploymentChannel: "preview"
    }),
    /encouragingyou[\\/]+preview[\\/]+analytics/u
  );
  assert.match(
    resolveEnquiryStorageDir({
      deploymentChannel: "preview"
    }),
    /encouragingyou[\\/]+preview[\\/]+enquiries/u
  );
});
