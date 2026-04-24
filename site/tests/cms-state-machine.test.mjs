import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDocumentId,
  buildRevisionId,
  canRoleTransitionState,
  canStateEnterPublicReadModel,
  getCmsWorkflow,
  getPublicReadModelState,
  isCmsPublicState,
  listTransitionsFromState
} from "../src/lib/cms/state-machine.js";

test("CMS workflow keeps draft and review states out of the public read model", () => {
  const workflow = getCmsWorkflow();

  assert.equal(getPublicReadModelState(), "published");
  assert.equal(canStateEnterPublicReadModel("draft"), false);
  assert.equal(canStateEnterPublicReadModel("under-review"), false);
  assert.equal(canStateEnterPublicReadModel("scheduled"), false);
  assert.equal(canStateEnterPublicReadModel("published"), true);
  assert.equal(workflow.publicationRules.allowDraftInPublicReadModel, false);
});

test("CMS workflow transition permissions preserve editor and publisher separation", () => {
  assert.equal(
    canRoleTransitionState({
      roleId: "client-editor",
      fromState: "draft",
      toState: "under-review"
    }),
    true
  );
  assert.equal(
    canRoleTransitionState({
      roleId: "client-editor",
      fromState: "under-review",
      toState: "approved"
    }),
    false
  );
  assert.equal(
    canRoleTransitionState({
      roleId: "publisher",
      fromState: "under-review",
      toState: "approved"
    }),
    true
  );
  assert.equal(
    canRoleTransitionState({
      roleId: "publisher",
      fromState: "approved",
      toState: "published"
    }),
    true
  );
});

test("CMS workflow preserves explicit rollback and publication revision ids", () => {
  const documentId = buildDocumentId("route-page", "about");

  assert.equal(documentId, "route-page:about");
  assert.equal(buildRevisionId(documentId, 3), "route-page:about@v3");
  assert.equal(isCmsPublicState("published"), true);
  assert.equal(isCmsPublicState("superseded"), false);
  assert.ok(
    listTransitionsFromState("published").some(
      (transition) => transition.id === "published-to-superseded"
    )
  );
});
