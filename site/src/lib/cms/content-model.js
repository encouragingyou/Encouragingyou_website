import { createHash } from "node:crypto";

import accessibilityStatement from "../../content/accessibilityStatement/default.json" with { type: "json" };
import cmsScope from "../../content/cmsScope/default.json" with { type: "json" };
import cmsWorkflow from "../../content/cmsWorkflow/default.json" with { type: "json" };
import contactInfo from "../../content/contactInfo/default.json" with { type: "json" };
import faqs from "../../content/faqs/default.json" with { type: "json" };
import formSurfaces from "../../content/formSurfaces/default.json" with { type: "json" };
import homePage from "../../content/homePage/default.json" with { type: "json" };
import involvementRoutes from "../../content/involvementRoutes/default.json" with { type: "json" };
import mediaLibrary from "../../content/mediaLibrary/default.json" with { type: "json" };
import privacyNotice from "../../content/privacyNotice/default.json" with { type: "json" };
import programmePageContent from "../../content/programmePageContent/default.json" with { type: "json" };
import careerSupport from "../../content/programmes/career-support-cv-help.json" with { type: "json" };
import communityFriendship from "../../content/programmes/community-friendship.json" with { type: "json" };
import communitySupport from "../../content/programmes/community-support-intergenerational-connection.json" with { type: "json" };
import personalGrowth from "../../content/programmes/personal-growth-life-skills.json" with { type: "json" };
import routePages from "../../content/routePages/default.json" with { type: "json" };
import safeguardingInfo from "../../content/safeguardingInfo/default.json" with { type: "json" };
import seo from "../../content/seo/default.json" with { type: "json" };
import sessionPageContent from "../../content/sessionPageContent/default.json" with { type: "json" };
import cvSupport from "../../content/sessions/cv-support.json" with { type: "json" };
import youthClub from "../../content/sessions/youth-club.json" with { type: "json" };
import shellConfig from "../../content/shellConfig/default.json" with { type: "json" };
import sitePolicy from "../../content/sitePolicy/default.json" with { type: "json" };
import siteSettings from "../../content/siteSettings/default.json" with { type: "json" };
import storageAccess from "../../content/storageAccess/default.json" with { type: "json" };
import updatesFeed from "../../content/updatesFeed/default.json" with { type: "json" };
import {
  buildDocumentId,
  buildRevisionId,
  getPublicReadModelState
} from "./state-machine.js";

export const CMS_ARTIFACT_VERSION = "2026-04-24";
export const CMS_BASELINE_IMPORTED_AT = "2026-04-24T00:00:00.000Z";
export const CMS_BASELINE_ACTOR = "system:prompt-52-import";

const publicProgrammes = [
  communityFriendship,
  personalGrowth,
  careerSupport,
  communitySupport
];
const publicSessions = [cvSupport, youthClub];

const routeIdsByPageId = new Map();

for (const routeEntry of cmsScope.routeFieldRegistry) {
  for (const pageId of routeEntry.pageIds) {
    const existing = routeIdsByPageId.get(pageId) ?? [];
    existing.push(routeEntry.id);
    routeIdsByPageId.set(pageId, existing);
  }
}

