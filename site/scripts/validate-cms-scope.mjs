import { stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

import cmsScope from "../src/content/cmsScope/default.json" with { type: "json" };
import cmsWorkflow from "../src/content/cmsWorkflow/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import cmsMigrationDiffReport from "../src/data/generated/cms-migration-diff-report.json" with { type: "json" };
import cmsPublicReadModel from "../src/data/generated/cms-public-read-model.json" with { type: "json" };
import cmsSchemaCatalog from "../src/data/generated/cms-schema-catalog.json" with { type: "json" };
import cmsWriteModelSeed from "../src/data/generated/cms-write-model-seed.json" with { type: "json" };

const siteRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const knownCollections = new Set([
  "accessibilityStatement",
  "contactInfo",
  "faqs",
  "formSurfaces",
  "homePage",
  "involvementRoutes",
  "mediaLibrary",
  "navigation",
  "privacyNotice",
  "programmePageContent",
  "programmes",
  "routePages",
  "safeguardingInfo",
  "seo",
  "sessionPageContent",
  "sessions",
  "shellConfig",
  "sitePolicy",
  "siteSettings",
  "storageAccess",
  "updatesFeed"
]);

const ownershipIds = new Set(cmsScope.ownershipClasses.map((entry) => entry.id));
const mutationPrimitiveIds = new Set(
  cmsScope.mutationPrimitives.map((entry) => entry.id)
);
const linkPolicyIds = new Set(cmsScope.linkPolicies.map((entry) => entry.id));
const capabilityIds = new Set(cmsScope.capabilities);
const roleIds = new Set(cmsScope.roles.map((role) => role.id));
const knownPageIds = new Set([
  ...pageDefinitions.launchPages.map((page) => page.id),
  ...pageDefinitions.placeholderPages.map((page) => page.id),
  ...pageDefinitions.phaseTwoPages.map((page) => page.id)
]);

const routeIds = new Set();
const coveredLaunchPageIds = new Set();
const workflowStateIds = new Set();
const workflowTransitionIds = new Set();

for (const role of cmsScope.roles) {
  assert(
    !role.can.some((capability) => role.cannot.includes(capability)),
    `${role.id} contains overlapping can/cannot capabilities.`
  );

  for (const capability of [...role.can, ...role.cannot]) {
    assert(
      capabilityIds.has(capability),
      `${role.id} references unknown capability ${capability}.`
    );
  }
}

for (const workflowState of cmsWorkflow.states) {
  assert(
    !workflowStateIds.has(workflowState.id),
    `Duplicate CMS workflow state ${workflowState.id}.`
  );
  workflowStateIds.add(workflowState.id);
}

assert(
  cmsWorkflow.publicationRules.publicReadModelState === "published",
  "The public read model must continue to consume only the published workflow state."
);
assert(
  cmsWorkflow.publicationRules.allowDraftInPublicReadModel === false,
  "Draft revisions must never be available in the public read model."
);
assert(
  cmsWorkflow.publicationRules.allowReviewStateInPublicReadModel === false,
  "Review-state revisions must never be available in the public read model."
);
assert(
  cmsWorkflow.publicationRules.allowScheduledInPublicReadModel === false,
  "Scheduled revisions must never be available in the public read model before publication."
);

for (const transition of cmsWorkflow.transitions) {
  assert(
    !workflowTransitionIds.has(transition.id),
    `Duplicate CMS workflow transition ${transition.id}.`
  );
  workflowTransitionIds.add(transition.id);
  assert(
    workflowStateIds.has(transition.from),
    `${transition.id} references unknown from-state ${transition.from}.`
  );
  assert(
    workflowStateIds.has(transition.to),
    `${transition.id} references unknown to-state ${transition.to}.`
  );

  for (const roleId of transition.roles) {
    assert(roleIds.has(roleId), `${transition.id} references unknown role ${roleId}.`);
  }
}

for (const seedSource of cmsScope.seedSources) {
  assert(
    knownCollections.has(seedSource.contentCollection),
    `${seedSource.id} references unknown content collection ${seedSource.contentCollection}.`
  );

  const normalizedSourcePath = seedSource.sourcePath.includes("*")
    ? seedSource.sourcePath.slice(0, seedSource.sourcePath.indexOf("*"))
    : seedSource.sourcePath;
  const absolutePath = resolve(siteRoot, "..", normalizedSourcePath);
  const sourceStats = await stat(absolutePath).catch(() => null);

  assert(
    sourceStats,
    `${seedSource.id} points to missing source path ${seedSource.sourcePath}.`
  );
}

for (const routeEntry of cmsScope.routeFieldRegistry) {
  assert(
    !routeIds.has(routeEntry.id),
    `Duplicate CMS route registry id ${routeEntry.id}.`
  );
  routeIds.add(routeEntry.id);

  for (const pageId of routeEntry.pageIds) {
    assert(
      knownPageIds.has(pageId),
      `${routeEntry.id} references unknown page id ${pageId}.`
    );
    if (pageDefinitions.launchPages.some((page) => page.id === pageId)) {
      coveredLaunchPageIds.add(pageId);
    }
  }

  for (const collectionId of routeEntry.sourceCollections) {
    assert(
      knownCollections.has(collectionId),
      `${routeEntry.id} references unknown source collection ${collectionId}.`
    );
  }

  const surfaceIds = new Set();

  assert(
    routeEntry.surfaces.length > 0,
    `${routeEntry.id} must define at least one surface.`
  );

  for (const surface of routeEntry.surfaces) {
    assert(
      !surfaceIds.has(surface.id),
      `${routeEntry.id} contains duplicate surface id ${surface.id}.`
    );
    surfaceIds.add(surface.id);

    assert(
      ownershipIds.has(surface.ownershipClass),
      `${routeEntry.id}:${surface.id} uses unknown ownership class ${surface.ownershipClass}.`
    );
    assert(
      mutationPrimitiveIds.has(surface.mutationPrimitiveId),
      `${routeEntry.id}:${surface.id} uses unknown mutation primitive ${surface.mutationPrimitiveId}.`
    );
    assert(
      linkPolicyIds.has(surface.linkPolicyId),
      `${routeEntry.id}:${surface.id} uses unknown link policy ${surface.linkPolicyId}.`
    );

    if (surface.ownershipClass === "client-editable") {
      assert(
        !["external-link-allowlist", "publication-control", "developer-locked"].includes(
          surface.mutationPrimitiveId
        ),
        `${routeEntry.id}:${surface.id} allows client editing of a forbidden mutation primitive.`
      );
      assert(
        !["external-allowlist", "operator-managed"].includes(surface.linkPolicyId),
        `${routeEntry.id}:${surface.id} allows client editing of unrestricted or operator-managed links.`
      );
      assert(
        surface.fields.length > 0,
        `${routeEntry.id}:${surface.id} must declare mutable fields for a client-editable surface.`
      );
    }

    if (surface.ownershipClass === "operator-controlled") {
      assert(
        surface.mutationPrimitiveId !== "developer-locked",
        `${routeEntry.id}:${surface.id} cannot be operator-controlled and developer-locked at the same time.`
      );
      assert(
        surface.fields.length > 0,
        `${routeEntry.id}:${surface.id} must declare mutable fields for an operator-controlled surface.`
      );
    }

    if (surface.ownershipClass === "developer-owned") {
      assert(
        surface.mutationPrimitiveId === "developer-locked",
        `${routeEntry.id}:${surface.id} must use developer-locked when ownership is developer-owned.`
      );
      assert(
        surface.fields.length === 0,
        `${routeEntry.id}:${surface.id} cannot expose mutable fields when ownership is developer-owned.`
      );
      assert(
        surface.linkPolicyId === "none",
        `${routeEntry.id}:${surface.id} cannot expose editable links when ownership is developer-owned.`
      );
    }
  }
}

for (const launchPage of pageDefinitions.launchPages) {
  assert(
    coveredLaunchPageIds.has(launchPage.id),
    `Launch page ${launchPage.id} is missing from the CMS route field registry.`
  );
}

assert(
  cmsScope.adminBoundary.publicOriginWriteCapability === "forbidden",
  "Public origin write capability must stay forbidden."
);
assert(
  cmsScope.adminBoundary.writeOrigin === "separate-secure-origin-required",
  "CMS write origin must remain separate from the public site."
);

const surfaceBindingIds = new Set(
  cmsSchemaCatalog.surfaceBindings.map(
    (binding) => `${binding.routeId}:${binding.surfaceId}`
  )
);

for (const routeEntry of cmsScope.routeFieldRegistry) {
  for (const surface of routeEntry.surfaces) {
    assert(
      surfaceBindingIds.has(`${routeEntry.id}:${surface.id}`),
      `Missing schema catalog binding for ${routeEntry.id}:${surface.id}.`
    );
  }
}

const documentIds = new Set();
const documentTypeIds = new Set(cmsSchemaCatalog.documentTypes.map((type) => type.id));

assert(
  cmsWriteModelSeed.version === cmsSchemaCatalog.version,
  "CMS write-model seed version must match the schema catalog version."
);
assert(
  cmsPublicReadModel.version === cmsSchemaCatalog.version,
  "CMS public read-model version must match the schema catalog version."
);

for (const document of cmsWriteModelSeed.documents) {
  assert(
    !documentIds.has(document.documentId),
    `Duplicate CMS document ${document.documentId}.`
  );
  documentIds.add(document.documentId);
  assert(
    documentTypeIds.has(document.documentTypeId),
    `${document.documentId} references unknown document type ${document.documentTypeId}.`
  );
  assert(
    document.revisions.length > 0,
    `${document.documentId} must contain at least one revision.`
  );

  const currentRevision = document.revisions.find(
    (revision) => revision.revisionId === document.currentPublishedRevisionId
  );

  assert(
    currentRevision,
    `${document.documentId} is missing its current published revision ${document.currentPublishedRevisionId}.`
  );
  assert(
    currentRevision.state === cmsWorkflow.publicationRules.publicReadModelState,
    `${document.documentId} current published revision must be in the published state.`
  );
}

assert(
  cmsPublicReadModel.publicReadModelState ===
    cmsWorkflow.publicationRules.publicReadModelState,
  "Public read-model state must stay aligned with the CMS workflow."
);
assert(
  cmsPublicReadModel.publicationContract.draftVisibility === "forbidden",
  "Public read model must keep draft visibility forbidden."
);
assert(
  cmsMigrationDiffReport.allCollectionsMatchSource,
  "CMS migration diff must match the current published source baseline."
);

console.log(
  `[cms-validate] validated ${cmsScope.routeFieldRegistry.length} route entries, ${cmsScope.seedSources.length} seed sources, ${cmsScope.roles.length} roles, ${cmsWorkflow.states.length} workflow states, and ${cmsWriteModelSeed.documents.length} CMS documents`
);
