import accessibilityStatement from "../src/content/accessibilityStatement/default.json" with { type: "json" };
import contactInfo from "../src/content/contactInfo/default.json" with { type: "json" };
import consentAwareMicrocopy from "../src/content/consentAwareMicrocopy/default.json" with { type: "json" };
import ctaBlocks from "../src/content/ctaBlocks/default.json" with { type: "json" };
import faqs from "../src/content/faqs/default.json" with { type: "json" };
import formSurfaces from "../src/content/formSurfaces/default.json" with { type: "json" };
import homePage from "../src/content/homePage/default.json" with { type: "json" };
import involvementRoutes from "../src/content/involvementRoutes/default.json" with { type: "json" };
import legalPages from "../src/content/legalPages/default.json" with { type: "json" };
import mediaLibrary from "../src/content/mediaLibrary/default.json" with { type: "json" };
import notices from "../src/content/notices/default.json" with { type: "json" };
import pageDefinitions from "../src/content/pageDefinitions/launch.json" with { type: "json" };
import privacyNotice from "../src/content/privacyNotice/default.json" with { type: "json" };
import programmePageContent from "../src/content/programmePageContent/default.json" with { type: "json" };
import programmes from "../src/content/programmes/career-support-cv-help.json" with { type: "json" };
import programmesCommunityFriendship from "../src/content/programmes/community-friendship.json" with { type: "json" };
import programmesCommunitySupport from "../src/content/programmes/community-support-intergenerational-connection.json" with { type: "json" };
import programmesPersonalGrowth from "../src/content/programmes/personal-growth-life-skills.json" with { type: "json" };
import resilienceStates from "../src/content/resilienceStates/default.json" with { type: "json" };
import routePages from "../src/content/routePages/default.json" with { type: "json" };
import seo from "../src/content/seo/default.json" with { type: "json" };
import sessionPageContent from "../src/content/sessionPageContent/default.json" with { type: "json" };
import sessionsCvSupport from "../src/content/sessions/cv-support.json" with { type: "json" };
import sessionsYouthClub from "../src/content/sessions/youth-club.json" with { type: "json" };
import shellConfig from "../src/content/shellConfig/default.json" with { type: "json" };
import sitePolicy from "../src/content/sitePolicy/default.json" with { type: "json" };
import trustSignals from "../src/content/trustSignals/default.json" with { type: "json" };
import updatesFeed from "../src/content/updatesFeed/default.json" with { type: "json" };
import storageAccess from "../src/content/storageAccess/default.json" with { type: "json" };

const allPages = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];
const allProgrammes = [
  programmes,
  programmesCommunityFriendship,
  programmesCommunitySupport,
  programmesPersonalGrowth
];
const allSessions = [sessionsCvSupport, sessionsYouthClub];

const pageIndex = new Map(allPages.map((page) => [page.id, page]));
const pageIds = new Set(allPages.map((page) => page.id));
const faqGroupIds = new Set(faqs.groups.map((group) => group.id));
const formSurfaceIds = new Set(formSurfaces.surfaces.map((surface) => surface.id));
const involvementRouteIds = new Set(involvementRoutes.routes.map((route) => route.id));
const legalPageIds = new Set(legalPages.pages.map((page) => page.id));
const mediaIds = new Set(mediaLibrary.assets.map((asset) => asset.id));
const noticeIds = new Set(notices.notices.map((notice) => notice.id));
const ctaIds = new Set(ctaBlocks.blocks.map((cta) => cta.id));
const trustSignalIds = new Set(trustSignals.signals.map((signal) => signal.id));
const programmeSlugs = new Set(allProgrammes.map((programme) => programme.slug));
const homeActionIds = new Set(homePage.actions.map((action) => action.id));
const homeSectionIds = new Set(homePage.sections.map((section) => section.id));
const reasonOptionIds = new Set(contactInfo.reasonOptions.map((option) => option.id));
const resilienceStateIds = new Set(resilienceStates.taxonomy.map((state) => state.id));
const resilienceSurfaceIds = new Set(
  resilienceStates.surfaces.map((surface) => surface.id)
);
const weekdayIndexByCode = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6
};

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertUnique(values, label) {
  const seen = new Set();

  for (const value of values) {
    assert(!seen.has(value), `Duplicate ${label}: ${value}`);
    seen.add(value);
  }
}

function assertExactCoverage(actualValues, expectedValues, label) {
  const actual = new Set(actualValues);
  const expected = new Set(expectedValues);

  for (const value of expected) {
    assert(actual.has(value), `Missing ${label}: ${value}`);
  }

  for (const value of actual) {
    assert(expected.has(value), `Unexpected ${label}: ${value}`);
  }
}

function assertPageExists(pageId, label) {
  assert(pageIds.has(pageId), `${label} references unknown page id: ${pageId}`);
}

function assertMediaExists(mediaId, label) {
  assert(mediaIds.has(mediaId), `${label} references unknown media id: ${mediaId}`);
}

function assertFaqGroupExists(groupId, label) {
  assert(faqGroupIds.has(groupId), `${label} references unknown FAQ group: ${groupId}`);
}

function assertFormSurfaceExists(surfaceId, label) {
  assert(
    formSurfaceIds.has(surfaceId),
    `${label} references unknown form surface: ${surfaceId}`
  );
}

function assertRouteReference(action, label) {
  if (action.routeId) {
    assertPageExists(action.routeId, label);
  }
}

function assertHomeActionExists(actionId, label) {
  assert(
    homeActionIds.has(actionId),
    `${label} references unknown home action: ${actionId}`
  );
}

function parseIsoDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return { year, month, day };
}