function hashContent(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function inferSemanticGroup(fieldSelector) {
  const selector = fieldSelector.toLowerCase();

  if (selector.includes("seo") || selector.includes("meta")) {
    return "metadata";
  }
  if (
    selector.includes("alt") ||
    selector.includes("caption") ||
    selector.includes("media")
  ) {
    return "media";
  }
  if (selector.includes("faq")) {
    return "faq";
  }
  if (
    selector.includes("privacy") ||
    selector.includes("policy") ||
    selector.includes("legal")
  ) {
    return "legal";
  }
  if (
    selector.includes("schedule") ||
    selector.includes("calendar") ||
    selector.includes("location")
  ) {
    return "operational";
  }
  if (
    selector.includes("cta") ||
    selector.includes("action") ||
    selector.includes("link")
  ) {
    return "calls-to-action";
  }
  if (
    selector.includes("trust") ||
    selector.includes("safeguarding") ||
    selector.includes("proof")
  ) {
    return "trust";
  }
  if (
    selector.includes("intro") ||
    selector.includes("summary") ||
    selector.includes("title")
  ) {
    return "intro";
  }

  return "content";
}

function describeFieldValue(value) {
  if (value === null) {
    return {
      type: "null",
      required: false,
      defaultValue: null
    };
  }

  if (Array.isArray(value)) {
    return {
      type: "array",
      required: true,
      defaultValue: clone(value),
      itemSchema: value.length > 0 ? describeFieldValue(value[0]) : { type: "unknown" }
    };
  }

  if (typeof value === "object") {
    return {
      type: "object",
      required: true,
      fields: Object.fromEntries(
        Object.entries(value).map(([key, nestedValue]) => [
          key,
          describeFieldValue(nestedValue)
        ])
      )
    };
  }

  if (typeof value === "string") {
    return {
      type: "string",
      required: true,
      defaultValue: value,
      maxObservedLength: value.length
    };
  }

  return {
    type: typeof value,
    required: true,
    defaultValue: value
  };
}

function buildRevision(documentId, content) {
  const version = 1;
  const revisionId = buildRevisionId(documentId, version);

  return {
    revisionId,
    version,
    state: getPublicReadModelState(),
    createdAt: CMS_BASELINE_IMPORTED_AT,
    createdBy: CMS_BASELINE_ACTOR,
    approvedAt: CMS_BASELINE_IMPORTED_AT,
    approvedBy: CMS_BASELINE_ACTOR,
    publishedAt: CMS_BASELINE_IMPORTED_AT,
    publishedBy: CMS_BASELINE_ACTOR,
    changeSummary: "Imported from the Prompt 50 launch baseline.",
    publishNote: "Seeded into the CMS write model as the current published baseline.",
    contentHash: hashContent(content),
    content: clone(content)
  };
}

function buildDocument(definition, record) {
  const documentId = buildDocumentId(definition.id, record.recordKey);
  const revision = buildRevision(documentId, record.content);

  return {
    documentId,
    documentTypeId: definition.id,
    sourceCollection: definition.sourceCollection,
    schemaRef: definition.schemaRef,
    publicationTarget: definition.publication,
    routeIds: record.routeIds,
    recordKey: record.recordKey,
    title: record.title,
    sortOrder: record.sortOrder,
    currentPublishedRevisionId: revision.revisionId,
    latestRevisionId: revision.revisionId,
    revisions: [revision]
  };
}

function buildDocumentDefinitions() {
  return [
    {
      id: "site-settings",
      title: "Site settings",
      sourceCollection: "siteSettings",
      schemaRef: "site/src/content/config.ts#siteSettings",
      publication: { collectionName: "siteSettings", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["global-shell"],
            title: "Site settings",
            sortOrder: 0,
            content: siteSettings
          }
        ];
      }
    },
    {
      id: "shell-config",
      title: "Shell configuration",
      sourceCollection: "shellConfig",
      schemaRef: "site/src/content/config.ts#shellConfig",
      publication: { collectionName: "shellConfig", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["global-shell"],
            title: "Global shell",
            sortOrder: 0,
            content: shellConfig
          }
        ];
      }
    },
    {
      id: "contact-info",
      title: "Contact information",
      sourceCollection: "contactInfo",
      schemaRef: "site/src/content/config.ts#contactInfo",
      publication: { collectionName: "contactInfo", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["global-shell", "contact"],
            title: "Contact information",
            sortOrder: 0,
            content: contactInfo
          }
        ];
      }
    },
    {
      id: "home-page",
      title: "Homepage content",
      sourceCollection: "homePage",
      schemaRef: "site/src/content/config.ts#homePage",
      publication: { collectionName: "homePage", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["home"],
            title: "Homepage",
            sortOrder: 0,
            content: homePage
          }
        ];
      }
    },
    {
      id: "route-page",
      title: "Route page",
      sourceCollection: "routePages",
      schemaRef: "site/src/content/config.ts#routePages.pages[*]",
      publication: { collectionName: "routePages", kind: "list-item", path: ["pages"] },
      extractRecords() {
        return routePages.pages.map((page, index) => ({
          recordKey: page.pageId,
          routeIds: routeIdsByPageId.get(page.pageId) ?? [],
          title: page.pageId,
          sortOrder: index,
          content: page
        }));
      }
    },
    {
      id: "programme",
      title: "Programme",
      sourceCollection: "programmes",
      schemaRef: "site/src/content/config.ts#programmes",
      publication: { collectionName: "programmes", kind: "list-item", path: ["items"] },
      extractRecords() {
        return publicProgrammes.map((programme, index) => ({
          recordKey: programme.slug,
          routeIds: ["programmes-index", `programme-${programme.slug}`],
          title: programme.title,
          sortOrder: index,
          content: programme
        }));
      }
    },
    {
      id: "programme-page-defaults",
      title: "Programme page defaults",
      sourceCollection: "programmePageContent",
      schemaRef: "site/src/content/config.ts#programmePageContent.defaults",
      publication: {
        collectionName: "programmePageContent",
        kind: "singleton-fragment",
        path: ["defaults"]
      },
      extractRecords() {
        return [
          {
            recordKey: "defaults",
            routeIds: [
              "programme-community-friendship",
              "programme-personal-growth-life-skills",
              "programme-career-support-cv-help",
              "programme-community-support-intergenerational-connection"
            ],
            title: "Programme page defaults",
            sortOrder: 0,
            content: programmePageContent.defaults
          }
        ];
      }
    },
    {
      id: "programme-page",
      title: "Programme page content",
      sourceCollection: "programmePageContent",
      schemaRef: "site/src/content/config.ts#programmePageContent.pages[*]",
      publication: {
        collectionName: "programmePageContent",
        kind: "list-item",
        path: ["pages"]
      },
      extractRecords() {
        return programmePageContent.pages.map((page, index) => ({
          recordKey: page.pageId,
          routeIds: routeIdsByPageId.get(page.pageId) ?? [],
          title: page.pageId,
          sortOrder: index,
          content: page
        }));
      }
    },
    {
      id: "session",
      title: "Session",
      sourceCollection: "sessions",
      schemaRef: "site/src/content/config.ts#sessions",
      publication: { collectionName: "sessions", kind: "list-item", path: ["items"] },
      extractRecords() {
        return publicSessions.map((session, index) => ({
          recordKey: session.slug,
          routeIds: ["sessions-index", `session-${session.slug}`],
          title: session.name,
          sortOrder: index,
          content: session
        }));
      }
    },
    {
      id: "session-page",
      title: "Session page content",
      sourceCollection: "sessionPageContent",
      schemaRef: "site/src/content/config.ts#sessionPageContent.pages[*]",
      publication: {
        collectionName: "sessionPageContent",
        kind: "list-item",
        path: ["pages"]
      },
      extractRecords() {
        return sessionPageContent.pages.map((page, index) => ({
          recordKey: page.pageId,
          routeIds: routeIdsByPageId.get(page.pageId) ?? [],
          title: page.pageId,
          sortOrder: index,
          content: page
        }));
      }
    },
    {
      id: "updates-feed-config",
      title: "Updates feed configuration",
      sourceCollection: "updatesFeed",
      schemaRef: "site/src/content/config.ts#updatesFeed",
      publication: {
        collectionName: "updatesFeed",
        kind: "singleton-fragment",
        path: []
      },
      extractRecords() {
        const config = { ...updatesFeed };

        delete config.items;

        return [
          {
            recordKey: "default",
            routeIds: ["events-updates-index"],
            title: "Updates feed configuration",
            sortOrder: 0,
            content: config
          }
        ];
      }
    },
    {
      id: "editorial-item",
      title: "Editorial feed item",
      sourceCollection: "updatesFeed",
      schemaRef: "site/src/content/config.ts#updatesFeed.items[*]",
      publication: { collectionName: "updatesFeed", kind: "list-item", path: ["items"] },
      extractRecords() {
        return updatesFeed.items.map((item, index) => ({
          recordKey: item.id,
          routeIds: ["events-updates-index", "events-updates-detail-items"],
          title: item.title,
          sortOrder: index,
          content: item
        }));
      }
    },
    {
      id: "faq-group",
      title: "FAQ group",
      sourceCollection: "faqs",
      schemaRef: "site/src/content/config.ts#faqs.groups[*]",
      publication: { collectionName: "faqs", kind: "list-item", path: ["groups"] },
      extractRecords() {
        return faqs.groups.map((group, index) => ({
          recordKey: group.id,
          routeIds: [],
          title: group.id,
          sortOrder: index,
          content: group
        }));
      }
    },
    {
      id: "form-surface",
      title: "Form surface",
      sourceCollection: "formSurfaces",
      schemaRef: "site/src/content/config.ts#formSurfaces.surfaces[*]",
      publication: {
        collectionName: "formSurfaces",
        kind: "list-item",
        path: ["surfaces"]
      },
      extractRecords() {
        return formSurfaces.surfaces.map((surface, index) => ({
          recordKey: surface.id,
          routeIds: [],
          title: surface.id,
          sortOrder: index,
          content: surface
        }));
      }
    },
    {
      id: "privacy-notice",
      title: "Privacy notice",
      sourceCollection: "privacyNotice",
      schemaRef: "site/src/content/config.ts#privacyNotice",
      publication: { collectionName: "privacyNotice", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["privacy"],
            title: "Privacy notice",
            sortOrder: 0,
            content: privacyNotice
          }
        ];
      }
    },
    {
      id: "accessibility-statement",
      title: "Accessibility statement",
      sourceCollection: "accessibilityStatement",
      schemaRef: "site/src/content/config.ts#accessibilityStatement",
      publication: {
        collectionName: "accessibilityStatement",
        kind: "singleton",
        path: []
      },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["accessibility"],
            title: "Accessibility statement",
            sortOrder: 0,
            content: accessibilityStatement
          }
        ];
      }
    },
    {
      id: "site-policy",
      title: "Site policy",
      sourceCollection: "sitePolicy",
      schemaRef: "site/src/content/config.ts#sitePolicy",
      publication: { collectionName: "sitePolicy", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["terms"],
            title: "Site policy",
            sortOrder: 0,
            content: sitePolicy
          }
        ];
      }
    },
    {
      id: "storage-access",
      title: "Storage access notice",
      sourceCollection: "storageAccess",
      schemaRef: "site/src/content/config.ts#storageAccess",
      publication: { collectionName: "storageAccess", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["cookies"],
            title: "Storage access",
            sortOrder: 0,
            content: storageAccess
          }
        ];
      }
    },
    {
      id: "seo-defaults",
      title: "SEO defaults",
      sourceCollection: "seo",
      schemaRef: "site/src/content/config.ts#seo.defaults",
      publication: {
        collectionName: "seo",
        kind: "singleton-fragment",
        path: ["defaults"]
      },
      extractRecords() {
        return [
          {
            recordKey: "defaults",
            routeIds: ["global-shell"],
            title: "SEO defaults",
            sortOrder: 0,
            content: seo.defaults
          }
        ];
      }
    },
    {
      id: "seo-page-directive",
      title: "SEO page directive",
      sourceCollection: "seo",
      schemaRef: "site/src/content/config.ts#seo.pageDirectives[*]",
      publication: { collectionName: "seo", kind: "list-item", path: ["pageDirectives"] },
      extractRecords() {
        return seo.pageDirectives.map((directive, index) => ({
          recordKey: directive.pageId,
          routeIds: routeIdsByPageId.get(directive.pageId) ?? [],
          title: directive.pageId,
          sortOrder: index,
          content: directive
        }));
      }
    },
    {
      id: "media-library-meta",
      title: "Media library metadata",
      sourceCollection: "mediaLibrary",
      schemaRef: "site/src/content/config.ts#mediaLibrary",
      publication: {
        collectionName: "mediaLibrary",
        kind: "singleton-fragment",
        path: []
      },
      extractRecords() {
        const config = { ...mediaLibrary };

        delete config.assets;

        return [
          {
            recordKey: "default",
            routeIds: [],
            title: "Media library metadata",
            sortOrder: 0,
            content: config
          }
        ];
      }
    },
    {
      id: "media-asset-annotation",
      title: "Media asset annotation",
      sourceCollection: "mediaLibrary",
      schemaRef: "site/src/content/config.ts#mediaLibrary.assets[*]",
      publication: {
        collectionName: "mediaLibrary",
        kind: "list-item",
        path: ["assets"]
      },
      extractRecords() {
        return mediaLibrary.assets.map((asset, index) => ({
          recordKey: asset.id,
          routeIds: [],
          title: asset.id,
          sortOrder: index,
          content: asset
        }));
      }
    },
    {
      id: "safeguarding-info",
      title: "Safeguarding information",
      sourceCollection: "safeguardingInfo",
      schemaRef: "site/src/content/config.ts#safeguardingInfo",
      publication: { collectionName: "safeguardingInfo", kind: "singleton", path: [] },
      extractRecords() {
        return [
          {
            recordKey: "default",
            routeIds: ["safeguarding-hub", "safeguarding-child", "safeguarding-adult"],
            title: "Safeguarding information",
            sortOrder: 0,
            content: safeguardingInfo
          }
        ];
      }
    },
    {
      id: "involvement-route",
      title: "Involvement route",
      sourceCollection: "involvementRoutes",
      schemaRef: "site/src/content/config.ts#involvementRoutes.routes[*]",
      publication: {
        collectionName: "involvementRoutes",
        kind: "list-item",
        path: ["routes"]
      },
      extractRecords() {
        return involvementRoutes.routes.map((route, index) => ({
          recordKey: route.id,
          routeIds: ["get-involved", "volunteer", "partner"],
          title: route.id,
          sortOrder: index,
          content: route
        }));
      }
    }
  ];
}

