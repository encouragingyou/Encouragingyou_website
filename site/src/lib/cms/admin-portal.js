import pageDefinitions from "../../content/pageDefinitions/launch.json" with { type: "json" };
import cmsPublicReadModel from "../../data/generated/cms-public-read-model.json" with { type: "json" };
import cmsSchemaCatalog from "../../data/generated/cms-schema-catalog.json" with { type: "json" };
import cmsWriteModelSeed from "../../data/generated/cms-write-model-seed.json" with { type: "json" };
import { listCmsRouteFieldEntries, roleCan } from "./scope.js";
import { listCmsStates, listTransitionsFromState } from "./state-machine.js";

const publicPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];
const pageIndex = new Map(publicPages.map((page) => [page.id, page]));
const documentTypeIndex = new Map(
  cmsSchemaCatalog.documentTypes.map((documentType) => [documentType.id, documentType])
);
const documentRouteEntries = listCmsRouteFieldEntries();
const routeEntryIndex = new Map(documentRouteEntries.map((entry) => [entry.id, entry]));
const sourceCollections = cmsPublicReadModel.collections;

const clientEditableCollections = new Set([
  "homePage",
  "routePages",
  "programmes",
  "programmePageContent",
  "sessions",
  "sessionPageContent",
  "updatesFeed",
  "faqs",
  "siteSettings",
  "shellConfig",
  "accessibilityStatement"
]);
const operatorCollections = new Set([
  "contactInfo",
  "formSurfaces",
  "privacyNotice",
  "sitePolicy",
  "storageAccess",
  "seo",
  "safeguardingInfo",
  "involvementRoutes",
  "mediaLibrary"
]);

function toTitleCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringUrl(value) {
  return typeof value === "string" && /^(https?:)?\/\//.test(value);
}

function isInternalHref(value) {
  return typeof value === "string" && value.startsWith("/");
}

function inferCollectionFamily(routeEntry) {
  if (routeEntry.id === "global-shell") {
    return "Global";
  }
  if (routeEntry.routePattern.startsWith("/programmes/")) {
    return "Programmes";
  }
  if (routeEntry.routePattern.startsWith("/sessions/")) {
    return "Sessions";
  }
  if (routeEntry.routePattern.startsWith("/events-updates/")) {
    return "Events & updates";
  }
  if (routeEntry.routePattern.startsWith("/get-involved/")) {
    return "Get involved";
  }
  if (routeEntry.routePattern.startsWith("/safeguarding/")) {
    return "Safeguarding";
  }
  if (
    ["/privacy/", "/cookies/", "/accessibility/", "/terms/"].includes(
      routeEntry.routePattern
    )
  ) {
    return "Legal and trust";
  }

  return "Public pages";
}

function resolveDocumentOwnership(document) {
  if (clientEditableCollections.has(document.sourceCollection)) {
    return "client-editable";
  }
  if (operatorCollections.has(document.sourceCollection)) {
    return "operator-controlled";
  }

  return "mixed";
}

function findPreviewPage(routeIds) {
  for (const routeId of routeIds) {
    const routeEntry = routeEntryIndex.get(routeId);

    if (!routeEntry) {
      continue;
    }

    for (const pageId of routeEntry.pageIds) {
      const page = pageIndex.get(pageId);

      if (page) {
        return page;
      }
    }
  }

  return null;
}

function buildExternalLinkAllowlist() {
  const urls = new Map();

  function visit(value) {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (isObject(value)) {
      Object.values(value).forEach(visit);
      return;
    }

    if (!isStringUrl(value)) {
      return;
    }

    const label = new URL(value).hostname.replace(/^www\./, "");

    urls.set(value, {
      value,
      label
    });
  }

  Object.values(sourceCollections).forEach(visit);

  return [...urls.values()].sort((left, right) => left.label.localeCompare(right.label));
}

const externalLinkAllowlist = buildExternalLinkAllowlist();
const internalRouteOptions = [
  ...publicPages.flatMap((page) => [
    {
      value: page.route,
      label: `${page.title} (${page.route})`
    },
    {
      value: page.id,
      label: `${page.title} page id (${page.id})`
    }
  ]),
  ...documentRouteEntries.map((entry) => ({
    value: entry.id,
    label: `${entry.label} route id (${entry.id})`
  }))
].filter(
  (option, index, collection) =>
    collection.findIndex((candidate) => candidate.value === option.value) === index
);