function getWeekdayIndexForIsoDate(value) {
  const { year, month, day } = parseIsoDate(value);

  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function getWeekdayCodeForIsoDate(value) {
  return Object.keys(weekdayIndexByCode).find(
    (code) => weekdayIndexByCode[code] === getWeekdayIndexForIsoDate(value)
  );
}

assertUnique(
  routePages.pages.map((page) => page.pageId),
  "route page id"
);
assertUnique(
  sessionPageContent.pages.map((page) => page.pageId),
  "session page id"
);
assertUnique(
  sessionPageContent.pages.map((page) => page.sessionSlug),
  "session slug"
);
assertUnique(
  programmePageContent.pages.map((page) => page.pageId),
  "programme page id"
);
assertUnique(
  programmePageContent.pages.map((page) => page.programmeSlug),
  "programme slug"
);
assertUnique(
  formSurfaces.surfaces.map((surface) => surface.id),
  "form surface id"
);
assertUnique(
  homePage.actions.map((action) => action.id),
  "home action id"
);
assertUnique(
  homePage.sections.map((section) => section.id),
  "home section id"
);
assertUnique(
  seo.pageDirectives.map((directive) => directive.pageId),
  "seo directive page id"
);
assertUnique(
  accessibilityStatement.page.contents.map((item) => item.id),
  "accessibility statement contents id"
);
assertUnique(
  privacyNotice.page.contents.map((item) => item.id),
  "privacy contents id"
);
assertUnique(
  privacyNotice.page.collectionPoints.map((item) => item.id),
  "privacy collection point id"
);
assertUnique(
  sitePolicy.page.contents.map((item) => item.id),
  "site policy contents id"
);
assertUnique(
  sitePolicy.page.sections.map((section) => section.id),
  "site policy section id"
);
assertUnique(
  accessibilityStatement.page.limitations.map((item) => item.title),
  "accessibility limitation title"
);
assertUnique(
  resilienceStates.taxonomy.map((state) => state.id),
  "resilience taxonomy id"
);
assertUnique(
  resilienceStates.surfaces.map((surface) => surface.id),
  "resilience surface id"
);

const expectedRoutePages = pageDefinitions.launchPages
  .filter(
    (page) => !["home", "programme-detail", "session-detail"].includes(page.template)
  )
  .map((page) => page.id);
const expectedSessionPageIds = pageDefinitions.launchPages
  .filter((page) => page.template === "session-detail")
  .map((page) => page.id);
const expectedProgrammePageIds = pageDefinitions.launchPages
  .filter((page) => page.template === "programme-detail")
  .map((page) => page.id);
const expectedSeoDirectivePageIds = [
  ...pageDefinitions.launchPages.map((page) => page.id),
  "component-preview"
];

assertExactCoverage(
  routePages.pages.map((page) => page.pageId),
  expectedRoutePages,
  "route page content entry"
);
assertExactCoverage(
  sessionPageContent.pages.map((page) => page.pageId),
  expectedSessionPageIds,
  "session page content entry"
);
assertExactCoverage(
  programmePageContent.pages.map((page) => page.pageId),
  expectedProgrammePageIds,
  "programme page content entry"
);
assertExactCoverage(
  seo.pageDirectives.map((directive) => directive.pageId),
  expectedSeoDirectivePageIds,
  "seo page directive"
);
assertExactCoverage(
  accessibilityStatement.page.contents.map((item) => item.id),
  ["measures", "testing", "known-limitations", "external-surfaces", "feedback", "review"],
  "accessibility-statement contents target"
);
assertExactCoverage(
  resilienceStates.taxonomy.map((state) => state.id),
  [
    "idle",
    "loading",
    "success",
    "validation-error",
    "submission-error",
    "empty-valid",
    "partial-content",
    "unavailable-enhancement",
    "missing-route",
    "archived-content",
    "system-fallback"
  ],
  "resilience taxonomy state"
);
assertExactCoverage(
  privacyNotice.page.collectionPoints.map((point) => point.surfaceId),
  formSurfaces.surfaces.map((surface) => surface.id),
  "privacy collection-point surface"
);
assertExactCoverage(
  privacyNotice.page.contents.map((item) => item.id),
  ["collection-points", ...privacyNotice.page.sections.map((section) => section.id)],
  "privacy contents target"
);
assertExactCoverage(
  storageAccess.page.contents.map((item) => item.id),
  [
    ...storageAccess.page.sections.map((section) => section.id),
    "active-registry",
    "absent-registry"
  ],
  "storage-access contents target"
);
assertExactCoverage(
  sitePolicy.page.contents.map((item) => item.id),
  sitePolicy.page.sections.map((section) => section.id),
  "site-policy contents target"
);

assert(
  privacyNotice.settings.privacyEmail === contactInfo.publicEmail,
  "privacyNotice.settings.privacyEmail must match contactInfo.publicEmail"
);
assertMediaExists(seo.defaults.defaultSocialMediaId, "seo.defaults.defaultSocialMediaId");
assert(
  reasonOptionIds.has("accessibility"),
  "contactInfo.reasonOptions must include accessibility"
);
assert(
  accessibilityStatement.settings.feedbackSurfaceId ===
    consentAwareMicrocopy.settings.accessibilityFeedbackSurfaceId,
  "Accessibility feedback surface ids must match between accessibilityStatement and consentAwareMicrocopy"
);
assert(
  consentAwareMicrocopy.settings.cookiePreferenceEntryPoint ===
    storageAccess.settings.reopenControl,
  "consentAwareMicrocopy.settings.cookiePreferenceEntryPoint must match storageAccess.settings.reopenControl"
);
assert(
  privacyNotice.settings.mapEmbedStatus ===
    (contactInfo.mapEmbedAllowedAtLaunch ? "configured" : "absent"),
  "privacyNotice.settings.mapEmbedStatus must match contactInfo.mapEmbedAllowedAtLaunch"
);
assert(
  privacyNotice.settings.analyticsStatus === "configured" ||
    privacyNotice.settings.nonEssentialCookiesStatus === "absent",
  "privacyNotice.settings.nonEssentialCookiesStatus must stay absent while analytics are absent"
);
assert(
  storageAccess.settings.nonEssentialTechnologiesStatus === "present" ||
    ["no-banner", "informational-notice"].includes(
      storageAccess.settings.consentExperience
    ),
  "storageAccess.settings.consentExperience must stay within the launch-safe no-banner or informational-notice states while non-essential technologies are absent"
);
assert(
  storageAccess.settings.consentExperience !== "no-banner" ||
    (storageAccess.settings.consentRecordStorage === "absent" &&
      privacyNotice.settings.analyticsStatus === "absent"),
  "storageAccess.settings.consentRecordStorage and privacyNotice.settings.analyticsStatus must stay absent while consentExperience is no-banner"
);
assert(
  storageAccess.settings.consentExperience !== "informational-notice" ||
    (storageAccess.settings.consentRecordStorage === "cookie" &&
      storageAccess.settings.preferenceCenterState === "available" &&
      privacyNotice.settings.analyticsStatus === "configured"),
  "informational-notice mode requires a stored objection cookie, an available control surface, and configured analytics status"
);
assert(
  storageAccess.settings.nonEssentialTechnologiesStatus === "present" ||
    (privacyNotice.settings.nonEssentialCookiesStatus === "absent" &&
      privacyNotice.settings.mapEmbedStatus === "absent" &&
      privacyNotice.settings.socialEmbedStatus === "absent"),
  "privacyNotice non-essential storage/access flags must stay absent while storageAccess reports no non-essential technologies"
);

assertUnique(
  storageAccess.registry.active.map((entry) => entry.id),
  "storage-access active registry id"
);
assertUnique(
  storageAccess.registry.absent.map((entry) => entry.id),
  "storage-access absent registry id"
);
assertUnique(
  storageAccess.registry.futureGuardrails.map((entry) => entry.id),
  "storage-access future guardrail id"
);
assert(
  storageAccess.registry.active.every(
    (entry) =>
      storageAccess.settings.nonEssentialTechnologiesStatus === "present" ||
      entry.consentRequirement === "not-required"
  ),
  "storageAccess active registry entries cannot require consent while the launch state reports no non-essential technologies"
);
assert(
  storageAccess.registry.absent.some((entry) => entry.id === "non-essential-cookies"),
  "storageAccess registry must explicitly record that non-essential cookies are absent at launch"
);
assert(
  privacyNotice.settings.analyticsStatus !== "configured" ||
    storageAccess.registry.active.some(
      (entry) =>
        entry.id === "first-party-statistical-analytics" &&
        entry.category === "statistical" &&
        entry.party === "first-party"
    ),
  "Configured analytics must be represented by a first-party statistical registry entry"
);
assert(
  storageAccess.registry.absent.some(
    (entry) => entry.id === "analytics-and-measurement-tags"
  ),
  "storageAccess registry must explicitly record that third-party analytics tags are absent at launch"
);

for (const surface of resilienceStates.surfaces) {
  assert(
    resilienceStateIds.has(surface.stateId),
    `resilienceStates.surfaces:${surface.id}.stateId references unknown resilience state: ${surface.stateId}`
  );

  for (const action of [
    ...(surface.primaryAction ? [surface.primaryAction] : []),
    ...(surface.secondaryAction ? [surface.secondaryAction] : []),
    ...(surface.actions ?? [])
  ]) {
    assertRouteReference(action, `resilienceStates.surfaces:${surface.id}`);
  }
}

for (const requiredSurfaceId of [
  "route-missing-recovery",
  "events-feed-empty",
  "events-filter-empty",
  "sessions-calendar-partial",
  "sessions-calendar-unavailable",
  "contact-launch-partial",
  "contact-location-withheld",
  "form-submitting",
  "form-validation-error",
  "form-reload-required",
  "form-context-expired",
  "form-submission-error",
  "form-rate-limited",
  "form-noscript",
  "analytics-disabled",
  "media-fallback"
]) {
  assert(
    resilienceSurfaceIds.has(requiredSurfaceId),
    `Missing required resilience surface: ${requiredSurfaceId}`
  );
}

for (const surface of formSurfaces.surfaces) {
  for (const reasonId of surface.allowedReasonIds ?? []) {
    assert(
      reasonOptionIds.has(reasonId),
      `formSurfaces:${surface.id}.allowedReasonIds references unknown reason id: ${reasonId}`
    );
  }

  if (surface.defaultReasonId) {
    assert(
      reasonOptionIds.has(surface.defaultReasonId),
      `formSurfaces:${surface.id}.defaultReasonId references unknown reason id: ${surface.defaultReasonId}`
    );

    if (surface.allowedReasonIds) {
      assert(
        surface.allowedReasonIds.includes(surface.defaultReasonId),
        `formSurfaces:${surface.id}.defaultReasonId must be included in allowedReasonIds`
      );
    }
  }
}

const accessibilityFeedbackSurface = formSurfaces.surfaces.find(
  (surface) => surface.id === accessibilityStatement.settings.feedbackSurfaceId
);

assert(accessibilityFeedbackSurface, "Missing accessibility feedback form surface.");
assert(
  accessibilityFeedbackSurface.defaultReasonId === "accessibility",
  "Accessibility feedback surface must default to the accessibility reason."
);
assert(
  accessibilityFeedbackSurface.reasonFieldMode === "hidden",
  "Accessibility feedback surface must hide the reason field."
);
assert(
  accessibilityFeedbackSurface.showUpdatesOptIn === false,
  "Accessibility feedback surface must keep updates opt-in disabled."
);
assert(
  accessibilityFeedbackSurface.allowedReasonIds?.length === 1 &&
    accessibilityFeedbackSurface.allowedReasonIds[0] === "accessibility",
  "Accessibility feedback surface must only allow the accessibility reason."
);

assert(
  legalPages.pages.some(
    (page) => page.id === "accessibility" && page.contentState === "seeded"
  ),
  "legalPages accessibility entry must be seeded."
);
assert(
  legalPages.pages.some((page) => page.id === "terms" && page.contentState === "seeded"),
  "legalPages terms entry must be seeded."
);
assert(
  pageDefinitions.launchPages.some(
    (page) => page.id === "accessibility" && page.contentStatus === "seeded"
  ),
  "pageDefinitions accessibility page must be seeded."
);
assert(
  pageDefinitions.launchPages.some(
    (page) => page.id === "terms" && page.contentStatus === "seeded"
  ),
  "pageDefinitions terms page must be seeded."
);

for (const point of privacyNotice.page.collectionPoints) {
  assertFormSurfaceExists(
    point.surfaceId,
    `privacyNotice.collectionPoints:${point.id}.surfaceId`
  );

  for (const routeId of point.routeIds) {
    assertPageExists(routeId, `privacyNotice.collectionPoints:${point.id}.routeIds`);
  }
}

for (const page of routePages.pages) {
  const definition = pageIndex.get(page.pageId);

  assert(definition, `Route page content references unknown page id: ${page.pageId}`);
  assert(
    definition.template === page.template,
    `Route page template mismatch for ${page.pageId}. Expected ${definition.template}, received ${page.template}.`
  );

  if (page.intro?.mediaId) {
    assertMediaExists(page.intro.mediaId, `routePages:${page.pageId}.intro.mediaId`);
  }

  if (page.intro?.actionReferences) {
    for (const action of page.intro.actionReferences) {
      assertRouteReference(action, `routePages:${page.pageId}.intro.actionReferences`);
    }
  }

  if (page.storySections) {
    assertUnique(
      page.storySections.map((section) => section.id),
      `story section id for ${page.pageId}`
    );

    for (const section of page.storySections) {
      if (section.mediaId) {
        assertMediaExists(
          section.mediaId,
          `routePages:${page.pageId}.storySections:${section.id}.mediaId`
        );
      }

      for (const action of section.actionReferences ?? []) {
        assertRouteReference(
          action,
          `routePages:${page.pageId}.storySections:${section.id}.actionReferences`
        );
      }

      if (section.note?.action) {
        assertRouteReference(
          section.note.action,
          `routePages:${page.pageId}.storySections:${section.id}.note.action`
        );
      }
    }
  }

  if (page.valuesSection) {
    for (const item of page.valuesSection.items) {
      assertMediaExists(
        item.iconAssetId,
        `routePages:${page.pageId}.valuesSection:${item.title}.iconAssetId`
      );
    }
  }

  if (page.audienceSection) {
    for (const item of page.audienceSection.items) {
      if (item.action) {
        assertRouteReference(
          item.action,
          `routePages:${page.pageId}.audienceSection:${item.title}.action`
        );
      }
    }
  }

  if (page.trustSection) {
    for (const signalId of page.trustSection.trustSignalIds) {
      assert(
        trustSignalIds.has(signalId),
        `routePages:${page.pageId}.trustSection references unknown trust signal: ${signalId}`
      );
    }
  }

  if (page.faqSection?.groupId) {
    assertFaqGroupExists(page.faqSection.groupId, `routePages:${page.pageId}.faqSection`);
  }

  if (page.formSurfaceId) {
    assertFormSurfaceExists(
      page.formSurfaceId,
      `routePages:${page.pageId}.formSurfaceId`
    );
  }

  if (page.routeCards) {
    for (const card of page.routeCards) {
      assert(
        involvementRouteIds.has(card.routeId),
        `routePages:${page.pageId}.routeCards references unknown involvement route: ${card.routeId}`
      );
    }
  }

  if (page.pathwaysSection) {
    for (const item of page.pathwaysSection.items) {
      assertMediaExists(
        item.iconAssetId,
        `routePages:${page.pageId}.pathwaysSection:${item.title}.iconAssetId`
      );

      if (item.action) {
        assertRouteReference(
          item.action,
          `routePages:${page.pageId}.pathwaysSection:${item.title}.action`
        );
      }
    }

    if (page.pathwaysSection.note?.action) {
      assertRouteReference(
        page.pathwaysSection.note.action,
        `routePages:${page.pageId}.pathwaysSection.note.action`
      );
    }
  }

  for (const [sectionKey, section] of [
    ["supportSection", page.supportSection],
    ["screeningSection", page.screeningSection],
    ["timeCommitmentSection", page.timeCommitmentSection]
  ]) {
    if (!section) {
      continue;
    }

    for (const item of section.items) {
      if (item.iconAssetId) {
        assertMediaExists(
          item.iconAssetId,
          `routePages:${page.pageId}.${sectionKey}:${item.title}.iconAssetId`
        );
      }
    }

    if (section.note?.action) {
      assertRouteReference(
        section.note.action,
        `routePages:${page.pageId}.${sectionKey}.note.action`
      );
    }
  }

  if (page.processSection) {
    for (const [index, step] of page.processSection.steps.entries()) {
      assert(
        typeof step === "string" ||
          (typeof step.title === "string" && typeof step.body === "string"),
        `routePages:${page.pageId}.processSection.steps:${index} must be a string or { title, body } object`
      );
    }
  }

  if (page.spotlightSection) {
    assertRouteReference(
      page.spotlightSection.fallbackAction,
      `routePages:${page.pageId}.spotlightSection.fallbackAction`
    );
    assertRouteReference(
      page.spotlightSection.supportPanel.action,
      `routePages:${page.pageId}.spotlightSection.supportPanel.action`
    );
  }

  if (page.emptyState) {
    assertRouteReference(
      page.emptyState.primaryAction,
      `routePages:${page.pageId}.emptyState.primaryAction`
    );

    if (page.emptyState.secondaryAction) {
      assertRouteReference(
        page.emptyState.secondaryAction,
        `routePages:${page.pageId}.emptyState.secondaryAction`
      );
    }
  }

  if (page.ctaBand) {
    for (const action of page.ctaBand.actions) {
      assertRouteReference(action, `routePages:${page.pageId}.ctaBand.actions`);
    }

    if (page.ctaBand.note?.action) {
      assertRouteReference(
        page.ctaBand.note.action,
        `routePages:${page.pageId}.ctaBand.note.action`
      );
    }
  }

  if (page.template === "legal") {
    assert(
      legalPageIds.has(page.pageId),
      `routePages:${page.pageId} should have a matching legal page record.`
    );
  }

  if (page.pageId === "about") {
    assert(
      (page.storySections?.length ?? 0) >= 4,
      "routePages:about should include four ordered story sections."
    );
    assert(page.purposeSection, "routePages:about should define a purposeSection.");
    assert(
      (page.valuesSection?.items.length ?? 0) >= 4,
      "routePages:about should define at least four values."
    );
    assert(
      (page.audienceSection?.items.length ?? 0) >= 3,
      "routePages:about should define at least three audience groups."
    );
    assert(page.proofBoundary, "routePages:about should define a proofBoundary.");
    assert(page.ctaBand, "routePages:about should define a ctaBand.");
  }

  if (page.pageId === "programmes") {
    assert(
      (page.overviewPanels?.length ?? 0) >= 3,
      "routePages:programmes should define at least three comparison panels."
    );
    assert(
      page.scheduleSection,
      "routePages:programmes should define a scheduleSection."
    );
    assert(
      (page.audienceSection?.items.length ?? 0) === 4,
      "routePages:programmes should define four audience routing items."
    );
    assert(page.ctaBand, "routePages:programmes should define a ctaBand.");
  }

  if (page.pageId === "get-involved") {
    assert(
      (page.routeCards?.length ?? 0) === 5,
      "routePages:get-involved should define five pathway cards."
    );
    assert(
      (page.processSection?.steps.length ?? 0) >= 3,
      "routePages:get-involved should define at least three process steps."
    );
    assert(
      page.spotlightSection,
      "routePages:get-involved should define a spotlightSection."
    );
    assert(page.ctaBand, "routePages:get-involved should define a ctaBand.");
  }

  if (page.pageId === "volunteer") {
    assert(
      (page.pathwaysSection?.items.length ?? 0) >= 3,
      "routePages:volunteer should define at least three volunteer pathways."
    );
    assert(page.supportSection, "routePages:volunteer should define a supportSection.");
    assert(
      page.screeningSection,
      "routePages:volunteer should define a screeningSection."
    );
    assert(
      page.timeCommitmentSection,
      "routePages:volunteer should define a timeCommitmentSection."
    );
    assert(
      page.formSurfaceId === "volunteer-enquiry",
      "routePages:volunteer should use the volunteer-enquiry form surface."
    );
    assert(
      page.faqSection?.groupId === "volunteer",
      "routePages:volunteer should use the dedicated volunteer FAQ group."
    );
  }

  if (page.pageId === "partner") {
    assert(page.audienceSection, "routePages:partner should define an audienceSection.");
    assert(
      (page.audienceSection?.items.length ?? 0) >= 3,
      "routePages:partner should define at least three audience cards."
    );
    assert(
      (page.pathwaysSection?.items.length ?? 0) >= 3,
      "routePages:partner should define at least three collaboration pathways."
    );
    assert(page.supportSection, "routePages:partner should define a supportSection.");
    assert(
      page.proofBoundary,
      "routePages:partner should define a proofBoundary section."
    );
    assert(
      page.formSurfaceId === "partner-enquiry",
      "routePages:partner should use the partner-enquiry form surface."
    );
    assert(
      page.faqSection?.groupId === "partner",
      "routePages:partner should use the dedicated partner FAQ group."
    );
  }
}

for (const route of involvementRoutes.routes) {
  assertMediaExists(route.iconAssetId, `involvementRoutes:${route.id}.iconAssetId`);
  assertRouteReference(
    route.primaryAction,
    `involvementRoutes:${route.id}.primaryAction`
  );

  if (route.secondaryAction) {
    assertRouteReference(
      route.secondaryAction,
      `involvementRoutes:${route.id}.secondaryAction`
    );
  }
}

assert(homePage.actions.length >= 6, "Home page should expose a substantive action map.");
assertUnique(homePage.audiencePriority, "home audience priority");
assertExactCoverage(
  homePage.conversionStack.audienceJourneys.map((journey) => journey.audience),
  homePage.audiencePriority,
  "home audience journey"
);

for (const action of homePage.actions) {
  if (action.ctaId) {
    assert(ctaIds.has(action.ctaId), `homePage.actions:${action.id}.ctaId is unknown.`);
  }

  if (action.routeId) {
    assertPageExists(action.routeId, `homePage.actions:${action.id}.routeId`);
  }

  if (action.iconAssetId) {
    assertMediaExists(action.iconAssetId, `homePage.actions:${action.id}.iconAssetId`);
  }
}

assertHomeActionExists(
  homePage.conversionStack.primaryActionId,
  "homePage.conversionStack.primaryActionId"
);
assertHomeActionExists(
  homePage.conversionStack.secondaryActionId,
  "homePage.conversionStack.secondaryActionId"
);

for (const actionId of homePage.conversionStack.supportingActionIds) {
  assertHomeActionExists(actionId, "homePage.conversionStack.supportingActionIds");
}

assertHomeActionExists(homePage.hero.primaryActionId, "homePage.hero.primaryActionId");
assertHomeActionExists(
  homePage.hero.secondaryActionId,
  "homePage.hero.secondaryActionId"
);
assertMediaExists(homePage.hero.mediaId, "homePage.hero.mediaId");

for (const journey of homePage.conversionStack.audienceJourneys) {
  assertHomeActionExists(
    journey.primaryActionId,
    `homePage.conversionStack.audienceJourneys:${journey.audience}.primaryActionId`
  );

  if (journey.secondaryActionId) {
    assertHomeActionExists(
      journey.secondaryActionId,
      `homePage.conversionStack.audienceJourneys:${journey.audience}.secondaryActionId`
    );
  }

  for (const actionId of journey.supportingActionIds) {
    assertHomeActionExists(
      actionId,
      `homePage.conversionStack.audienceJourneys:${journey.audience}.supportingActionIds`
    );
  }
}

for (const section of homePage.sections) {
  for (const actionId of section.actionIds ?? []) {
    assertHomeActionExists(actionId, `homePage.sections:${section.id}.actionIds`);
  }

  if (section.primaryActionId) {
    assertHomeActionExists(
      section.primaryActionId,
      `homePage.sections:${section.id}.primaryActionId`
    );
  }

  if (section.secondaryActionId) {
    assertHomeActionExists(
      section.secondaryActionId,
      `homePage.sections:${section.id}.secondaryActionId`
    );
  }

  if (section.pageId) {
    assertPageExists(section.pageId, `homePage.sections:${section.id}.pageId`);
  }

  if (section.mediaId) {
    assertMediaExists(section.mediaId, `homePage.sections:${section.id}.mediaId`);
  }

  if (section.faqGroupId) {
    assertFaqGroupExists(
      section.faqGroupId,
      `homePage.sections:${section.id}.faqGroupId`
    );
  }

  if (section.formSurfaceId) {
    assertFormSurfaceExists(
      section.formSurfaceId,
      `homePage.sections:${section.id}.formSurfaceId`
    );
  }

  for (const trustItem of section.trustItems ?? []) {
    assert(
      trustSignalIds.has(trustItem.signalId),
      `homePage.sections:${section.id}.trustItems references unknown trust signal: ${trustItem.signalId}`
    );
    assertHomeActionExists(
      trustItem.actionId,
      `homePage.sections:${section.id}.trustItems.actionId`
    );
  }

  for (const slug of section.programmeSlugs ?? []) {
    assert(
      programmeSlugs.has(slug),
      `homePage.sections:${section.id} references unknown programme slug: ${slug}`
    );
  }

  if (section.kind === "live-sessions" || section.kind === "updates-surface") {
    assert(
      section.emptyState,
      `homePage.sections:${section.id} should define an emptyState`
    );
  }

  if (section.kind === "trust-strip") {
    assert(
      (section.trustItems ?? []).length > 0,
      `homePage.sections:${section.id} should include at least one trust item`
    );
  }
}

assert(
  homeSectionIds.has(homePage.stateRules.liveSessions.sectionId),
  "homePage.stateRules.liveSessions.sectionId is unknown."
);
assertHomeActionExists(
  homePage.stateRules.liveSessions.supportActionId,
  "homePage.stateRules.liveSessions.supportActionId"
);
assert(
  homePage.stateRules.updates.collectionId === "updates-feed",
  "homePage.stateRules.updates.collectionId should stay aligned with the launch updates feed."
);
assert(
  homeSectionIds.has(homePage.stateRules.updates.sectionId),
  "homePage.stateRules.updates.sectionId is unknown."
);
assertHomeActionExists(
  homePage.stateRules.updates.primaryActionId,
  "homePage.stateRules.updates.primaryActionId"
);
assert(
  homeSectionIds.has(homePage.stateRules.contact.sectionId),
  "homePage.stateRules.contact.sectionId is unknown."
);
assertPageExists(
  homePage.stateRules.shellNotices.pageId,
  "homePage.stateRules.shellNotices.pageId"
);

for (const sectionId of homePage.stateRules.aiDisclosures.requiredSectionIds) {
  assert(
    sectionId === "hero" || homeSectionIds.has(sectionId),
    `homePage.stateRules.aiDisclosures.requiredSectionIds references unknown section: ${sectionId}`
  );
}

for (const item of updatesFeed.items) {
  assert(
    updatesFeed.categories.some((category) => category.id === item.updateType),
    `updatesFeed:${item.id}.updateType is not declared in updatesFeed.categories`
  );

  if (item.routeId) {
    assertPageExists(item.routeId, `updatesFeed:${item.id}.routeId`);
  }

  if (item.mediaId) {
    assertMediaExists(item.mediaId, `updatesFeed:${item.id}.mediaId`);
  }

  if (item.detail.secondaryAction) {
    assertRouteReference(
      item.detail.secondaryAction,
      `updatesFeed:${item.id}.detail.secondaryAction`
    );
  }

  if (item.detail.proofNotice?.action) {
    assertRouteReference(
      item.detail.proofNotice.action,
      `updatesFeed:${item.id}.detail.proofNotice.action`
    );
  }

  for (const action of item.detail.ctaBand.actions) {
    assertRouteReference(action, `updatesFeed:${item.id}.detail.ctaBand.actions`);
  }

  if (item.detail.ctaBand.note?.action) {
    assertRouteReference(
      item.detail.ctaBand.note.action,
      `updatesFeed:${item.id}.detail.ctaBand.note.action`
    );
  }

  for (const section of item.detail.sections) {
    if (section.mediaId) {
      assertMediaExists(
        section.mediaId,
        `updatesFeed:${item.id}.detail.sections:${section.id}.mediaId`
      );
    }

    if (section.note?.action) {
      assertRouteReference(
        section.note.action,
        `updatesFeed:${item.id}.detail.sections:${section.id}.note.action`
      );
    }

    for (const action of section.actionReferences ?? []) {
      assertRouteReference(
        action,
        `updatesFeed:${item.id}.detail.sections:${section.id}.actionReferences`
      );
    }

    assert(
      section.paragraphs.length > 0,
      `updatesFeed:${item.id}.detail.sections:${section.id} requires paragraphs`
    );
  }

  for (const relatedId of item.detail.relatedItemIds ?? []) {
    assert(
      updatesFeed.items.some((entry) => entry.id === relatedId),
      `updatesFeed:${item.id}.detail.relatedItemIds references unknown item: ${relatedId}`
    );
  }
}

assertUnique(
  updatesFeed.categories.map((category) => category.id),
  "updates feed category id"
);
assertUnique(
  updatesFeed.items.map((item) => item.slug),
  "updates feed item slug"
);
assertRouteReference(
  updatesFeed.index.emptyState.primaryAction,
  "updatesFeed.index.emptyState.primaryAction"
);

if (updatesFeed.index.emptyState.secondaryAction) {
  assertRouteReference(
    updatesFeed.index.emptyState.secondaryAction,
    "updatesFeed.index.emptyState.secondaryAction"
  );
}

for (const page of sessionPageContent.pages) {
  const pageDefinition = pageIndex.get(page.pageId);
  const session = allSessions.find((entry) => entry.slug === page.sessionSlug);

  assert(
    pageDefinition,
    `Session page content references unknown page id: ${page.pageId}`
  );
  assert(
    pageDefinition.template === "session-detail",
    `Session page content must map to a session-detail page: ${page.pageId}`
  );
  assert(
    session,
    `Session page content references unknown session slug: ${page.sessionSlug}`
  );
  assert(
    page.pageId === `session-${page.sessionSlug}`,
    `Session page content id must match its slug: ${page.pageId}`
  );
  assert(
    session.route === `/sessions/${page.sessionSlug}/`,
    `Session route does not match slug for ${page.sessionSlug}`
  );
  assertFaqGroupExists(
    session.faqGroupIds[0],
    `sessions:${page.sessionSlug}.faqGroupIds[0]`
  );
  for (const item of page.expectationSection.items) {
    if (item.iconAssetId) {
      assertMediaExists(
        item.iconAssetId,
        `sessionPageContent:${page.pageId}.expectationSection.items.iconAssetId`
      );
    }
  }
  for (const item of page.supportSection.items) {
    if (item.iconAssetId) {
      assertMediaExists(
        item.iconAssetId,
        `sessionPageContent:${page.pageId}.supportSection.items.iconAssetId`
      );
    }
  }
  if (page.supportSection.note?.action) {
    assertRouteReference(
      page.supportSection.note.action,
      `sessionPageContent:${page.pageId}.supportSection.note.action`
    );
  }
  if (page.fallbackNotice.action) {
    assertRouteReference(
      page.fallbackNotice.action,
      `sessionPageContent:${page.pageId}.fallbackNotice.action`
    );
  }
  for (const action of page.ctaBand.actions) {
    assertRouteReference(action, `sessionPageContent:${page.pageId}.ctaBand.actions`);
  }
  if (page.ctaBand.note?.action) {
    assertRouteReference(
      page.ctaBand.note.action,
      `sessionPageContent:${page.pageId}.ctaBand.note.action`
    );
  }
  assert(
    session.schedule.byDay.length > 0,
    `sessions:${page.sessionSlug}.schedule.byDay must include at least one weekday`
  );
  assert(
    session.schedule.byDay.every((code) => code in weekdayIndexByCode),
    `sessions:${page.sessionSlug}.schedule.byDay contains an unknown weekday code`
  );
  assert(
    session.schedule.byDay.includes(
      getWeekdayCodeForIsoDate(session.schedule.startLocalDate)
    ),
    `sessions:${page.sessionSlug}.schedule.startLocalDate must align with one of the configured recurrence weekdays`
  );
  if (session.schedule.status.state === "seasonal") {
    if (session.schedule.status.seasonStartDate) {
      assert(
        session.schedule.byDay.includes(
          getWeekdayCodeForIsoDate(session.schedule.status.seasonStartDate)
        ),
        `sessions:${page.sessionSlug}.schedule.status.seasonStartDate must align with a recurrence weekday`
      );
    }

    if (session.schedule.status.seasonEndDate) {
      assert(
        session.schedule.byDay.includes(
          getWeekdayCodeForIsoDate(session.schedule.status.seasonEndDate)
        ),
        `sessions:${page.sessionSlug}.schedule.status.seasonEndDate must align with a recurrence weekday`
      );
    }
  }
  assert(
    session.calendar.publicPath === `/calendar/${page.sessionSlug}.ics`,
    `sessions:${page.sessionSlug}.calendar.publicPath must match the session slug`
  );
  if (session.calendar.status === "available") {
    assert(
      session.schedule.status.state !== "contact-only" &&
        session.schedule.status.state !== "paused" &&
        session.schedule.status.state !== "cancelled",
      `sessions:${page.sessionSlug} cannot expose a calendar file while its schedule state is ${session.schedule.status.state}`
    );
  }
}

for (const page of programmePageContent.pages) {
  const pageDefinition = pageIndex.get(page.pageId);
  const programme = allProgrammes.find((entry) => entry.slug === page.programmeSlug);

  assert(
    pageDefinition,
    `Programme page content references unknown page id: ${page.pageId}`
  );
  assert(
    pageDefinition.template === "programme-detail",
    `Programme page content must map to a programme-detail page: ${page.pageId}`
  );
  assert(
    programme,
    `Programme page content references unknown programme slug: ${page.programmeSlug}`
  );
  assert(
    page.pageId === `programme-${page.programmeSlug}`,
    `Programme page content id must match its slug: ${page.pageId}`
  );
  assert(
    programme.route === `/programmes/${page.programmeSlug}/`,
    `Programme route does not match slug for ${page.programmeSlug}`
  );

  if (page.experienceSection) {
    assert(
      page.experienceSection.items.length >= 2,
      `programmePageContent:${page.pageId}.experienceSection should include at least two items`
    );

    for (const item of page.experienceSection.items) {
      assertMediaExists(
        item.iconAssetId,
        `programmePageContent:${page.pageId}.experienceSection:${item.title}.iconAssetId`
      );
    }
  }

  if (page.audienceRoutesSection) {
    assert(
      page.audienceRoutesSection.items.length >= 2,
      `programmePageContent:${page.pageId}.audienceRoutesSection should include at least two items`
    );

    for (const item of page.audienceRoutesSection.items) {
      assertMediaExists(
        item.iconAssetId,
        `programmePageContent:${page.pageId}.audienceRoutesSection:${item.title}.iconAssetId`
      );
      assertRouteReference(
        item.action,
        `programmePageContent:${page.pageId}.audienceRoutesSection:${item.title}.action`
      );
    }
  }

  if (page.relatedSessionsSection) {
    for (const panel of page.relatedSessionsSection.panels ?? []) {
      if (panel.iconAssetId) {
        assertMediaExists(
          panel.iconAssetId,
          `programmePageContent:${page.pageId}.relatedSessionsSection:${panel.title}.iconAssetId`
        );
      }
    }
  }

  if (page.faqSection) {
    assertFaqGroupExists(
      page.faqSection.groupId,
      `programmePageContent:${page.pageId}.faqSection.groupId`
    );
  }
}

for (const programme of allProgrammes) {
  assert(
    programme.audienceSummary,
    `programmes:${programme.slug} requires audienceSummary`
  );
  assert(
    programme.audienceHighlights.length >= 2,
    `programmes:${programme.slug} should include at least two audienceHighlights`
  );
  assert(
    programme.deliverySummary,
    `programmes:${programme.slug} requires deliverySummary`
  );
  assert(
    programme.trustNotes.length >= 1,
    `programmes:${programme.slug} should include trustNotes`
  );
  assertMediaExists(
    programme.featuredMediaId,
    `programmes:${programme.slug}.featuredMediaId`
  );
  assertMediaExists(
    programme.featuredIconId,
    `programmes:${programme.slug}.featuredIconId`
  );

  for (const signalId of programme.trustSignalIds) {
    assert(
      trustSignalIds.has(signalId),
      `programmes:${programme.slug}.trustSignalIds references unknown trust signal: ${signalId}`
    );
  }

  for (const sessionId of programme.relatedSessionIds) {
    assert(
      allSessions.some((session) => session.slug === sessionId),
      `programmes:${programme.slug}.relatedSessionIds references unknown session: ${sessionId}`
    );
  }

  if (programme.existingDeliveryMode === "active-session-linked") {
    assert(
      programme.relatedSessionIds.length > 0,
      `programmes:${programme.slug} should reference at least one session while marked active-session-linked`
    );
  }

  if (
    programme.existingDeliveryMode !== "active-session-linked" &&
    programme.relatedSessionIds.length > 0
  ) {
    throw new Error(
      `programmes:${programme.slug} should not expose relatedSessionIds while marked ${programme.existingDeliveryMode}`
    );
  }

  if (programme.primaryCtaId === "join-session") {
    assert(
      programme.relatedSessionIds.length > 0,
      `programmes:${programme.slug} cannot use join-session without a related session`
    );
  }
}

for (const item of shellConfig.utilityItems) {
  assertRouteReference(item, `shellConfig.utilityItems:${item.label}`);
}

for (const cta of shellConfig.headerCtas) {
  assertRouteReference(cta, `shellConfig.headerCtas:${cta.id}`);
}

for (const rule of shellConfig.pageHeaderCtas) {
  assert(
    shellConfig.headerCtas.some((cta) => cta.id === rule.ctaId),
    `shellConfig.pageHeaderCtas references unknown ctaId: ${rule.ctaId}`
  );

  for (const pageId of rule.pageIds) {
    assertPageExists(pageId, `shellConfig.pageHeaderCtas:${rule.ctaId}`);
  }
}

for (const pageId of shellConfig.breadcrumbHiddenPageIds) {
  assertPageExists(pageId, "shellConfig.breadcrumbHiddenPageIds");
}

for (const entry of shellConfig.breadcrumbParents) {
  assertPageExists(entry.pageId, "shellConfig.breadcrumbParents.pageId");
  assertPageExists(entry.parentPageId, "shellConfig.breadcrumbParents.parentPageId");
}

for (const placement of shellConfig.noticePlacements) {
  assert(
    noticeIds.has(placement.noticeId),
    `shellConfig.noticePlacements references unknown noticeId: ${placement.noticeId}`
  );
  for (const pageId of placement.pageIds) {
    assertPageExists(pageId, `shellConfig.noticePlacements:${placement.noticeId}`);
  }

  if (placement.action) {
    assertRouteReference(
      placement.action,
      `shellConfig.noticePlacements:${placement.noticeId}.action`
    );
  }
}

for (const group of shellConfig.relatedRouteGroups) {
  for (const pageId of group.pageIds) {
    assertPageExists(pageId, `shellConfig.relatedRouteGroups:${group.title}`);
  }

  for (const link of group.links) {
    assertRouteReference(
      link,
      `shellConfig.relatedRouteGroups:${group.title}:${link.label}`
    );
  }
}

for (const directive of seo.pageDirectives) {
  if (directive.pageId !== "component-preview") {
    assertPageExists(directive.pageId, `seo.pageDirectives:${directive.pageId}`);
  }
}

console.log(
  `[content-validate] validated ${routePages.pages.length} route pages, ${sessionPageContent.pages.length} session pages, ${programmePageContent.pages.length} programme pages, and ${homePage.sections.length} home sections`
);