const documentDefinitions = buildDocumentDefinitions();
const documentDefinitionsById = new Map(
  documentDefinitions.map((definition) => [definition.id, definition])
);
const documentTypeIdsByCollection = new Map();

for (const definition of documentDefinitions) {
  const collectionDefinitions =
    documentTypeIdsByCollection.get(definition.sourceCollection) ?? [];
  collectionDefinitions.push(definition.id);
  documentTypeIdsByCollection.set(definition.sourceCollection, collectionDefinitions);
}

function getDocumentDefinition(documentTypeId) {
  return documentDefinitionsById.get(documentTypeId) ?? null;
}

function setNestedPublicationValue(target, path, kind, value, sortOrder) {
  if (path.length === 0) {
    if (kind === "singleton") {
      return clone(value);
    }

    if (kind === "singleton-fragment") {
      return { ...(target ?? {}), ...clone(value) };
    }

    throw new Error(`Unsupported root publication kind ${kind}.`);
  }

  const [key] = path;
  const nextTarget = target ?? {};

  if (kind === "list-item") {
    const existing = nextTarget[key] ?? [];
    existing.push({ sortOrder, value: clone(value) });
    return { ...nextTarget, [key]: existing };
  }

  if (kind === "singleton-fragment") {
    return {
      ...nextTarget,
      [key]: { ...(nextTarget[key] ?? {}), ...clone(value) }
    };
  }

  return { ...nextTarget, [key]: clone(value) };
}

