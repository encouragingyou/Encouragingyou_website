import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAdminDocumentEditorModel,
  getAdminReviewPermissions,
  getAdminWorkstream,
  listAdminDocuments,
  listAdminRouteOptions,
  listAdminWorkstreams
} from "../src/lib/cms/admin-portal.js";
import { adminCan } from "../src/lib/cms/admin-session.js";

test("admin portal workstreams stay route-led and recognizable", () => {
  const workstreams = listAdminWorkstreams();
  const homeWorkstream = getAdminWorkstream("home");

  assert.ok(workstreams.length >= 20, "Expected a route-led admin workstream list.");
  assert.ok(homeWorkstream, "Expected the homepage workstream to exist.");
  assert.equal(homeWorkstream.previewRoute, "/");
  assert.ok(
    homeWorkstream.documents.some((document) => document.slug === "home-page-default"),
    "Expected the homepage workstream to link to its CMS document."
  );
});

test("client editors see locked publisher-held fields in sensitive records", () => {
  const contactDocument = listAdminDocuments().find(
    (document) => document.slug === "contact-info-default"
  );

  assert.ok(contactDocument, "Expected the contact information document.");

  const clientEditorModel = buildAdminDocumentEditorModel({
    documentSlug: "contact-info-default",
    roleId: "client-editor"
  });
  const publisherModel = buildAdminDocumentEditorModel({
    documentSlug: "contact-info-default",
    roleId: "publisher"
  });
  const clientEmailField = clientEditorModel.flatFields.find((field) =>
    field.path.toLowerCase().includes("publicemail")
  );
  const publisherEmailField = publisherModel.flatFields.find((field) =>
    field.path.toLowerCase().includes("publicemail")
  );

  assert.equal(clientEmailField?.editable, false);
  assert.match(clientEmailField?.lockReason ?? "", /publisher|identifier|review/i);
  assert.equal(publisherEmailField?.editable, true);
});

test("review access stays capability-driven at the role boundary", () => {
  const clientSession = {
    authenticated: true,
    capabilities: ["create-draft", "request-review"]
  };
  const publisherSession = {
    authenticated: true,
    capabilities: ["approve-content", "publish-content", "revert-content"]
  };

  assert.equal(adminCan(clientSession, "approve-content"), false);
  assert.equal(adminCan(publisherSession, "publish-content"), true);
  assert.equal(getAdminReviewPermissions("client-editor").canApprove, false);
  assert.equal(getAdminReviewPermissions("publisher").canPublish, true);
  assert.ok(
    listAdminRouteOptions().some((option) => option.value === "/contact/"),
    "Expected the structured internal route picker options."
  );
});