function inferFieldControl({ path, value }) {
  const lowerPath = path.toLowerCase();

  if (
    lowerPath.endsWith("routeid") ||
    lowerPath.endsWith("pageid") ||
    lowerPath.includes("parentpageid")
  ) {
    return {
      type: "internal-route",
      options: internalRouteOptions
    };
  }

  if (isStringUrl(value)) {
    return {
      type: "external-link",
      options: externalLinkAllowlist
    };
  }

  if (isInternalHref(value)) {
    return {
      type: "internal-route",
      options: internalRouteOptions
    };
  }

  if (lowerPath.includes("email")) {
    return {
      type: "email"
    };
  }

  if (
    lowerPath.includes("description") ||
    lowerPath.includes("summary") ||
    lowerPath.includes("intro") ||
    lowerPath.includes("body") ||
    lowerPath.includes("policy") ||
    lowerPath.includes("guidance") ||
    lowerPath.includes("message") ||
    lowerPath.includes("copy") ||
    lowerPath.includes("content") ||
    (typeof value === "string" && value.length > 120)
  ) {
    return {
      type: "textarea"
    };
  }

  return {
    type: "text"
  };
}

function inferMaxLength(path, value) {
  const lowerPath = path.toLowerCase();
  const currentLength = typeof value === "string" ? value.length : 0;

  if (lowerPath.includes("metadescription") || lowerPath.includes("seodescription")) {
    return Math.max(160, currentLength);
  }
  if (lowerPath.includes("alt") || lowerPath.includes("caption")) {
    return Math.max(180, currentLength);
  }
  if (lowerPath.includes("title") || lowerPath.includes("label")) {
    return Math.max(120, currentLength);
  }
  if (
    lowerPath.includes("description") ||
    lowerPath.includes("summary") ||
    lowerPath.includes("intro") ||
    lowerPath.includes("body") ||
    lowerPath.includes("policy") ||
    (typeof value === "string" && value.length > 120)
  ) {
    return Math.max(5000, currentLength);
  }

  return Math.max(280, currentLength);
}

function inferHelperText(controlType) {
  switch (controlType) {
    case "textarea":
      return "Long-form copy only. Layout, spacing, and section order are locked.";
    case "internal-route":
      return "Choose from existing public routes only. New routes stay developer-owned.";
    case "external-link":
      return "External destinations come from the operator allowlist. Free URL entry is intentionally blocked.";
    case "email":
      return "Public contact identifiers are reviewed carefully before publication.";
    default:
      return "Plain text only. No custom markup, styling, or embeds.";
  }
}

function classifyFieldEditability({ document, roleId, value, controlType }) {
  if (typeof value !== "string") {
    return {
      editable: false,
      lockReason: "This field is structural or non-text content and stays locked."
    };
  }

  if (
    roleId === "client-editor" &&
    resolveDocumentOwnership(document) !== "client-editable"
  ) {
    return {
      editable: false,
      lockReason:
        "This surface affects trust, routing, legal accuracy, or publication state and requires a publisher."
    };
  }

  if (
    roleId === "client-editor" &&
    ["internal-route", "external-link", "email"].includes(controlType)
  ) {
    return {
      editable: false,
      lockReason:
        "Links, destinations, and public identifiers are intentionally held behind publisher review."
    };
  }

  return {
    editable: true,
    lockReason: null
  };
}

function buildLeafField({
  document,
  roleId,
  path,
  sectionKey,
  value,
  repeatablePath = null,
  repeatableIndex = null
}) {
  const label = toTitleCase(path.split(".").at(-1) ?? path);
  const control = inferFieldControl({ path, value });
  const editability = classifyFieldEditability({
    document,
    roleId,
    value,
    controlType: control.type
  });

  return {
    id: `${document.documentId}:${path}`,
    path,
    label,
    sectionKey,
    sectionLabel: toTitleCase(sectionKey),
    value: value ?? "",
    initialValue: value ?? "",
    controlType: control.type,
    options: control.options ?? [],
    helperText: inferHelperText(control.type),
    maxLength: inferMaxLength(path, value),
    editable: editability.editable,
    lockReason: editability.lockReason,
    repeatablePath,
    repeatableIndex,
    required: typeof value === "string" && value.length > 0
  };
}