export function listCmsDocumentTypeDefinitions() {
  return documentDefinitions;
}

export function buildCmsSeedDocuments() {
  return documentDefinitions.flatMap((definition) =>
    definition.extractRecords().map((record) => buildDocument(definition, record))
  );
}

export function buildCmsSchemaCatalog() {
  const mutationPrimitiveIndex = new Map(
    cmsScope.mutationPrimitives.map((primitive) => [primitive.id, primitive])
  );

  return {
    version: CMS_ARTIFACT_VERSION,
    scopeVersion: cmsScope.version,
    workflowVersion: cmsWorkflow.version,
    generatedFromPrompt: 52,
    generatedAt: CMS_BASELINE_IMPORTED_AT,
    publicationStrategy: cmsWorkflow.publicationRules.publishStrategy,
    documentTypes: documentDefinitions.map((definition) => {
      const sampleRecord = definition.extractRecords()[0] ?? null;

      return {
        id: definition.id,
        title: definition.title,
        sourceCollection: definition.sourceCollection,
        schemaRef: definition.schemaRef,
        publicationTarget: definition.publication,
        recordStrategy:
          definition.publication.kind === "list-item" ? "many-records" : "single-record",
        fieldSchemaSample: sampleRecord ? describeFieldValue(sampleRecord.content) : null
      };
    }),
    surfaceBindings: cmsScope.routeFieldRegistry.flatMap((routeEntry) =>
      routeEntry.surfaces.map((surface) => {
        const primitive = mutationPrimitiveIndex.get(surface.mutationPrimitiveId);

        return {
          routeId: routeEntry.id,
          routeLabel: routeEntry.label,
          routePattern: routeEntry.routePattern,
          pageIds: routeEntry.pageIds,
          surfaceId: surface.id,
          surfaceLabel: surface.label,
          ownershipClass: surface.ownershipClass,
          mutationPrimitiveId: surface.mutationPrimitiveId,
          linkPolicyId: surface.linkPolicyId,
          sourceCollections: routeEntry.sourceCollections,
          sourceRef: surface.sourceRef,
          documentTypeIds: routeEntry.sourceCollections.flatMap(
            (collectionId) => documentTypeIdsByCollection.get(collectionId) ?? []
          ),
          fieldCatalog: surface.fields.map((fieldSelector) => ({
            selector: fieldSelector,
            semanticGroup: inferSemanticGroup(fieldSelector),
            validationProfile: {
              primitiveId: surface.mutationPrimitiveId,
              maxLength: primitive?.maxLength ?? null,
              allowedFormatting: primitive?.allowedFormatting ?? [],
              linkPolicyId: surface.linkPolicyId
            },
            defaultingStrategy: "seed-from-current-published-baseline"
          }))
        };
      })
    )
  };
}

