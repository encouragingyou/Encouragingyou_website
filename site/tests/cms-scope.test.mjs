import test from "node:test";
import assert from "node:assert/strict";

import {
  getCmsRole,
  getCmsRouteFieldEntry,
  getPublicCmsPublicationContract,
  listSurfacesByOwnership,
  roleCan
} from "../src/lib/cms/scope.js";
import {
  assertPublicSiteIsReadOnly,
  listCmsForbiddenCapabilities
} from "../src/lib/cms/publication-contract.js";

test("client editors are intentionally blocked from publishing and runtime control", () => {
  const clientEditor = getCmsRole("client-editor");

  assert.ok(clientEditor, "Expected the client-editor role to exist.");
  assert.equal(roleCan("client-editor", "create-draft"), true);
  assert.equal(roleCan("client-editor", "publish-content"), false);
  assert.equal(roleCan("client-editor", "manage-schema-and-mappings"), false);
  assert.equal(roleCan("client-editor", "manage-runtime-and-secrets"), false);
});

test("homepage registry keeps editorial copy editable while leaving layout locked", () => {
  const homeEntry = getCmsRouteFieldEntry("home");

  assert.ok(homeEntry, "Expected the home CMS route entry to exist.");

  const editorialSurface = homeEntry.surfaces.find(
    (surface) => surface.id === "hero-and-quick-actions"
  );
  const lockedSurface = homeEntry.surfaces.find(
    (surface) => surface.id === "home-layout-and-section-order"
  );

  assert.equal(editorialSurface?.ownershipClass, "client-editable");
  assert.equal(editorialSurface?.linkPolicyId, "internal-route-only");
  assert.equal(lockedSurface?.ownershipClass, "developer-owned");
  assert.equal(lockedSurface?.mutationPrimitiveId, "developer-locked");
});

test("client-editable surfaces never rely on arbitrary external links", () => {
  const clientEditableSurfaces = listSurfacesByOwnership("client-editable");

  assert.ok(clientEditableSurfaces.length > 0, "Expected client-editable surfaces.");

  for (const surface of clientEditableSurfaces) {
    assert.notEqual(surface.linkPolicyId, "external-allowlist");
    assert.notEqual(surface.linkPolicyId, "operator-managed");
  }
});

test("public CMS contract stays read-only on the public origin", () => {
  const publicationContract = getPublicCmsPublicationContract();

  assert.equal(assertPublicSiteIsReadOnly(), true);
  assert.equal(publicationContract.publicOriginWriteCapability, "forbidden");
  assert.equal(publicationContract.publicReadModel, "published-content-only");
  assert.ok(
    listCmsForbiddenCapabilities().includes("raw HTML injection"),
    "Expected raw HTML injection to remain explicitly forbidden."
  );
});