function collectFieldDescriptors({
  document,
  roleId,
  value,
  path = "",
  sectionKey,
  fields = []
}) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      const itemPath = path ? `${path}.${index}` : `${index}`;

      if (isObject(item) || Array.isArray(item)) {
        collectFieldDescriptors({
          document,
          roleId,
          value: item,
          path: itemPath,
          sectionKey,
          fields
        });
        return;
      }

      fields.push(
        buildLeafField({
          document,
          roleId,
          path: itemPath,
          sectionKey,
          value: item,
          repeatablePath: path,
          repeatableIndex: index
        })
      );
    });

    return fields;
  }

  if (isObject(value)) {
    for (const [key, nestedValue] of Object.entries(value)) {
      const nestedPath = path ? `${path}.${key}` : key;

      if (Array.isArray(nestedValue)) {
        collectFieldDescriptors({
          document,
          roleId,
          value: nestedValue,
          path: nestedPath,
          sectionKey,
          fields
        });
        continue;
      }

      if (isObject(nestedValue)) {
        collectFieldDescriptors({
          document,
          roleId,
          value: nestedValue,
          path: nestedPath,
          sectionKey,
          fields
        });
        continue;
      }

      fields.push(
        buildLeafField({
          document,
          roleId,
          path: nestedPath,
          sectionKey,
          value: nestedValue
        })
      );
    }

    return fields;
  }

  fields.push(
    buildLeafField({
      document,
      roleId,
      path,
      sectionKey,
      value
    })
  );

  return fields;
}

function groupFieldsIntoSections(fields) {
  const sectionOrder = [];
  const sectionMap = new Map();

  for (const field of fields) {
    if (!sectionMap.has(field.sectionKey)) {
      sectionOrder.push(field.sectionKey);
      sectionMap.set(field.sectionKey, []);
    }

    sectionMap.get(field.sectionKey).push(field);
  }

  return sectionOrder.map((sectionKey) => {
    const sectionFields = sectionMap.get(sectionKey) ?? [];
    const repeatableGroups = new Map();

    for (const field of sectionFields) {
      if (!field.repeatablePath) {
        continue;
      }

      const groupKey = field.repeatablePath;

      if (!repeatableGroups.has(groupKey)) {
        repeatableGroups.set(groupKey, {
          id: groupKey,
          label: toTitleCase(groupKey.split(".").at(-1) ?? groupKey),
          items: new Map()
        });
      }

      const group = repeatableGroups.get(groupKey);
      const itemKey = String(field.repeatableIndex ?? 0);

      if (!group.items.has(itemKey)) {
        group.items.set(itemKey, {
          index: field.repeatableIndex ?? 0,
          fields: []
        });
      }

      group.items.get(itemKey).fields.push(field);
    }

    return {
      id: sectionKey,
      label: toTitleCase(sectionKey),
      fields: sectionFields.filter((field) => !field.repeatablePath),
      repeatableGroups: [...repeatableGroups.values()].map((group) => ({
        id: group.id,
        label: group.label,
        items: [...group.items.values()].sort((left, right) => left.index - right.index)
      }))
    };
  });
}

const adminDocuments = cmsWriteModelSeed.documents.map((document) => {
  const previewPage = findPreviewPage(document.routeIds);
  const title = document.title ?? toTitleCase(document.recordKey ?? document.documentId);

  return {
    ...document,
    slug: slugify(document.documentId),
    title,
    documentType: documentTypeIndex.get(document.documentTypeId) ?? null,
    previewPage,
    previewRoute: previewPage?.route ?? null,
    currentPublishedRevision: document.revisions.find(
      (revision) => revision.revisionId === document.currentPublishedRevisionId
    ),
    ownership: resolveDocumentOwnership(document)
  };
});

const adminDocumentIndex = new Map(
  adminDocuments.map((document) => [document.documentId, document])
);
const adminDocumentSlugIndex = new Map(
  adminDocuments.map((document) => [document.slug, document])
);