export function buildCmsPublishedCollections(seedDocuments = buildCmsSeedDocuments()) {
  let collections = {};

  for (const document of seedDocuments) {
    const definition = getDocumentDefinition(document.documentTypeId);
    const publishedRevision = document.revisions.find(
      (revision) => revision.revisionId === document.currentPublishedRevisionId
    );

    if (!definition || !publishedRevision) {
      continue;
    }

    collections = {
      ...collections,
      [definition.publication.collectionName]: setNestedPublicationValue(
        collections[definition.publication.collectionName],
        definition.publication.path,
        definition.publication.kind,
        publishedRevision.content,
        document.sortOrder
      )
    };
  }

  for (const collectionValue of Object.values(collections)) {
    if (collectionValue && typeof collectionValue === "object") {
      for (const [key, nestedValue] of Object.entries(collectionValue)) {
        if (
          Array.isArray(nestedValue) &&
          nestedValue.every(
            (item) => item && typeof item === "object" && "sortOrder" in item
          )
        ) {
          collectionValue[key] = nestedValue
            .slice()
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((item) => item.value);
        }
      }
    }
  }

  return {
    version: CMS_ARTIFACT_VERSION,
    generatedAt: CMS_BASELINE_IMPORTED_AT,
    scopeVersion: cmsScope.version,
    workflowVersion: cmsWorkflow.version,
    publicReadModelState: getPublicReadModelState(),
    publicationContract: {
      strategy: cmsWorkflow.publicationRules.publishStrategy,
      draftVisibility: "forbidden",
      previewMode: cmsWorkflow.publicationRules.previewMode
    },
    collections
  };
}

function buildComparableSourceCollections() {
  const { items: updateItems, ...updatesConfig } = updatesFeed;

  return {
    siteSettings,
    shellConfig,
    contactInfo,
    homePage,
    routePages,
    programmes: {
      items: publicProgrammes
    },
    programmePageContent,
    sessions: {
      items: publicSessions
    },
    sessionPageContent,
    updatesFeed: {
      ...updatesConfig,
      items: updateItems
    },
    faqs,
    formSurfaces,
    privacyNotice,
    accessibilityStatement,
    sitePolicy,
    storageAccess,
    seo,
    mediaLibrary,
    safeguardingInfo,
    involvementRoutes
  };
}

export function buildCmsMigrationDiffReport(
  publicReadModel = buildCmsPublishedCollections()
) {
  const sourceCollections = buildComparableSourceCollections();
  const collectionNames = Object.keys(sourceCollections);
  const collectionDiffs = collectionNames.map((collectionName) => {
    const sourceValue = sourceCollections[collectionName];
    const publishedValue = publicReadModel.collections[collectionName];
    const sourceFingerprint = hashContent(sourceValue);
    const publishedFingerprint = hashContent(publishedValue);

    return {
      collectionName,
      sourceFingerprint,
      publishedFingerprint,
      matchesSource: sourceFingerprint === publishedFingerprint
    };
  });

  return {
    version: CMS_ARTIFACT_VERSION,
    generatedAt: CMS_BASELINE_IMPORTED_AT,
    allCollectionsMatchSource: collectionDiffs.every((entry) => entry.matchesSource),
    collectionDiffs
  };
}