const adminWorkstreams = documentRouteEntries
  .map((routeEntry) => {
    const linkedDocuments = adminDocuments.filter((document) =>
      document.routeIds.includes(routeEntry.id)
    );
    const editableSurfaces = routeEntry.surfaces.filter(
      (surface) => surface.ownershipClass === "client-editable"
    );
    const operatorSurfaces = routeEntry.surfaces.filter(
      (surface) => surface.ownershipClass === "operator-controlled"
    );
    const lockedSurfaces = routeEntry.surfaces.filter(
      (surface) => surface.ownershipClass === "developer-owned"
    );
    const previewPage =
      routeEntry.pageIds.map((pageId) => pageIndex.get(pageId)).find(Boolean) ?? null;

    return {
      id: routeEntry.id,
      label: routeEntry.label,
      family: inferCollectionFamily(routeEntry),
      routePattern: routeEntry.routePattern,
      pageIds: routeEntry.pageIds,
      previewRoute: previewPage?.route ?? null,
      previewPageTitle: previewPage?.title ?? "Global surface",
      sourceCollections: routeEntry.sourceCollections,
      documents: linkedDocuments.map((document) => ({
        documentId: document.documentId,
        documentTypeId: document.documentTypeId,
        slug: document.slug,
        title: document.title ?? toTitleCase(document.recordKey ?? document.documentId),
        sourceCollection: document.sourceCollection,
        ownership: document.ownership
      })),
      editableSurfaceCount: editableSurfaces.length,
      operatorSurfaceCount: operatorSurfaces.length,
      lockedSurfaceCount: lockedSurfaces.length,
      editableSurfaces,
      operatorSurfaces,
      lockedSurfaces
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

const adminWorkstreamIndex = new Map(
  adminWorkstreams.map((workstream) => [workstream.id, workstream])
);

export function listAdminRouteOptions() {
  return internalRouteOptions;
}

export function listAdminExternalLinkOptions() {
  return externalLinkAllowlist;
}

export function listAdminDocuments() {
  return adminDocuments;
}

export function getAdminDocument(documentId) {
  return adminDocumentIndex.get(documentId) ?? null;
}

export function getAdminDocumentBySlug(documentSlug) {
  return adminDocumentSlugIndex.get(documentSlug) ?? null;
}

export function listAdminWorkstreams() {
  return adminWorkstreams;
}

export function getAdminWorkstream(routeId) {
  return adminWorkstreamIndex.get(routeId) ?? null;
}

export function listAdminWorkstreamFamilies() {
  return [...new Set(adminWorkstreams.map((workstream) => workstream.family))];
}

export function getAdminDashboard(roleId) {
  return {
    workstreamCount: adminWorkstreams.length,
    documentCount: adminDocuments.length,
    editableDocumentCount: adminDocuments.filter(
      (document) =>
        document.ownership === "client-editable" ||
        roleCan(roleId, "edit-operator-fields")
    ).length,
    lockedSurfaceCount: adminWorkstreams.reduce(
      (count, workstream) => count + workstream.lockedSurfaceCount,
      0
    ),
    pendingApprovalEnabled: roleCan(roleId, "approve-content"),
    stateLabels: listCmsStates().map((state) => ({
      id: state.id,
      label: state.label,
      publicVisible: state.publicVisible
    }))
  };
}

export function buildAdminDocumentEditorModel({ documentSlug, roleId }) {
  const document = getAdminDocumentBySlug(documentSlug);

  if (!document) {
    return null;
  }

  const linkedWorkstreams = document.routeIds
    .map((routeId) => getAdminWorkstream(routeId))
    .filter(Boolean);
  const publishedContent = clone(document.currentPublishedRevision?.content ?? {});
  const topLevelEntries = isObject(publishedContent)
    ? Object.entries(publishedContent)
    : [["content", publishedContent]];
  const flatFields = topLevelEntries.flatMap(([sectionKey, value]) =>
    collectFieldDescriptors({
      document,
      roleId,
      value,
      path: sectionKey,
      sectionKey
    })
  );

  return {
    documentId: document.documentId,
    documentSlug: document.slug,
    title: document.title ?? toTitleCase(document.recordKey ?? document.documentId),
    documentTypeTitle:
      document.documentType?.title ?? toTitleCase(document.documentTypeId),
    sourceCollection: document.sourceCollection,
    ownership: document.ownership,
    previewRoute: document.previewRoute,
    previewPageTitle: document.previewPage?.title ?? "Preview surface",
    currentPublishedRevisionId: document.currentPublishedRevisionId,
    currentPublishedVersion: document.currentPublishedRevision?.version ?? 1,
    baselinePublishedAt: document.currentPublishedRevision?.publishedAt ?? null,
    baselineSummary: document.currentPublishedRevision?.changeSummary ?? null,
    sections: groupFieldsIntoSections(flatFields),
    flatFields,
    linkedWorkstreams: linkedWorkstreams.map((workstream) => ({
      id: workstream.id,
      label: workstream.label,
      routePattern: workstream.routePattern,
      previewRoute: workstream.previewRoute,
      lockedSurfaces: workstream.lockedSurfaces
    })),
    workflowActions: listTransitionsFromState("draft").filter((transition) =>
      transition.roles.includes(roleId)
    ),
    publishActions: ["under-review", "approved", "scheduled"].flatMap((stateId) =>
      listTransitionsFromState(stateId).filter((transition) =>
        transition.roles.includes(roleId)
      )
    )
  };
}

export function getAdminReviewPermissions(roleId) {
  return {
    canApprove: roleCan(roleId, "approve-content"),
    canPublish: roleCan(roleId, "publish-content"),
    canRevert: roleCan(roleId, "revert-content")
  };
}
