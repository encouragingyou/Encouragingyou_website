import { getMediaAsset } from "../media/catalog.ts";
import { getMediaPublicUrl } from "../media/delivery.js";
import type {
  ActionLink,
  ActionVariant,
  MediaAsset,
  MediaDisclosure
} from "../types/site-ui";
import { deriveContactRouteState } from "../domain/contact-route-state.js";
import {
  buildEditorialDetailHref,
  buildEditorialFeedModel
} from "../domain/editorial-feed.js";
import {
  deriveInvolvementPathwayState,
  selectInvolvementOpportunitySpotlight
} from "../domain/involvement-hub-state.js";
import {
  deriveProgrammeAccessState,
  selectProgrammeLinkedOpportunityNotice
} from "../domain/programme-route-state.js";
import {
  deriveSafeguardingRouteState,
  getSafeguardingBranchState
} from "../domain/safeguarding-route-state.js";
import { deriveSessionHubState } from "../domain/session-hub-state.js";
import {
  buildPlaceholderStatus,
  getSessionStatusMicrocopy,
  getSupportFormMicrocopy
} from "./editorial-guidance.ts";
import {
  getResilienceSurfaceText,
  requireResilienceSurface
} from "./resilience-state.js";
import { buildSeoMetadata } from "./site-seo.ts";
import {
  buildAboutPageStructuredData,
  buildArticleStructuredData,
  buildBreadcrumbStructuredData,
  buildCollectionPageStructuredData,
  buildContactPageStructuredData,
  buildEditorialEventStructuredData,
  buildFaqPageStructuredData,
  buildServiceStructuredData,
  buildSiteOrganizationStructuredData,
  buildWebPageStructuredData,
  buildWebsiteStructuredData
} from "./structured-data.js";
import { buildSessionEnquiryHref } from "../forms/enquiry-contract.js";
import { buildMediaDisclosure } from "./media-disclosure.ts";
import {
  getAccessibilityStatementContent,
  getContactInfo as loadContactInfo,
  getConsentAwareMicrocopyContent,
  getCtaById,
  getFaqGroupById,
  getFormSurfaceById,
  getHomePageContent,
  getInvolvementRouteById,
  getLegalPageById,
  getPageById as loadPageById,
  getPrivacyNoticeContent,
  getProgrammeBySlug,
  getProgrammePageContentById,
  getProgrammePageDefaults,
  getRoutePageContentById,
  getSafeguardingInfo as loadSafeguardingInfo,
  getSessionBySlug as loadSessionBySlug,
  getSessionPageContentById,
  getSiteSettings as loadSiteSettings,
  getSitePolicyContent,
  getStorageAccessContent,
  getTrustSignalById,
  getUpdatesFeedContent,
  listProgrammes,
  listSessions
} from "./content-source-adapter.ts";
import { getGlobalShellModel } from "./site-shell.ts";
import { buildEventSchema, getTemporalState } from "./session-runtime.ts";

const homePage = getHomePageContent();
const accessibilityStatement = getAccessibilityStatementContent();
const contactInfo = loadContactInfo();
const consentAwareMicrocopy = getConsentAwareMicrocopyContent();
const privacyNotice = getPrivacyNoticeContent();
const sitePolicy = getSitePolicyContent();
const storageAccess = getStorageAccessContent();
const safeguardingInfo = loadSafeguardingInfo();
const siteSettings = loadSiteSettings();
const contactRouteState = deriveContactRouteState(contactInfo, siteSettings);
const safeguardingRouteState = deriveSafeguardingRouteState(safeguardingInfo);
const programmes = listProgrammes();
const sessions = listSessions();
const updatesFeedContent = getUpdatesFeedContent();
const editorialFeed = buildEditorialFeedModel(updatesFeedContent);
const homeActionIndex = new Map(homePage.actions.map((action) => [action.id, action]));

type HomeQuickActionItem = {
  title: string;
  summary: string;
  href: string;
  icon: MediaAsset;
};

type HomeTrustItem = {
  title: string;
  summary: string;
  href: string;
  actionLabel: string;
  icon: MediaAsset;
};

type HomeStateCopy = {
  title: string;
  summary: string;
};

type BadgeTone = "default" | "soft" | "accent" | "inverse" | "meta" | "success";
type HomeSectionTone = "default" | "band" | "tint";
type HomeSectionWidth = "default" | "wide";
type NoticeTone = "error" | "info" | "important" | "success";
type NoticeModel = {
  title?: string;
  body: string;
  tone: NoticeTone;
};
type ActionableNoticeModel = NoticeModel & {
  action?: ActionLink;
};

type HomeSectionBase = {
  id: string;
  eyebrow: string;
  title: string;
  summary?: string;
  tone?: HomeSectionTone;
  width?: HomeSectionWidth;
};

type HomeQuickActionsSection = HomeSectionBase & {
  kind: "quick-actions";
  items: HomeQuickActionItem[];
};

type HomeTrustStripSection = HomeSectionBase & {
  kind: "trust-strip";
  items: HomeTrustItem[];
};

type HomeLiveSessionsSection = HomeSectionBase & {
  kind: "live-sessions";
  state: "available" | "paused" | "unavailable";
  items: ReturnType<typeof buildSessionCardModel>[];
  primaryAction?: ActionLink;
  secondaryAction?: ActionLink;
  emptyState?: HomeStateCopy;
  pausedState?: HomeStateCopy;
};

type HomeProgrammeTeasersSection = HomeSectionBase & {
  kind: "programme-teasers";
  items: ReturnType<typeof buildProgrammeCardModel>[];
  primaryAction?: ActionLink;
};

type HomePageTeaserSection = HomeSectionBase & {
  kind: "page-teaser";
  summary: string;
  badges: string[];
  media?: MediaAsset;
  disclosure?: MediaDisclosure | null;
  href: string;
  action?: ActionLink;
};

type HomeFeatureSplitSection = HomeSectionBase & {
  kind: "feature-split";
  summary: string;
  bullets: string[];
  badges: string[];
  media: MediaAsset;
  disclosure?: MediaDisclosure | null;
  primaryAction?: ActionLink;
  secondaryAction?: ActionLink;
  reversed: boolean;
};

type HomeUpdateItem = {
  id: string;
  title: string;
  summary: string;
  href: string;
  metaLabel: string;
  updateType: string;
};

type HomeUpdatesSurfaceSection = HomeSectionBase & {
  kind: "updates-surface";
  state: "present" | "absent";
  items: HomeUpdateItem[];
  primaryAction?: ActionLink;
  emptyBehavior?: string;
  emptyState?: HomeStateCopy;
};

type HomeFaqClusterSection = HomeSectionBase & {
  kind: "faq-cluster";
  faqGroupId: string;
  faqs: { question: string; answer: string; audienceTags: string[] }[];
  primaryAction?: ActionLink;
};

type HomeContactPanelSection = HomeSectionBase & {
  kind: "contact-panel";
  summary: string;
  primaryAction?: ActionLink;
  secondaryAction?: ActionLink;
  surfaceId: string;
  formHeading: string;
  formIntro: string;
  organizationName: string;
  privacyNote: string;
  privacyHighlights: string[];
  privacyNoticeTitle: string;
  privacyNoticeActionLabel: string;
  messageHelper: string;
  updatesOptInLabel: string;
  emailFallbackPrefix: string;
  noScriptNote: string;
  invalidStatusMessage: string;
  submittingStatusMessage: string;
  email: string;
  reasons: typeof contactInfo.reasonOptions;
  successMessage: string;
  urgentGuidance: string;
};

export type HomeSectionModel =
  | HomeQuickActionsSection
  | HomeTrustStripSection
  | HomeLiveSessionsSection
  | HomeProgrammeTeasersSection
  | HomePageTeaserSection
  | HomeFeatureSplitSection
  | HomeUpdatesSurfaceSection
  | HomeFaqClusterSection
  | HomeContactPanelSection;

const programmeIndex = new Map(
  programmes.map((programme) => [programme.slug, programme])
);
const sessionIndex = new Map(sessions.map((session) => [session.slug, session]));

type EditorialMetaRow = {
  kind: "date" | "location" | "status" | "time";
  label: string;
};

type InvolvementPathwayTone = "accent" | "soft" | "success";

type InvolvementPathwayModel = {
  id: string;
  title: string;
  summary: string;
  statusLabel: string;
  supportingText: string;
  trustNote: string;
  supportPoints: string[];
  icon: MediaAsset;
  actions: ActionLink[];
  tone: InvolvementPathwayTone;
};

type InvolvementInfoCardTone = "accent" | "callout" | "default" | "muted" | "soft";

type InvolvementInfoSectionModel = {
  eyebrow?: string;
  title: string;
  summary?: string;
  items: Array<{
    title: string;
    body: string;
    tone: InvolvementInfoCardTone;
    icon?: MediaAsset;
  }>;
  note?: ActionableNoticeModel;
};

type ContactMethodCardModel = {
  title: string;
  summary: string;
  detail?: string;
  note?: string | null;
  statusLabel: string;
  statusTone: BadgeTone;
  icon: MediaAsset;
  actions: ActionLink[];
  bullets: string[];
  tone: "accent" | "callout" | "default" | "muted" | "soft";
};

type ContactLocationSectionModel = {
  eyebrow?: string;
  title: string;
  summary?: string;
  cards: Array<{
    title: string;
    body: string;
    tone: "accent" | "callout" | "default" | "muted" | "soft";
    actions: ActionLink[];
  }>;
  note?: ActionableNoticeModel;
};

type ResiliencePanelModel = {
  id: string;
  stateId: string;
  presentation: "panel" | "status";
  eyebrow?: string;
  title: string;
  summary: string;
  body?: string;
  bullets: string[];
  actions: ActionLink[];
  tone: "default" | NoticeTone;
};

type SafeguardingPanelModel = {
  title: string;
  summary: string;
  detail?: string;
  statusLabel: string;
  statusTone: BadgeTone;
  bullets: string[];
  actions: ActionLink[];
};

type SafeguardingRouteCardSource = {
  pageId: string;
  title: string;
  summary: string;
  audienceLabel: string;
  appliesTo: string[];
  signals: string[];
};

type InvolvementOpportunitySpotlightModel = {
  state: "absent" | "present";
  eyebrow?: string;
  title: string;
  summary?: string;
  item?: EditorialItemModel & {
    action: ActionLink;
  };
  emptyState?: {
    title: string;
    summary: string;
    action: ActionLink;
  };
  supportPanel: {
    eyebrow?: string;
    title: string;
    body: string;
    bullets: string[];
    action: ActionLink;
  };
};

type EditorialItemModel = {
  id: string;
  title: string;
  summary: string;
  href: string;
  actionLabel: string;
  updateType: "event" | "opportunity" | "update";
  typeLabel: string;
  metaLabel: string;
  metaRows: EditorialMetaRow[];
  featured: boolean;
  icon: MediaAsset;
  media?: MediaAsset;
  disclosure?: MediaDisclosure | null;
};

type EditorialDetailSectionModel = {
  id: string;
  eyebrow?: string;
  title: string;
  summary?: string;
  paragraphs: string[];
  bullets?: string[];
  badges?: string[];
  quote?: {
    attribution?: string;
    text: string;
  };
  media?: MediaAsset;
  disclosure?: MediaDisclosure | null;
  note?: {
    action?: ActionLink;
    body: string;
    title?: string;
    tone: "error" | "important" | "info" | "success";
  };
  actions?: ActionLink[];
  reversed?: boolean;
};

type EditorialFactItem = {
  title: string;
  body: string;
};

type EditorialFeedItem = (typeof editorialFeed.allItems)[number];
type EditorialContentSection = EditorialFeedItem["detail"]["sections"][number];

function requireValue<T>(value: T | null | undefined, message: string): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

function requirePage(pageId: string) {
  return requireValue(loadPageById(pageId), `Unknown page id: ${pageId}`);
}

function requireRoutePage(pageId: string) {
  return requireValue(
    getRoutePageContentById(pageId),
    `Missing route content definition for ${pageId}.`
  );
}

function requireSessionPageContent(pageId: string) {
  return requireValue(
    getSessionPageContentById(pageId),
    `Missing session page content for ${pageId}.`
  );
}

function requireProgrammePageContent(pageId: string) {
  return requireValue(
    getProgrammePageContentById(pageId),
    `Missing programme page content for ${pageId}.`
  );
}

function requireProgramme(slug: string) {
  return requireValue(getProgrammeBySlug(slug), `Unknown programme slug: ${slug}.`);
}

function requireSession(slug: string) {
  return requireValue(loadSessionBySlug(slug), `Unknown session slug: ${slug}.`);
}

function requireEditorialItem(slug: string) {
  return requireValue(
    editorialFeed.allItems.find(
      (item: EditorialFeedItem) => item.slug === slug && item.detailVisible
    ),
    `Unknown editorial item slug: ${slug}.`
  );
}

function requireFaqGroup(groupId: string) {
  return requireValue(getFaqGroupById(groupId), `Unknown FAQ group: ${groupId}`);
}

function requireFormSurface(surfaceId: string) {
  return requireValue(
    getFormSurfaceById(surfaceId),
    `Unknown form surface: ${surfaceId}.`
  );
}

function requireInvolvementRoute(routeId: string) {
  return requireValue(
    getInvolvementRouteById(routeId),
    `Unknown involvement route: ${routeId}.`
  );
}

function requireTrustSignal(signalId: string) {
  return requireValue(
    getTrustSignalById(signalId),
    `Unknown trust signal id: ${signalId}.`
  );
}

function requireHomeAction(actionId: string) {
  return requireValue(
    homeActionIndex.get(actionId),
    `Unknown home action id: ${actionId}.`
  );
}

function requireHomeSection(sectionId: string) {
  return requireValue(
    homePage.sections.find((section) => section.id === sectionId),
    `Unknown home section id: ${sectionId}.`
  );
}

function getPageRoute(pageId: string): string {
  return requirePage(pageId).route;
}

function getMedia(mediaId: string): MediaAsset {
  return getMediaAsset(mediaId);
}

function getCta(ctaId: string): ActionLink {
  const cta = requireValue(getCtaById(ctaId), `Unknown CTA id: ${ctaId}`);

  return createAction(
    cta.label,
    cta.href ?? getPageRoute(cta.routeId as string),
    cta.style as ActionVariant
  );
}

function createAction(label: string, href: string, variant: ActionVariant): ActionLink {
  return {
    label,
    href,
    variant
  };
}

function resolveHomeAction(actionId: string) {
  const action = requireHomeAction(actionId);
  const link = action.ctaId
    ? getCta(action.ctaId)
    : createAction(
        action.label as string,
        action.href ?? getPageRoute(action.routeId as string),
        action.variant as ActionVariant
      );

  return {
    id: action.id,
    label: link.label,
    href: link.href,
    variant: link.variant,
    summary: action.summary,
    icon: action.iconAssetId ? getMedia(action.iconAssetId) : undefined,
    audiences: action.audiences,
    placements: action.placements
  };
}

function resolveActionReference(reference: {
  label: string;
  variant: string;
  routeId?: string;
  href?: string;
}) {
  return createAction(
    reference.label,
    reference.href ?? getPageRoute(reference.routeId as string),
    reference.variant as ActionVariant
  );
}

function getEditorialItemIcon(updateType: "event" | "opportunity" | "update") {
  if (updateType === "event") {
    return getMedia("icon-community-event");
  }

  if (updateType === "opportunity") {
    return getMedia("icon-contact");
  }

  return getMedia("icon-growth");
}

function buildEditorialHandoffHref(item: { href?: string; routeId?: string }) {
  return item.href ?? getPageRoute(item.routeId as string);
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function buildEditorialFactItems(item: EditorialFeedItem): EditorialFactItem[] {
  if (item.updateType === "event") {
    return [
      {
        title: item.eventDate ? "Date" : "Current timing",
        body: item.eventDate
          ? (item.metaRows.find((entry: EditorialMetaRow) => entry.kind === "date")
              ?.label ?? item.lifecycleLabel)
          : (item.dateLabel ?? item.lifecycleLabel)
      },
      {
        title: "Time",
        body: item.timeLabel ?? "Shared when confirmed"
      },
      {
        title: "Location",
        body: item.locationLabel ?? siteSettings.serviceAreaLabel
      },
      {
        title: "Status",
        body: item.statusLabel ?? item.lifecycleLabel
      }
    ];
  }

  const nextStepLabel = item.actionLabel ?? "Use the related route";
  const publishedLabel = item.publishDate
    ? (item.metaRows.find((entry: EditorialMetaRow) => entry.kind === "date")?.label ??
      "Published")
    : "Published when guidance is ready";
  const closingLabel =
    item.endDate && item.hasClosedDate
      ? `Closed ${formatDisplayDate(item.endDate)}`
      : item.endDate
        ? `Closes ${formatDisplayDate(item.endDate)}`
        : "No closing date published";

  return [
    {
      title: "Published",
      body: publishedLabel
    },
    {
      title: "Status",
      body: item.statusLabel ?? item.lifecycleLabel
    },
    {
      title: "Closing point",
      body: item.updateType === "opportunity" ? closingLabel : item.lifecycleLabel
    },
    {
      title: "Best next step",
      body: nextStepLabel
    }
  ];
}

function buildEditorialNarrativeSections(
  item: EditorialFeedItem
): EditorialDetailSectionModel[] {
  return item.detail.sections.map((section: EditorialContentSection) => {
    const media = section.mediaId ? getMedia(section.mediaId) : undefined;

    return {
      id: section.id,
      eyebrow: section.eyebrow,
      title: section.title,
      summary: section.summary,
      paragraphs: section.paragraphs,
      bullets: section.bullets,
      badges: section.badges,
      quote: section.quote,
      media,
      disclosure: buildMediaDisclosure(media, "narrative"),
      note: buildActionableNoticeModel(section.note),
      actions: (section.actionReferences ?? []).map(resolveActionReference),
      reversed: section.reversed
    };
  });
}

function buildEditorialLifecycleNotice(item: EditorialFeedItem) {
  if (item.updateType === "event") {
    if (item.temporalState === "past-event") {
      return {
        title: "Past event",
        body: "This event detail stays accessible as a record, but it should not appear current in the live feed.",
        tone: "info" as const
      };
    }

    if (item.temporalState === "cancelled") {
      return {
        title: "Event cancelled",
        body: "This page remains accessible so the cancellation notice stays clear, but it should not read like an upcoming event.",
        tone: "important" as const
      };
    }

    if (item.temporalState === "postponed") {
      return {
        title: "Event postponed",
        body: "The event has been postponed. Keep this page focused on the latest public guidance until a new date is ready to share.",
        tone: "info" as const
      };
    }

    if (item.temporalState === "date-to-be-confirmed") {
      return {
        title: "Dates still to be confirmed",
        body: "This page is live so public guidance has one place to live, but date and time details should only be added when they are confirmed.",
        tone: "info" as const
      };
    }

    return undefined;
  }

  if (item.temporalState === "superseded") {
    return {
      title: "Superseded update",
      body: "This detail page remains accessible for context, but a newer route or message now carries the current guidance.",
      tone: "info" as const
    };
  }

  if (item.temporalState === "closed" || item.temporalState === "archived") {
    return {
      title: item.temporalState === "archived" ? "Archived item" : "Closed item",
      body: "This detail page remains accessible as a record, but it should not be treated as a current public opportunity.",
      tone: "info" as const
    };
  }

  return undefined;
}

function buildEditorialRelatedItems(item: EditorialFeedItem): EditorialItemModel[] {
  const relatedIds = item.detail.relatedItemIds ?? [];

  return relatedIds
    .map((relatedId: string) =>
      editorialFeed.allItems.find((entry: EditorialFeedItem) => entry.id === relatedId)
    )
    .filter(Boolean)
    .filter(
      (entry: EditorialFeedItem | undefined): entry is EditorialFeedItem =>
        Boolean(entry) && entry.id !== item.id && entry.detailVisible
    )
    .map((entry: EditorialFeedItem) => buildEditorialItemModel(entry));
}

function buildEditorialItemModel(item: EditorialFeedItem): EditorialItemModel {
  const media = item.mediaId ? getMedia(item.mediaId) : undefined;

  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: buildEditorialDetailHref(item),
    actionLabel: item.cardActionLabel ?? "View details",
    updateType: item.updateType,
    typeLabel: item.typeLabel,
    metaLabel: item.metaLabel,
    metaRows: item.metaRows as EditorialMetaRow[],
    featured: Boolean(item.featured),
    icon: getEditorialItemIcon(item.updateType),
    media,
    disclosure: buildMediaDisclosure(media, "listing")
  };
}

function buildMeta(
  pageId: string,
  description: string,
  options: {
    path?: string;
    title?: string;
    summary?: string;
    breadcrumbLabel?: string;
    media?: MediaAsset | null;
    ogType?: "article" | "website";
    indexable?: boolean;
  } = {}
) {
  return buildSeoMetadata({
    pageId,
    path: options.path,
    title: options.title,
    description,
    summary: options.summary,
    breadcrumbLabel: options.breadcrumbLabel,
    media: options.media,
    ogType: options.ogType,
    indexable: options.indexable
  });
}

function buildBreadcrumbs(currentLabel: string, currentHref: string) {
  return [
    { label: "Home", href: "/" },
    { label: currentLabel, href: currentHref }
  ];
}

function usesCookieBanner() {
  return storageAccess.settings.consentExperience === "banner";
}

function getCookieEntryPointNotice() {
  return {
    title: consentAwareMicrocopy.notices.cookieEntryPoint.title,
    body: usesCookieBanner()
      ? consentAwareMicrocopy.notices.cookieEntryPoint.whenBannerPresent
      : consentAwareMicrocopy.notices.cookieEntryPoint.whenNoBanner
  };
}

function getCalendarDownloadNoticeBody(state: "available" | "unavailable") {
  return state === "available"
    ? consentAwareMicrocopy.notices.calendarDownload.availableBody
    : consentAwareMicrocopy.notices.calendarDownload.unavailableBody;
}

function getMapLinkNoticeBody() {
  return contactInfo.locationGuidance.publicDirectionsUrl
    ? consentAwareMicrocopy.notices.mapExternalLink.body
    : null;
}

function formatStorageCategoryLabel(category: string) {
  switch (category) {
    case "communication-delivery":
      return "Communication delivery";
    case "service-essential":
      return "Service essential";
    case "appearance-helper":
      return "Appearance helper";
    case "statistical":
      return "Statistical / measurement";
    case "non-essential":
      return "Non-essential";
    default:
      return category;
  }
}

function formatStoragePartyLabel(party: string) {
  switch (party) {
    case "first-party":
      return "First party";
    case "third-party":
      return "Third party";
    default:
      return party;
  }
}

function formatStorageActivationLabel(activation: string) {
  switch (activation) {
    case "always-on":
      return "Runs on page load";
    case "user-triggered":
      return "Only after a user action";
    default:
      return activation;
  }
}

function formatStoragePersistenceLabel(persistence: string) {
  switch (persistence) {
    case "none":
      return "No on-device storage";
    case "session":
      return "Session only";
    case "persistent":
      return "Persists between visits";
    default:
      return persistence;
  }
}

function buildNoticeModel(
  notice:
    | {
        title?: string;
        body: string;
        tone: string;
      }
    | undefined
): NoticeModel | undefined {
  return notice
    ? {
        title: notice.title,
        body: notice.body,
        tone: notice.tone as NoticeTone
      }
    : undefined;
}

function buildActionableNoticeModel(
  notice:
    | {
        title?: string;
        body: string;
        tone: string;
        action?: {
          label: string;
          variant: string;
          routeId?: string;
          href?: string;
        };
      }
    | undefined
): ActionableNoticeModel | undefined {
  return notice
    ? {
        title: notice.title,
        body: notice.body,
        tone: notice.tone as NoticeTone,
        action: notice.action ? resolveActionReference(notice.action) : undefined
      }
    : undefined;
}

function buildResilienceActions(surface: {
  primaryAction?: {
    label: string;
    variant: string;
    routeId?: string;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    variant: string;
    routeId?: string;
    href?: string;
  };
  actions?: Array<{
    label: string;
    variant: string;
    routeId?: string;
    href?: string;
  }>;
}) {
  return [
    ...(surface.primaryAction ? [resolveActionReference(surface.primaryAction)] : []),
    ...(surface.secondaryAction ? [resolveActionReference(surface.secondaryAction)] : []),
    ...((surface.actions ?? []).map(resolveActionReference) as ActionLink[])
  ];
}

function buildResiliencePanelModel(surfaceId: string): ResiliencePanelModel {
  const surface = requireResilienceSurface(surfaceId);

  return {
    id: surface.id,
    stateId: surface.stateId,
    presentation: surface.presentation as "panel" | "status",
    eyebrow: surface.eyebrow,
    title: surface.title,
    summary: (surface.summary ?? surface.body ?? surface.title) as string,
    body:
      surface.summary && surface.body && surface.body !== surface.summary
        ? surface.body
        : undefined,
    bullets: surface.bullets ?? [],
    actions: buildResilienceActions(surface),
    tone: (surface.tone ?? "default") as ResiliencePanelModel["tone"]
  };
}

function buildResilienceNoticeModel(surfaceId: string): NoticeModel {
  const surface = requireResilienceSurface(surfaceId);

  return {
    title: surface.title,
    body: (surface.body ?? surface.summary ?? surface.title) as string,
    tone: (surface.tone ?? "info") as NoticeTone
  };
}

function buildInlineEmptyStateModel(
  emptyState:
    | {
        eyebrow: string;
        title: string;
        summary: string;
        primaryAction: {
          label: string;
          variant: string;
          routeId?: string;
          href?: string;
        };
        secondaryAction?: {
          label: string;
          variant: string;
          routeId?: string;
          href?: string;
        };
      }
    | undefined
) {
  return emptyState
    ? {
        eyebrow: emptyState.eyebrow,
        title: emptyState.title,
        summary: emptyState.summary,
        primaryAction: resolveActionReference(emptyState.primaryAction),
        secondaryAction: emptyState.secondaryAction
          ? resolveActionReference(emptyState.secondaryAction)
          : undefined
      }
    : undefined;
}

function buildIconPanelItems(
  items: Array<{
    title: string;
    body: string;
    tone?: string;
    iconAssetId?: string;
  }>
) {
  return items.map((item) => ({
    title: item.title,
    body: item.body,
    tone: (item.tone ?? "default") as InvolvementInfoCardTone,
    icon: item.iconAssetId ? getMedia(item.iconAssetId) : undefined
  }));
}

function buildInvolvementRoleItems(
  items: Array<{
    eyebrow?: string;
    title: string;
    summary: string;
    bullets?: string[];
    note?: string;
    iconAssetId: string;
    action?: {
      label: string;
      variant: string;
      routeId?: string;
      href?: string;
    };
  }>
) {
  return items.map((item) => ({
    eyebrow: item.eyebrow,
    title: item.title,
    summary: item.summary,
    bullets: item.bullets ?? [],
    note: item.note,
    icon: getMedia(item.iconAssetId),
    action: item.action ? resolveActionReference(item.action) : undefined
  }));
}

function buildInvolvementInfoSectionModel(
  section:
    | {
        eyebrow?: string;
        title: string;
        summary?: string;
        items: Array<{
          title: string;
          body: string;
          tone?: string;
          iconAssetId?: string;
        }>;
        note?: {
          title?: string;
          body: string;
          tone: string;
          action?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
      }
    | undefined,
  label: string
): InvolvementInfoSectionModel {
  const requiredSection = requireValue(section, label);

  return {
    eyebrow: requiredSection.eyebrow,
    title: requiredSection.title,
    summary: requiredSection.summary,
    items: buildIconPanelItems(requiredSection.items),
    note: buildActionableNoticeModel(requiredSection.note)
  };
}

function buildProofBoundaryModel(
  section:
    | {
        eyebrow?: string;
        title: string;
        summary?: string;
        publishNow: string[];
        awaitingConfirmation: string[];
        withheldUntilVerified: string[];
      }
    | undefined,
  label: string
) {
  const requiredSection = requireValue(section, label);

  return {
    eyebrow: requiredSection.eyebrow,
    title: requiredSection.title,
    summary: requiredSection.summary,
    publishNow: requiredSection.publishNow,
    awaitingConfirmation: requiredSection.awaitingConfirmation,
    withheldUntilVerified: requiredSection.withheldUntilVerified
  };
}

function buildSessionTimingSummary(
  temporal: ReturnType<typeof getTemporalState>
): string {
  const parts = [temporal.recurrenceLabel, temporal.timeRangeLabel];

  if (temporal.nextDateTimeLabel) {
    parts.push(`Next session ${temporal.nextDateTimeLabel}`);
  } else if (temporal.nextDateLabel) {
    parts.push(`Next session ${temporal.nextDateLabel}`);
  } else if (temporal.statusLabel) {
    parts.push(temporal.statusLabel);
  }

  return parts.filter(Boolean).join(". ");
}

function buildSessionLocationNote(
  session: (typeof sessions)[number],
  intro: {
    locationNotePrefix: string;
    locationNoteSuffix: string;
  }
) {
  return `${intro.locationNotePrefix} ${session.location.locality}. ${intro.locationNoteSuffix}`;
}

function buildSupportFormModel(surfaceId: string) {
  const surface = requireFormSurface(surfaceId);
  const microcopy = getSupportFormMicrocopy();
  const allowedReasonIds =
    surface.allowedReasonIds ?? contactInfo.reasonOptions.map((reason) => reason.id);
  const reasons = contactInfo.reasonOptions.filter((reason) =>
    allowedReasonIds.includes(reason.id)
  );

  if (reasons.length === 0) {
    throw new Error(
      `Support form surface ${surfaceId} does not expose any known reasons.`
    );
  }

  if (
    surface.defaultReasonId &&
    !reasons.some((reason) => reason.id === surface.defaultReasonId)
  ) {
    throw new Error(
      `Support form surface ${surfaceId} uses an unknown defaultReasonId: ${surface.defaultReasonId}.`
    );
  }

  const defaultReasonId =
    surface.defaultReasonId ?? (reasons.length === 1 ? reasons[0].id : undefined);
  const reasonSelectPlaceholder =
    surface.reasonSelectPlaceholder !== undefined
      ? surface.reasonSelectPlaceholder
      : defaultReasonId
        ? null
        : "Select one";
  const reasonFieldMode = (surface.reasonFieldMode ?? "select") as "hidden" | "select";

  return {
    surfaceId: surface.id,
    eyebrow: surface.eyebrow ?? "Get support",
    formHeading: surface.heading,
    formIntro: surface.intro,
    organizationName: siteSettings.siteName,
    privacyNote: surface.privacyNote ?? contactInfo.formPrivacyNote,
    privacyHighlights: surface.privacyHighlights ?? [],
    privacyNoticeTitle: microcopy.privacyNoticeTitle,
    privacyNoticeActionLabel: consentAwareMicrocopy.labels.privacyNoticeActionLabel,
    messageHelper: surface.messageHelper ?? microcopy.messageHelper,
    updatesOptInLabel: microcopy.updatesOptInLabel,
    showUpdatesOptIn: surface.showUpdatesOptIn ?? true,
    emailFallbackPrefix: surface.emailFallbackPrefix ?? microcopy.emailFallbackPrefix,
    noScriptNote: getResilienceSurfaceText("form-noscript"),
    invalidStatusMessage: getResilienceSurfaceText("form-validation-error"),
    submittingStatusMessage: getResilienceSurfaceText("form-submitting"),
    email: contactInfo.publicEmail,
    reasons,
    successMessage: surface.successMessage,
    defaultReasonId,
    reasonFieldLabel: surface.reasonFieldLabel ?? "What do you need help with?",
    reasonSelectPlaceholder,
    reasonFieldMode,
    submitLabel: surface.submitLabel ?? "Send message"
  };
}

function buildSessionCardModel(session: (typeof sessions)[number]) {
  const temporal = getTemporalState(session);

  return {
    title: session.shortTitle,
    summary: session.summary,
    href: session.route,
    calendarHref: temporal.calendar.href,
    timeLabel: temporal.timeRangeLabel,
    nextLabel: temporal.nextLabel,
    statusLabel: temporal.statusLabel,
    statusMessage: temporal.statusMessage,
    icon: getMedia(session.featuredIconId)
  };
}

function getRelatedProgrammeForSession(session: (typeof sessions)[number]) {
  return session.programmeIds
    .map((programmeId) => programmeIndex.get(programmeId))
    .find(Boolean);
}

function buildSessionHubCardModel(session: (typeof sessions)[number]) {
  const temporal = getTemporalState(session);
  const relatedProgramme = requireValue(
    getRelatedProgrammeForSession(session),
    `Missing related programme for session ${session.slug}.`
  );

  return {
    title: session.shortTitle,
    summary: session.summary,
    recurrenceLabel: temporal.recurrenceLabel,
    timeLabel: temporal.timeRangeLabel,
    nextDateTimeLabel: temporal.nextDateTimeLabel,
    nextShortLabel: temporal.nextShortLabel,
    statusLabel: temporal.statusLabel,
    statusMessage: temporal.statusMessage,
    state: temporal.state,
    calendarState: temporal.calendar.state,
    detailAction: createAction("See details", session.route, "secondary"),
    calendarAction: temporal.calendar.href
      ? createAction("Add to calendar", temporal.calendar.href, "text")
      : undefined,
    calendarNote:
      temporal.state === "scheduled" && temporal.calendar.state === "unavailable"
        ? getCalendarDownloadNoticeBody("unavailable")
        : null,
    programmeTitle: relatedProgramme.title,
    programmeAction: createAction("See programme", relatedProgramme.route, "text"),
    bullets: [
      ...session.featureBullets.slice(0, 2),
      session.location.disclosurePolicy === "shared-on-enquiry"
        ? "Venue details are shared on enquiry once the right route is clear."
        : null
    ].filter(Boolean) as string[],
    reassurance: session.trustNotes[0] ?? null,
    icon: getMedia(session.featuredIconId)
  };
}

function formatCountWord(count: number) {
  return (
    {
      0: "No",
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four"
    }[count] ?? String(count)
  );
}

function buildSessionHubStateModel(
  items: Array<ReturnType<typeof buildSessionHubCardModel>>
) {
  const aggregate = deriveSessionHubState(
    items.map((item) => ({
      state: item.state,
      calendarState: item.calendarState
    }))
  );

  const liveCountLabel = `${formatCountWord(aggregate.liveCount)} Saturday ${
    aggregate.liveCount === 1 ? "session" : "sessions"
  }`;

  let title = `${liveCountLabel} currently live.`;
  let summary =
    "The live cards below show the next date, the time window, and the cleanest route into the right session.";
  let tone: "important" | "info" | "success" =
    aggregate.calendarAvailability === "available" ? "success" : "info";

  if (aggregate.availability === "mixed") {
    title = "One Saturday session is currently live.";
    summary =
      "Use the live card below first. If the paused or limited offer was the one you expected, the contact route stays open for questions.";
  }

  if (aggregate.availability === "unavailable") {
    title = "Public Saturday dates are limited right now.";
    summary =
      "Use the contact route for the right next step while the team confirms the next live dates directly.";
    tone = "important";
  } else if (aggregate.calendarAvailability === "partial") {
    summary =
      "The live cards below still show the next date. If a calendar file is missing, use the detail page or contact route for confirmation.";
  } else if (aggregate.calendarAvailability === "unavailable") {
    summary =
      "The live cards below still show the next date, but calendar downloads are not available right now.";
  }

  return {
    ...aggregate,
    title,
    summary,
    tone
  };
}

function buildInvolvementPathwayModel(
  route: ReturnType<typeof requireInvolvementRoute>,
  options: {
    liveCount?: number;
    opportunityItem?: EditorialFeedItem | null;
    sessionAvailability?: "available" | "mixed" | "unavailable";
  } = {}
): InvolvementPathwayModel {
  const derivedState = deriveInvolvementPathwayState(route, options);

  return {
    id: route.id,
    title: route.title,
    summary: route.summary,
    statusLabel: derivedState.statusLabel,
    supportingText: derivedState.supportingText,
    trustNote: route.trustNote,
    supportPoints: route.supportPoints ?? [],
    icon: getMedia(route.iconAssetId),
    actions: [route.primaryAction, route.secondaryAction]
      .filter(Boolean)
      .map((action) => resolveActionReference(action)),
    tone: derivedState.tone as InvolvementPathwayTone
  };
}

function buildContactMethodCardModel(card: {
  methodId: "email" | "phone" | "instagram" | "safeguarding";
  title: string;
  summary: string;
  bullets?: string[];
  tone?: string;
  actionLabel?: string;
}): ContactMethodCardModel {
  const tone = (card.tone ?? "default") as ContactMethodCardModel["tone"];

  if (card.methodId === "email") {
    return {
      title: card.title,
      summary: card.summary,
      detail: contactRouteState.email.value,
      note: null,
      statusLabel: contactRouteState.email.statusLabel,
      statusTone: "success",
      icon: getMedia("icon-contact"),
      bullets: card.bullets ?? [],
      tone,
      actions: [
        createAction(
          card.actionLabel ?? "Email the team",
          contactRouteState.email.href,
          "primary"
        )
      ]
    };
  }

  if (card.methodId === "phone") {
    const phoneAvailable = contactRouteState.phone.state === "available";

    return {
      title: card.title,
      summary: card.summary,
      detail: phoneAvailable
        ? (contactRouteState.phone.value as string)
        : "Public phone number not yet confirmed",
      note: null,
      statusLabel: contactRouteState.phone.statusLabel,
      statusTone: phoneAvailable ? "success" : "meta",
      icon: getMedia("icon-contact"),
      bullets: card.bullets ?? [],
      tone,
      actions: [
        createAction(
          card.actionLabel ?? (phoneAvailable ? "Call the team" : "Use the short form"),
          contactRouteState.phone.href ?? "#contact-form",
          phoneAvailable ? "primary" : "surface"
        )
      ]
    };
  }

  if (card.methodId === "instagram") {
    const socialAvailable = contactRouteState.social.state === "available";

    return {
      title: card.title,
      summary: card.summary,
      detail: socialAvailable ? (contactRouteState.social.value as string) : undefined,
      note: socialAvailable
        ? consentAwareMicrocopy.notices.socialExternalLink.body
        : null,
      statusLabel: contactRouteState.social.statusLabel,
      statusTone: socialAvailable ? "soft" : "meta",
      icon: getMedia("icon-growth"),
      bullets: card.bullets ?? [],
      tone,
      actions: socialAvailable
        ? [
            createAction(
              card.actionLabel ?? "Open Instagram",
              contactRouteState.social.href as string,
              "secondary"
            )
          ]
        : []
    };
  }

  return {
    title: card.title,
    summary: card.summary,
    detail: "Immediate danger should go to emergency services",
    note: null,
    statusLabel: "Separate safeguarding route",
    statusTone: "accent",
    icon: getMedia("icon-safe-space"),
    bullets: card.bullets ?? [],
    tone,
    actions: [
      createAction(
        card.actionLabel ?? "Read safeguarding",
        getPageRoute(contactInfo.urgentGuidance.safeguardingRouteId),
        "primary"
      )
    ]
  };
}

function buildContactLocationSectionModel(section: {
  eyebrow?: string;
  title: string;
  summary?: string;
  cards: Array<{
    title: string;
    body: string;
    tone?: string;
    action?: {
      label: string;
      variant: string;
      routeId?: string;
      href?: string;
    };
  }>;
  note?: {
    title?: string;
    body: string;
    tone: string;
    action?: {
      label: string;
      variant: string;
      routeId?: string;
      href?: string;
    };
  };
}): ContactLocationSectionModel {
  return {
    eyebrow: section.eyebrow,
    title: section.title,
    summary: section.summary,
    cards: section.cards.map((card) => ({
      title: card.title,
      body: card.body,
      tone: (card.tone ??
        "default") as ContactLocationSectionModel["cards"][number]["tone"],
      actions: card.action ? [resolveActionReference(card.action)] : []
    })),
    note: buildActionableNoticeModel(section.note)
  };
}

function buildInvolvementOpportunitySpotlightModel(
  spotlightSection: {
    eyebrow?: string;
    title: string;
    summary?: string;
    emptyTitle: string;
    emptySummary: string;
    fallbackAction: {
      label: string;
      variant: string;
      routeId?: string;
      href?: string;
    };
    supportPanel: {
      eyebrow?: string;
      title: string;
      body: string;
      bullets?: string[];
      action: {
        label: string;
        variant: string;
        routeId?: string;
        href?: string;
      };
    };
  },
  item: EditorialFeedItem | null
): InvolvementOpportunitySpotlightModel {
  const supportPanel = {
    eyebrow: spotlightSection.supportPanel.eyebrow,
    title: spotlightSection.supportPanel.title,
    body: spotlightSection.supportPanel.body,
    bullets: spotlightSection.supportPanel.bullets ?? [],
    action: resolveActionReference(spotlightSection.supportPanel.action)
  };

  if (!item) {
    return {
      state: "absent",
      eyebrow: spotlightSection.eyebrow,
      title: spotlightSection.title,
      summary: spotlightSection.summary,
      emptyState: {
        title: spotlightSection.emptyTitle,
        summary: spotlightSection.emptySummary,
        action: resolveActionReference(spotlightSection.fallbackAction)
      },
      supportPanel
    };
  }

  const spotlightItem = buildEditorialItemModel(item);

  return {
    state: "present",
    eyebrow: spotlightSection.eyebrow,
    title: spotlightSection.title,
    summary: spotlightSection.summary,
    item: {
      ...spotlightItem,
      action: createAction(spotlightItem.actionLabel, spotlightItem.href, "surface")
    },
    supportPanel
  };
}

function buildProgrammeCardModel(
  programme: (typeof programmes)[number],
  ctaLabel = "Explore programme"
) {
  const media = getMedia(programme.featuredMediaId);

  return {
    title: programme.shortTitle,
    summary: programme.promise,
    href: programme.route,
    media,
    disclosure: buildMediaDisclosure(media, "card"),
    tags: programme.bodySections[0]?.bullets ?? programme.outcomeBullets.slice(0, 3),
    ctaLabel
  };
}

function getProgrammeLinkedSessions(programme: (typeof programmes)[number]) {
  return programme.relatedSessionIds
    .map((sessionId) => sessionIndex.get(sessionId))
    .filter(Boolean) as Array<(typeof sessions)[number]>;
}

function buildProgrammeLinkedSessionSummary(session: (typeof sessions)[number]) {
  const temporal = getTemporalState(session);
  const summaryParts = [temporal.recurrenceLabel, temporal.timeRangeLabel];

  if (temporal.nextShortLabel) {
    summaryParts.push(`next ${temporal.nextShortLabel}`);
  } else if (temporal.statusLabel) {
    summaryParts.push(temporal.statusLabel);
  }

  return {
    title: session.shortTitle,
    href: session.route,
    summary: summaryParts.filter(Boolean).join(" · ")
  };
}

function buildProgrammeStateModel(programme: (typeof programmes)[number]) {
  const defaults = getProgrammePageDefaults();
  const linkedSessions = getProgrammeLinkedSessions(programme);
  const linkedSessionSummaries = linkedSessions.map(buildProgrammeLinkedSessionSummary);
  const scheduledSession = linkedSessions.find(
    (session) => getTemporalState(session).state === "scheduled"
  );

  return deriveProgrammeAccessState({
    existingDeliveryMode: programme.existingDeliveryMode,
    labels: {
      liveSession: {
        ...defaults.deliveryModeLabels.liveSession,
        tone: defaults.deliveryModeLabels.liveSession.tone as BadgeTone
      },
      sessionLimited: {
        ...defaults.deliveryModeLabels.sessionLimited,
        tone: defaults.deliveryModeLabels.sessionLimited.tone as BadgeTone
      },
      overviewOnly: {
        ...defaults.deliveryModeLabels.overviewOnly,
        tone: defaults.deliveryModeLabels.overviewOnly.tone as BadgeTone
      },
      enquiryOnly: {
        ...defaults.deliveryModeLabels.enquiryOnly,
        tone: defaults.deliveryModeLabels.enquiryOnly.tone as BadgeTone
      }
    },
    linkedSessionSummaries,
    scheduledLinkedSession: scheduledSession
      ? buildProgrammeLinkedSessionSummary(scheduledSession)
      : null
  });
}

function buildProgrammeOverviewCardModel(programme: (typeof programmes)[number]) {
  const defaults = getProgrammePageDefaults();
  const media = getMedia(programme.featuredMediaId);
  const state = buildProgrammeStateModel(programme);
  const secondaryAction =
    programme.primaryCtaId === "join-session" && state.linkedSession
      ? createAction(
          defaults.overviewCardSecondaryLabelWithSession,
          state.linkedSession.href,
          "text"
        )
      : createAction(
          defaults.overviewCardSecondaryLabelWithoutSession,
          getPageRoute("contact"),
          "text"
        );

  return {
    title: programme.title,
    summary: programme.promise,
    href: programme.route,
    media,
    icon: getMedia(programme.featuredIconId),
    disclosure: buildMediaDisclosure(media, "card"),
    audienceSummary: programme.audienceSummary,
    audienceHighlights: programme.audienceHighlights,
    deliverySummary: programme.deliverySummary,
    gains: programme.outcomeBullets,
    trustCues: programme.trustSignalIds.map(
      (signalId) => requireTrustSignal(signalId).label
    ),
    state,
    primaryAction: createAction(
      defaults.overviewCardPrimaryLabel,
      programme.route,
      "surface"
    ),
    secondaryAction
  };
}

function buildEmptyStateModel(pageId: string) {
  const page = requirePage(pageId);
  const pageContent = requireRoutePage(pageId);
  const emptyState = requireValue(
    pageContent.emptyState,
    `Missing empty-state definition for ${pageId}.`
  );

  return {
    meta: buildMeta(pageId, pageContent.metaDescription),
    breadcrumbs: buildBreadcrumbs(page.title, page.route),
    eyebrow: emptyState.eyebrow,
    title: emptyState.title,
    summary: emptyState.summary,
    primaryAction: resolveActionReference(emptyState.primaryAction),
    secondaryAction: emptyState.secondaryAction
      ? resolveActionReference(emptyState.secondaryAction)
      : undefined,
    editorialStatus: buildPlaceholderStatus(page),
    notice: buildNoticeModel(pageContent.notice)
  };
}

export function getHomePageModel() {
  const resolvedActions = new Map(
    homePage.actions.map((action) => [action.id, resolveHomeAction(action.id)])
  );
  const sessionCards = [...sessions]
    .sort((left, right) =>
      left.schedule.startTime.localeCompare(right.schedule.startTime)
    )
    .map(buildSessionCardModel);
  const sessionStates = sessions.map((session) => getTemporalState(session).state);
  const pausedSessionStates = new Set([
    "paused",
    "cancelled",
    "seasonal",
    "contact-only"
  ]);
  const liveSessionsState: "available" | "paused" | "unavailable" =
    sessionCards.length === 0
      ? "unavailable"
      : sessionStates.every((state) => pausedSessionStates.has(state))
        ? "paused"
        : "available";
  const updatesItems = editorialFeed.homeItems.map((item: EditorialFeedItem) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: buildEditorialDetailHref(item),
    metaLabel: item.metaLabel,
    updateType: item.updateType
  }));
  const shellNotices = getGlobalShellModel(
    homePage.stateRules.shellNotices.pageId
  ).notices;
  const contactState: "pending" | "verified" =
    homePage.stateRules.contact.pendingFields.some((field) => {
      switch (field) {
        case "publicPhone":
          return !contactInfo.publicPhone;
        case "venueName":
          return !contactInfo.venueName;
        case "venueAddress":
          return !contactInfo.venueAddress;
        default:
          return false;
      }
    })
      ? "pending"
      : "verified";
  const updatesState: "present" | "absent" =
    updatesItems.length > 0 ? "present" : "absent";
  const requiredDisclosureSectionIds =
    homePage.stateRules.aiDisclosures.requiredSectionIds.filter((sectionId) => {
      if (sectionId === "hero") {
        return Boolean(getMedia(homePage.hero.mediaId).noticeId);
      }

      const section = requireHomeSection(sectionId);

      if (section.kind === "programme-teasers") {
        return (section.programmeSlugs ?? []).some((slug) =>
          Boolean(requireProgramme(slug).featuredMediaId)
        );
      }

      return Boolean(section.mediaId && getMedia(section.mediaId).noticeId);
    });

  const sections: HomeSectionModel[] = homePage.sections.map((section) => {
    if (section.kind === "quick-actions") {
      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: section.tone as HomeSectionTone | undefined,
        width: section.width as HomeSectionWidth | undefined,
        items: (section.actionIds ?? []).map((actionId) => {
          const action = requireValue(
            resolvedActions.get(actionId),
            `Missing home action ${actionId}.`
          );

          return {
            title: action.label,
            summary: action.summary,
            href: action.href,
            icon: requireValue(action.icon, `Missing icon for quick action ${actionId}.`)
          };
        })
      };
    }

    if (section.kind === "trust-strip") {
      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: (section.tone as HomeSectionTone | undefined) ?? "tint",
        width: section.width as HomeSectionWidth | undefined,
        items: (section.trustItems ?? []).map((item) => {
          const signal = requireTrustSignal(item.signalId);
          const action = requireValue(
            resolvedActions.get(item.actionId),
            `Missing home action ${item.actionId}.`
          );

          return {
            title: signal.label,
            summary: signal.summary,
            icon: getMedia(signal.iconAssetId),
            href: action.href,
            actionLabel: action.label
          };
        })
      };
    }

    if (section.kind === "live-sessions") {
      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: (section.tone as HomeSectionTone | undefined) ?? "band",
        width: (section.width as HomeSectionWidth | undefined) ?? "wide",
        state: liveSessionsState,
        items: sessionCards.slice(0, section.maxItems ?? sessionCards.length),
        primaryAction: section.primaryActionId
          ? requireValue(
              resolvedActions.get(section.primaryActionId),
              `Missing home action ${section.primaryActionId}.`
            )
          : undefined,
        secondaryAction: section.secondaryActionId
          ? requireValue(
              resolvedActions.get(section.secondaryActionId),
              `Missing home action ${section.secondaryActionId}.`
            )
          : undefined,
        emptyState: section.emptyState,
        pausedState: section.pausedState
      };
    }

    if (section.kind === "programme-teasers") {
      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: section.tone as HomeSectionTone | undefined,
        width: section.width as HomeSectionWidth | undefined,
        items: (section.programmeSlugs ?? []).map((slug) =>
          buildProgrammeCardModel(requireProgramme(slug))
        ),
        primaryAction: section.primaryActionId
          ? requireValue(
              resolvedActions.get(section.primaryActionId),
              `Missing home action ${section.primaryActionId}.`
            )
          : undefined
      };
    }

    if (section.kind === "page-teaser") {
      const pageId = requireValue(section.pageId, `Missing page id for ${section.id}.`);
      const sourcePage = requirePage(pageId);
      const sourcePageContent = requireRoutePage(pageId);
      const intro = sourcePageContent.intro as
        | { badges?: string[]; mediaId?: string }
        | undefined;

      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: section.tone as HomeSectionTone | undefined,
        width: (section.width as HomeSectionWidth | undefined) ?? "wide",
        badges: intro?.badges ?? [],
        media: intro?.mediaId ? getMedia(intro.mediaId) : undefined,
        disclosure: intro?.mediaId
          ? buildMediaDisclosure(getMedia(intro.mediaId), "feature")
          : null,
        href: sourcePage.route,
        action: section.primaryActionId
          ? requireValue(
              resolvedActions.get(section.primaryActionId),
              `Missing home action ${section.primaryActionId}.`
            )
          : undefined
      };
    }

    if (section.kind === "feature-split") {
      const actions = (section.actionIds ?? []).map((actionId) =>
        requireValue(resolvedActions.get(actionId), `Missing home action ${actionId}.`)
      );

      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: section.tone as HomeSectionTone | undefined,
        width: (section.width as HomeSectionWidth | undefined) ?? "wide",
        bullets: section.bullets ?? [],
        badges: section.badges ?? [],
        media: getMedia(
          requireValue(section.mediaId, `Missing media for ${section.id}.`)
        ),
        disclosure: buildMediaDisclosure(
          getMedia(requireValue(section.mediaId, `Missing media for ${section.id}.`)),
          "feature"
        ),
        primaryAction:
          actions[0] ??
          (section.primaryActionId
            ? requireValue(
                resolvedActions.get(section.primaryActionId),
                `Missing home action ${section.primaryActionId}.`
              )
            : undefined),
        secondaryAction:
          actions[1] ??
          (section.secondaryActionId
            ? requireValue(
                resolvedActions.get(section.secondaryActionId),
                `Missing home action ${section.secondaryActionId}.`
              )
            : undefined),
        reversed: section.reversed ?? false
      };
    }

    if (section.kind === "updates-surface") {
      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: section.tone as HomeSectionTone | undefined,
        width: (section.width as HomeSectionWidth | undefined) ?? "wide",
        state: updatesState,
        items: updatesItems.slice(0, section.maxItems ?? updatesItems.length),
        primaryAction: section.primaryActionId
          ? requireValue(
              resolvedActions.get(section.primaryActionId),
              `Missing home action ${section.primaryActionId}.`
            )
          : undefined,
        emptyBehavior: section.emptyBehavior,
        emptyState: section.emptyState
      };
    }

    if (section.kind === "faq-cluster") {
      const faqGroup = requireFaqGroup(
        requireValue(section.faqGroupId, `Missing FAQ group for ${section.id}.`)
      );

      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: section.tone as HomeSectionTone | undefined,
        width: section.width as HomeSectionWidth | undefined,
        faqGroupId: faqGroup.id,
        faqs: faqGroup.items,
        primaryAction: section.primaryActionId
          ? requireValue(
              resolvedActions.get(section.primaryActionId),
              `Missing home action ${section.primaryActionId}.`
            )
          : undefined
      };
    }

    if (section.kind === "contact-panel") {
      const supportForm = buildSupportFormModel(
        requireValue(section.formSurfaceId, `Missing form surface for ${section.id}.`)
      );

      return {
        id: section.id,
        kind: section.kind,
        eyebrow: section.eyebrow,
        title: section.title,
        summary: section.summary,
        tone: (section.tone as HomeSectionTone | undefined) ?? "band",
        width: (section.width as HomeSectionWidth | undefined) ?? "wide",
        primaryAction: section.primaryActionId
          ? requireValue(
              resolvedActions.get(section.primaryActionId),
              `Missing home action ${section.primaryActionId}.`
            )
          : undefined,
        secondaryAction: section.secondaryActionId
          ? requireValue(
              resolvedActions.get(section.secondaryActionId),
              `Missing home action ${section.secondaryActionId}.`
            )
          : undefined,
        surfaceId: supportForm.surfaceId,
        formHeading: supportForm.formHeading,
        formIntro: supportForm.formIntro,
        organizationName: supportForm.organizationName,
        privacyNote: supportForm.privacyNote,
        privacyHighlights: supportForm.privacyHighlights,
        privacyNoticeTitle: supportForm.privacyNoticeTitle,
        privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
        messageHelper: supportForm.messageHelper,
        updatesOptInLabel: supportForm.updatesOptInLabel,
        emailFallbackPrefix: supportForm.emailFallbackPrefix,
        noScriptNote: supportForm.noScriptNote,
        invalidStatusMessage: supportForm.invalidStatusMessage,
        submittingStatusMessage: supportForm.submittingStatusMessage,
        email: supportForm.email,
        reasons: supportForm.reasons,
        successMessage: supportForm.successMessage,
        urgentGuidance: contactInfo.urgentGuidance.emergencyText
      };
    }

    throw new Error(`Unhandled home section kind: ${section.kind}`);
  });

  const meta = buildMeta("home", homePage.metaDescription, {
    path: "/",
    title: homePage.metaTitle,
    summary: homePage.routePurpose,
    media: getMedia(homePage.hero.mediaId)
  });

  return {
    meta,
    structuredData: [
      buildSiteOrganizationStructuredData(),
      buildWebsiteStructuredData({
        description: homePage.metaDescription
      })
    ],
    routePurpose: homePage.routePurpose,
    audiencePriority: homePage.audiencePriority,
    conversionStack: {
      primaryAction: requireValue(
        resolvedActions.get(homePage.conversionStack.primaryActionId),
        `Missing home action ${homePage.conversionStack.primaryActionId}.`
      ),
      secondaryAction: requireValue(
        resolvedActions.get(homePage.conversionStack.secondaryActionId),
        `Missing home action ${homePage.conversionStack.secondaryActionId}.`
      ),
      supportingActions: homePage.conversionStack.supportingActionIds.map((actionId) =>
        requireValue(resolvedActions.get(actionId), `Missing home action ${actionId}.`)
      ),
      audienceJourneys: homePage.conversionStack.audienceJourneys.map((journey) => ({
        audience: journey.audience,
        summary: journey.summary,
        primaryAction: requireValue(
          resolvedActions.get(journey.primaryActionId),
          `Missing home action ${journey.primaryActionId}.`
        ),
        secondaryAction: journey.secondaryActionId
          ? requireValue(
              resolvedActions.get(journey.secondaryActionId),
              `Missing home action ${journey.secondaryActionId}.`
            )
          : null,
        supportingActions: journey.supportingActionIds.map((actionId) =>
          requireValue(resolvedActions.get(actionId), `Missing home action ${actionId}.`)
        )
      }))
    },
    hero: {
      eyebrow: homePage.hero.eyebrow,
      headline: homePage.hero.headline,
      summary: homePage.hero.summary,
      badges: homePage.hero.badgeItems,
      primaryAction: requireValue(
        resolvedActions.get(homePage.hero.primaryActionId),
        `Missing home action ${homePage.hero.primaryActionId}.`
      ),
      secondaryAction: requireValue(
        resolvedActions.get(homePage.hero.secondaryActionId),
        `Missing home action ${homePage.hero.secondaryActionId}.`
      ),
      media: getMedia(homePage.hero.mediaId),
      disclosure: buildMediaDisclosure(getMedia(homePage.hero.mediaId), "hero")
    },
    sections,
    sectionOrder: sections.map((section) => section.id),
    stateSurface: {
      liveSessions: {
        state: liveSessionsState,
        itemCount: sessionCards.length,
        sectionId: homePage.stateRules.liveSessions.sectionId,
        supportAction: requireValue(
          resolvedActions.get(homePage.stateRules.liveSessions.supportActionId),
          `Missing home action ${homePage.stateRules.liveSessions.supportActionId}.`
        )
      },
      updates: {
        state: updatesState,
        itemCount: updatesItems.length,
        sectionId: homePage.stateRules.updates.sectionId,
        collectionId: homePage.stateRules.updates.collectionId,
        primaryAction: requireValue(
          resolvedActions.get(homePage.stateRules.updates.primaryActionId),
          `Missing home action ${homePage.stateRules.updates.primaryActionId}.`
        ),
        emptyBehavior: homePage.stateRules.updates.emptyBehavior
      },
      contact: {
        state: contactState,
        sectionId: homePage.stateRules.contact.sectionId,
        confirmedFields: homePage.stateRules.contact.confirmedFields,
        pendingFields: homePage.stateRules.contact.pendingFields
      },
      aiDisclosures: {
        required: requiredDisclosureSectionIds.length > 0,
        requiredSectionIds: requiredDisclosureSectionIds,
        optionalSectionIds: homePage.stateRules.aiDisclosures.optionalSectionIds
      },
      shellNotices: {
        count: shellNotices.length,
        notices: shellNotices
      }
    },
    launchBoundaries: homePage.launchBoundaries
  };
}

export function getAboutPageModel() {
  const page = requirePage("about");
  const pageContent = requireRoutePage("about");
  const intro = requireValue(pageContent.intro, "Missing about intro content.");
  const storySections = requireValue(
    pageContent.storySections,
    "Missing about story sections."
  );
  const purposeSection = requireValue(
    pageContent.purposeSection,
    "Missing about purpose section."
  );
  const valuesSection = requireValue(
    pageContent.valuesSection,
    "Missing about values section."
  );
  const audienceSection = requireValue(
    pageContent.audienceSection,
    "Missing about audience section."
  );
  const trustSection = requireValue(
    pageContent.trustSection,
    "Missing about trust section content."
  );
  const proofBoundary = requireValue(
    pageContent.proofBoundary,
    "Missing about proof boundary."
  );
  const ctaBand = requireValue(pageContent.ctaBand, "Missing about CTA band.");
  const media = getMedia(
    requireValue(intro.mediaId, "Missing about intro media reference.")
  );

  const meta = buildMeta(page.id, pageContent.metaDescription, {
    summary: intro.summary,
    media
  });
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: buildAboutPageStructuredData({
      meta,
      breadcrumbs
    }),
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    media,
    disclosure: buildMediaDisclosure(media, "hero"),
    storySections: storySections.map((section) => {
      const sectionMedia = section.mediaId ? getMedia(section.mediaId) : undefined;
      const summary =
        "summary" in section && typeof section.summary === "string"
          ? section.summary
          : undefined;

      return {
        id: section.id,
        eyebrow: section.eyebrow,
        title: section.title,
        summary,
        paragraphs: section.paragraphs,
        bullets: section.bullets ?? [],
        badges: section.badges ?? [],
        quote: section.quote,
        media: sectionMedia,
        disclosure: buildMediaDisclosure(sectionMedia, "narrative"),
        note: buildActionableNoticeModel(section.note),
        actions: (section.actionReferences ?? []).map(resolveActionReference),
        reversed: Boolean(section.reversed)
      };
    }),
    purposeSection: {
      eyebrow: purposeSection.eyebrow,
      title: purposeSection.title,
      summary: purposeSection.summary,
      missionLabel: purposeSection.missionLabel,
      missionSummary: siteSettings.missionSummary,
      visionLabel: purposeSection.visionLabel,
      visionSummary: siteSettings.visionSummary,
      driveLabel: purposeSection.driveLabel,
      driveSummary: purposeSection.driveSummary,
      driveBullets: purposeSection.driveBullets ?? []
    },
    valuesSection: {
      eyebrow: valuesSection.eyebrow,
      title: valuesSection.title,
      summary: valuesSection.summary,
      items: valuesSection.items.map((item) => ({
        title: item.title,
        summary: item.summary,
        icon: getMedia(item.iconAssetId)
      }))
    },
    audienceSection: {
      eyebrow: audienceSection.eyebrow,
      title: audienceSection.title,
      summary: audienceSection.summary,
      items: audienceSection.items.map((item) => ({
        title: item.title,
        summary: item.summary,
        action: item.action ? resolveActionReference(item.action) : undefined
      }))
    },
    trustSection: {
      eyebrow: trustSection.eyebrow,
      title: trustSection.title,
      summary: trustSection.summary,
      cards: trustSection.trustSignalIds.map((id) => {
        const signal = requireTrustSignal(id);

        return {
          title: signal.label,
          summary: signal.summary,
          icon: getMedia(signal.iconAssetId)
        };
      })
    },
    proofBoundary: buildProofBoundaryModel(
      proofBoundary,
      "Missing about proof boundary."
    ),
    ctaBand: {
      eyebrow: ctaBand.eyebrow,
      title: ctaBand.title,
      summary: ctaBand.summary,
      badges: ctaBand.badges ?? [],
      actions: ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(ctaBand.note)
    }
  };
}

export function getPrivacyPageModel() {
  const page = requirePage("privacy");
  const pageContent = requireRoutePage("privacy");
  const privacyPage = privacyNotice.page;
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);
  const actions = [resolveActionReference(privacyPage.primaryAction)];

  if (privacyPage.secondaryAction) {
    actions.push(resolveActionReference(privacyPage.secondaryAction));
  }

  const systems = privacyPage.systems.map((system) => ({
    label: system.label,
    status: system.status,
    statusLabel:
      system.status === "active"
        ? "Live now"
        : system.status === "manual-review"
          ? "Manual handling"
          : system.status === "not-configured"
            ? "Not connected"
            : "Not running",
    detail: system.detail
  }));

  const meta = buildMeta(page.id, pageContent.metaDescription);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: privacyPage.eyebrow,
    title: privacyPage.title,
    summary: privacyPage.summary,
    actions,
    statusNote: requireValue(
      buildActionableNoticeModel(privacyPage.statusNote),
      "Missing privacy status note."
    ),
    summaryCards: privacyPage.summaryCards,
    contents: privacyPage.contents,
    collectionPointSection: privacyPage.collectionPointSection,
    collectionPoints: privacyPage.collectionPoints.map((point) => ({
      title: point.title,
      routes: point.routeIds.map((routeId) => {
        const routePage = requirePage(routeId);

        return {
          label: routePage.title,
          href: routePage.route
        };
      }),
      dataTypes: point.dataTypes,
      purpose: point.purpose,
      workingBasis: point.workingBasis,
      sharing: point.sharing,
      retention: point.retention,
      note: point.note ?? null
    })),
    sections: privacyPage.sections.map((section) => ({
      id: section.id,
      title: section.title,
      summary: section.summary,
      paragraphs: section.paragraphs ?? [],
      bullets: section.bullets ?? [],
      note: buildActionableNoticeModel(section.note)
    })),
    systemsSection: privacyPage.systemsSection,
    systems,
    rightsSection: privacyPage.rightsSection,
    rightsCards: privacyPage.rightsCards,
    reviewSection: privacyPage.reviewSection,
    reviewTriggers: privacyPage.reviewTriggers,
    complaintUrl: privacyNotice.settings.complaintUrl
  };
}

export function getCookiePageModel() {
  const page = requirePage("cookies");
  const pageContent = requireRoutePage("cookies");
  const cookiePage = storageAccess.page;
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);
  const actions = [resolveActionReference(cookiePage.primaryAction)];

  if (cookiePage.secondaryAction) {
    actions.push(resolveActionReference(cookiePage.secondaryAction));
  }

  const activeEntries = storageAccess.registry.active.map((entry) => ({
    title: entry.label,
    summary: entry.purpose,
    statusLabel:
      entry.category === "communication-delivery"
        ? "Communication delivery"
        : entry.category === "service-essential"
          ? "Service requested"
          : entry.category === "statistical"
            ? "Aggregate statistics"
            : "Appearance helper",
    statusTone:
      entry.category === "appearance-helper"
        ? ("accent" as const)
        : entry.category === "statistical"
          ? ("accent" as const)
          : entry.category === "service-essential"
            ? ("success" as const)
            : ("meta" as const),
    detailRows: [
      {
        label: "Classification",
        value: formatStorageCategoryLabel(entry.category)
      },
      {
        label: "Context",
        value: formatStoragePartyLabel(entry.party)
      },
      {
        label: "When it runs",
        value: formatStorageActivationLabel(entry.activation)
      },
      {
        label: "Persistence",
        value: formatStoragePersistenceLabel(entry.persistence)
      },
      {
        label: "Provider",
        value: entry.provider
      },
      {
        label: "Duration",
        value: entry.duration
      },
      {
        label: "Implementation",
        value: entry.implementation
      }
    ],
    note: entry.userControl ?? ("note" in entry ? entry.note : undefined) ?? null
  }));

  const absentEntries = storageAccess.registry.absent.map((entry) => ({
    title: entry.label,
    summary: entry.detail,
    statusLabel: "Not active at launch",
    statusTone: "meta" as const,
    detailRows: [
      {
        label: "Classification",
        value: formatStorageCategoryLabel(entry.category)
      },
      {
        label: "Context",
        value: formatStoragePartyLabel(entry.party)
      },
      {
        label: "Why it stays off",
        value: entry.reason
      }
    ],
    note: null
  }));

  const meta = buildMeta(page.id, pageContent.metaDescription);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: cookiePage.eyebrow,
    title: cookiePage.title,
    summary: cookiePage.summary,
    actions,
    statusNote: requireValue(
      buildActionableNoticeModel(cookiePage.statusNote),
      "Missing cookie status note."
    ),
    summaryCards: cookiePage.summaryCards.map((card) => ({
      title: card.title,
      body: card.body,
      bullets: "bullets" in card ? card.bullets : undefined
    })),
    contents: cookiePage.contents,
    sections: cookiePage.sections.map((section) => ({
      id: section.id,
      title: section.title,
      summary: "summary" in section ? section.summary : undefined,
      paragraphs: section.paragraphs ?? [],
      bullets: section.bullets ?? [],
      note: buildActionableNoticeModel(section.note)
    })),
    activeSection: cookiePage.activeSection,
    absentSection: cookiePage.absentSection,
    activeEntries,
    absentEntries,
    analyticsControlSection: cookiePage.analyticsControlSection,
    settings: storageAccess.settings,
    changeControlSection: cookiePage.changeControlSection,
    changeTriggers: cookiePage.changeTriggers,
    futureGuardrails: storageAccess.registry.futureGuardrails
  };
}

export function getAccessibilityPageModel() {
  const page = requirePage("accessibility");
  const pageContent = requireRoutePage("accessibility");
  const statementPage = accessibilityStatement.page;
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);
  const actions = [resolveActionReference(statementPage.primaryAction)];
  const feedbackForm = buildSupportFormModel(
    accessibilityStatement.settings.feedbackSurfaceId
  );
  const cookieEntryPoint = getCookieEntryPointNotice();
  const mapLinkBody = getMapLinkNoticeBody();

  if (statementPage.secondaryAction) {
    actions.push(resolveActionReference(statementPage.secondaryAction));
  }

  const meta = buildMeta(page.id, pageContent.metaDescription);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta,
        dateModified: accessibilityStatement.settings.lastReviewed
      }),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: statementPage.eyebrow,
    title: statementPage.title,
    summary: statementPage.summary,
    actions,
    statusNote: requireValue(
      buildActionableNoticeModel(statementPage.statusNote),
      "Missing accessibility statement status note."
    ),
    summaryCards: statementPage.summaryCards,
    contents: statementPage.contents,
    standardTarget: accessibilityStatement.settings.standardTarget,
    assessmentApproach: accessibilityStatement.settings.assessmentApproach,
    formalAuditStatus: accessibilityStatement.settings.formalAuditStatus,
    lastReviewed: accessibilityStatement.settings.lastReviewed,
    responseExpectation: accessibilityStatement.settings.responseExpectation,
    measuresSection: {
      eyebrow: statementPage.measuresSection.eyebrow,
      title: statementPage.measuresSection.title,
      summary: statementPage.measuresSection.summary,
      items: statementPage.measuresSection.items.map((item) => ({
        title: item.title,
        body: item.body,
        tone: (item.tone ?? "soft") as ContactMethodCardModel["tone"],
        icon: item.iconAssetId ? getMedia(item.iconAssetId) : undefined
      }))
    },
    assessmentSection: {
      eyebrow: statementPage.assessmentSection.eyebrow,
      title: statementPage.assessmentSection.title,
      summary: statementPage.assessmentSection.summary,
      items: statementPage.assessmentSection.items.map((item) => ({
        title: item.title,
        body: item.body,
        tone: (item.tone ?? "soft") as ContactMethodCardModel["tone"],
        icon:
          "iconAssetId" in item && item.iconAssetId
            ? getMedia(item.iconAssetId as string)
            : undefined
      }))
    },
    limitationSection: statementPage.limitationSection,
    limitations: statementPage.limitations,
    externalSurfacesSection: {
      eyebrow: statementPage.externalSurfacesSection.eyebrow,
      title: statementPage.externalSurfacesSection.title,
      summary: statementPage.externalSurfacesSection.summary,
      items: [
        ...statementPage.externalSurfacesSection.items,
        ...(mapLinkBody
          ? [
              {
                title: consentAwareMicrocopy.notices.mapExternalLink.title,
                body: mapLinkBody
              }
            ]
          : [])
      ]
    },
    feedbackSection: {
      eyebrow: statementPage.feedbackSection.eyebrow,
      title: statementPage.feedbackSection.title,
      summary: statementPage.feedbackSection.summary,
      bullets: statementPage.feedbackSection.bullets ?? [],
      note: buildActionableNoticeModel(statementPage.feedbackSection.note)
    },
    feedbackIntroNotice: {
      title: consentAwareMicrocopy.notices.accessibilityFeedback.title,
      body: consentAwareMicrocopy.notices.accessibilityFeedback.body,
      tone: "info" as const
    },
    feedbackForm: {
      id: "accessibility-feedback-form",
      surfaceId: feedbackForm.surfaceId,
      defaultReasonId: feedbackForm.defaultReasonId,
      eyebrow: feedbackForm.eyebrow,
      formHeading: feedbackForm.formHeading,
      formIntro: feedbackForm.formIntro,
      organizationName: feedbackForm.organizationName,
      privacyNote: feedbackForm.privacyNote,
      privacyHighlights: feedbackForm.privacyHighlights,
      privacyNoticeTitle: feedbackForm.privacyNoticeTitle,
      privacyNoticeActionLabel: feedbackForm.privacyNoticeActionLabel,
      messageHelper: feedbackForm.messageHelper,
      updatesOptInLabel: feedbackForm.updatesOptInLabel,
      showUpdatesOptIn: feedbackForm.showUpdatesOptIn,
      emailFallbackPrefix: feedbackForm.emailFallbackPrefix,
      noScriptNote: feedbackForm.noScriptNote,
      invalidStatusMessage: feedbackForm.invalidStatusMessage,
      submittingStatusMessage: feedbackForm.submittingStatusMessage,
      reasons: feedbackForm.reasons,
      reasonFieldLabel: feedbackForm.reasonFieldLabel,
      reasonSelectPlaceholder: feedbackForm.reasonSelectPlaceholder,
      reasonFieldMode: feedbackForm.reasonFieldMode,
      email: feedbackForm.email,
      successMessage: feedbackForm.successMessage,
      submitLabel: feedbackForm.submitLabel
    },
    reviewSection: statementPage.reviewSection,
    reviewTriggers: [...statementPage.reviewTriggers, cookieEntryPoint.body],
    cookieEntryPoint
  };
}

export function getSitePolicyPageModel() {
  const page = requirePage("terms");
  const pageContent = requireRoutePage("terms");
  const policyPage = sitePolicy.page;
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);
  const actions = [resolveActionReference(policyPage.primaryAction)];

  if (policyPage.secondaryAction) {
    actions.push(resolveActionReference(policyPage.secondaryAction));
  }

  const meta = buildMeta(page.id, pageContent.metaDescription);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: policyPage.eyebrow,
    title: policyPage.title,
    summary: policyPage.summary,
    actions,
    statusNote: requireValue(
      buildActionableNoticeModel(policyPage.statusNote),
      "Missing site policy status note."
    ),
    summaryCards: policyPage.summaryCards,
    contents: policyPage.contents,
    sections: policyPage.sections.map((section) => ({
      id: section.id,
      title: section.title,
      summary: section.summary,
      paragraphs: section.paragraphs ?? [],
      bullets: section.bullets ?? [],
      cards: (section.cards ?? []).map((card) => ({
        title: card.title,
        body: card.body,
        tone: (card.tone ?? "soft") as ContactMethodCardModel["tone"]
      })),
      note: buildActionableNoticeModel(section.note)
    })),
    policyState: {
      operator: siteSettings.legalName,
      cookieEntryPoint: getCookieEntryPointNotice(),
      calendarDownloadsAvailable: sessions.some(
        (session) => session.calendar?.status === "available"
      ),
      publicDirectionsLink: Boolean(contactInfo.locationGuidance.publicDirectionsUrl)
    }
  };
}

export function getNotFoundModel() {
  const page = requirePage("not-found");
  const pageContent = requireRoutePage("not-found");
  const recovery = buildResiliencePanelModel("route-missing-recovery");

  return {
    meta: buildMeta("not-found", pageContent.metaDescription),
    breadcrumbs: buildBreadcrumbs(page.title, page.route),
    eyebrow: recovery.eyebrow ?? page.title,
    title: recovery.title,
    summary: recovery.summary,
    body: recovery.body,
    bullets: recovery.bullets,
    actions: recovery.actions,
    primaryAction: recovery.actions[0],
    secondaryAction: recovery.actions[1],
    editorialStatus: buildPlaceholderStatus(page),
    notice: buildNoticeModel(pageContent.notice)
  };
}

export function getProgrammesIndexModel() {
  const page = requirePage("programmes");
  const pageContent = requireRoutePage("programmes");
  const intro = requireValue(pageContent.intro, "Missing programmes intro content.");
  const overviewPanels = requireValue(
    pageContent.overviewPanels,
    "Missing programmes overview panels."
  );
  const scheduleSection = requireValue(
    pageContent.scheduleSection,
    "Missing programmes schedule bridge section."
  );
  const audienceSection = requireValue(
    pageContent.audienceSection,
    "Missing programmes audience section."
  );
  const ctaBand = requireValue(pageContent.ctaBand, "Missing programmes CTA band.");
  const items = programmes.map(buildProgrammeOverviewCardModel);

  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: buildCollectionPageStructuredData({
      meta,
      breadcrumbs,
      itemList: items.map((item) => ({
        href: item.href,
        name: item.title
      }))
    }),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    overviewPanels,
    items,
    scheduleSection,
    liveSessions: [...sessions]
      .sort((left, right) =>
        left.schedule.startTime.localeCompare(right.schedule.startTime)
      )
      .map(buildSessionCardModel),
    audienceSection: {
      eyebrow: audienceSection.eyebrow,
      title: audienceSection.title,
      summary: audienceSection.summary,
      items: audienceSection.items.map((item) => ({
        title: item.title,
        summary: item.summary,
        action: item.action ? resolveActionReference(item.action) : undefined
      }))
    },
    ctaBand: {
      eyebrow: ctaBand.eyebrow,
      title: ctaBand.title,
      summary: ctaBand.summary,
      badges: ctaBand.badges ?? [],
      actions: ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(ctaBand.note)
    },
    notice: requireValue(
      buildNoticeModel(pageContent.launchNotice),
      "Missing programmes launch notice."
    )
  };
}

export function getSessionsIndexModel() {
  const page = requirePage("sessions");
  const pageContent = requireRoutePage("sessions");
  const intro = requireValue(pageContent.intro, "Missing sessions intro content.");
  const faqSection = requireValue(
    pageContent.faqSection,
    "Missing sessions FAQ section content."
  );
  const faqGroup = requireFaqGroup(
    requireValue(faqSection.groupId, "Missing sessions FAQ group id.")
  );
  const items = [...sessions]
    .sort((left, right) =>
      left.schedule.startTime.localeCompare(right.schedule.startTime)
    )
    .map(buildSessionHubCardModel);
  const state = buildSessionHubStateModel(items);
  const calendarNotice =
    state.calendarAvailability === "partial"
      ? buildResilienceNoticeModel("sessions-calendar-partial")
      : state.calendarAvailability === "unavailable"
        ? buildResilienceNoticeModel("sessions-calendar-unavailable")
        : null;
  const ctaBand = pageContent.ctaBand;

  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      ...buildCollectionPageStructuredData({
        meta,
        breadcrumbs,
        itemList: items.map((item) => ({
          href: item.detailAction.href,
          name: item.title
        }))
      }),
      buildFaqPageStructuredData(faqGroup.items)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: [
      `${sessions.length} recurring Saturday offers`,
      `Based in ${contactInfo.serviceAreaLabel}`,
      ...(intro.badges ?? [])
    ],
    actions: [
      createAction(
        requireValue(
          pageContent.actions?.primaryLabel,
          "Missing sessions primary action label."
        ),
        getPageRoute("contact"),
        "secondary"
      ),
      ...(pageContent.actions?.secondaryLabel
        ? [
            createAction(
              pageContent.actions.secondaryLabel,
              getPageRoute("programmes"),
              "text"
            )
          ]
        : [])
    ],
    state,
    liveRailItems: items.map((item) => ({
      href: item.detailAction.href,
      icon: item.icon,
      title: item.title,
      programmeTitle: item.programmeTitle,
      timeLabel: item.timeLabel,
      statusLabel: item.nextShortLabel
        ? `Next up ${item.nextShortLabel}`
        : (item.statusLabel ?? "Ask before attending")
    })),
    scheduleSection: requireValue(
      pageContent.scheduleSection,
      "Missing sessions schedule section content."
    ),
    calendarNotice,
    items,
    guidanceSection: pageContent.guidanceSection,
    guidancePanels: pageContent.guidancePanels ?? [],
    faqSection: {
      eyebrow: faqSection.eyebrow,
      title: faqSection.title
    },
    faqGroupId: faqGroup.id,
    faqs: faqGroup.items,
    sidebarNotice: requireValue(
      buildNoticeModel(pageContent.sidebarNotice),
      "Missing sessions sidebar notice."
    ),
    ctaBand: ctaBand
      ? {
          eyebrow: ctaBand.eyebrow,
          title: ctaBand.title,
          summary: ctaBand.summary,
          badges: ctaBand.badges ?? [],
          actions: ctaBand.actions.map(resolveActionReference),
          note: buildActionableNoticeModel(ctaBand.note)
        }
      : null
  };
}

export function getSessionDetailModel(slug: string) {
  const pageId = `session-${slug}`;
  const session = requireSession(slug);
  const pageContent = requireSessionPageContent(pageId);
  const faqGroup = requireFaqGroup(
    requireValue(
      session.faqGroupIds[0],
      `Missing FAQ group reference for session ${slug}.`
    )
  );
  const relatedProgramme = session.programmeIds
    .map((programmeId) => programmeIndex.get(programmeId))
    .find(Boolean);
  const media = getMedia(session.featuredMediaId);
  const temporal = getTemporalState(session);
  const sessionStatusMicrocopy = getSessionStatusMicrocopy();
  const scheduleNotice = temporal.statusMessage
    ? {
        title: sessionStatusMicrocopy.scheduleUpdateTitle,
        body: temporal.statusMessage,
        tone:
          temporal.state === "paused" || temporal.state === "cancelled"
            ? ("important" as const)
            : ("info" as const)
      }
    : temporal.calendar.state === "unavailable"
      ? {
          title: sessionStatusMicrocopy.calendarUnavailableTitle,
          body: getCalendarDownloadNoticeBody("unavailable"),
          tone: "info" as const
        }
      : null;
  const downloadNotice =
    temporal.calendar.state === "available"
      ? {
          title: consentAwareMicrocopy.notices.calendarDownload.title,
          body: getCalendarDownloadNoticeBody("available"),
          tone: "info" as const
        }
      : null;
  const absoluteImageUrl = requireValue(
    getMediaPublicUrl(media, siteSettings.siteUrl),
    `Missing public media URL for session ${slug}.`
  );
  const relatedProgrammeCard = relatedProgramme
    ? buildProgrammeCardModel(
        relatedProgramme,
        pageContent.relatedProgrammeSection?.actionLabel ?? "See wider route"
      )
    : null;
  const fallbackNotice = requireValue(
    buildActionableNoticeModel(pageContent.fallbackNotice),
    `Missing fallback notice for session ${slug}.`
  );

  const meta = buildMeta(pageId, session.seoDescription, {
    path: session.route,
    title: `${session.title} | ${siteSettings.siteName}`,
    summary: session.summary,
    media
  });
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Sessions", href: getPageRoute("sessions") },
    { label: session.title, href: session.route }
  ];

  return {
    meta,
    breadcrumbs,
    eyebrow: pageContent.intro.eyebrow,
    title: pageContent.intro.title,
    summary: session.summary,
    supportingNote: pageContent.intro.supportingNote ?? null,
    badges: [
      temporal.recurrenceLabel,
      temporal.timeRangeLabel,
      temporal.nextDateLabel ?? temporal.statusLabel
    ].filter(Boolean),
    actions: [
      createAction(
        pageContent.actions.joinLabel,
        buildSessionEnquiryHref(session.slug),
        "primary"
      ),
      ...(temporal.calendar.href
        ? [
            createAction(
              pageContent.actions.calendarLabel,
              temporal.calendar.href,
              "surface"
            )
          ]
        : [])
    ],
    media,
    disclosure: buildMediaDisclosure(media, "detail"),
    scheduleNotice,
    downloadNotice,
    atAGlanceSection: {
      eyebrow: pageContent.atAGlanceSection.eyebrow,
      title: pageContent.atAGlanceSection.title,
      summary: pageContent.atAGlanceSection.summary,
      items: [
        {
          title: pageContent.atAGlanceSection.timingLabel,
          body: buildSessionTimingSummary(temporal)
        },
        {
          title: pageContent.atAGlanceSection.locationLabel,
          body: buildSessionLocationNote(session, pageContent.intro)
        },
        {
          title: pageContent.atAGlanceSection.audienceLabel,
          body: pageContent.atAGlanceSection.audienceSummary
        },
        {
          title: pageContent.atAGlanceSection.bringLabel,
          body: pageContent.atAGlanceSection.bringSummary
        }
      ]
    },
    expectationSection: {
      eyebrow: pageContent.expectationSection.eyebrow,
      title: pageContent.expectationSection.title,
      summary: pageContent.expectationSection.summary,
      items: buildIconPanelItems(pageContent.expectationSection.items),
      checklistTitle: pageContent.expectationSection.checklistTitle,
      checklistItems: session.featureBullets
    },
    supportSection: {
      eyebrow: pageContent.supportSection.eyebrow,
      title: pageContent.supportSection.title,
      summary: pageContent.supportSection.summary,
      items: buildIconPanelItems(pageContent.supportSection.items),
      checklistTitle: pageContent.supportSection.checklistTitle,
      checklistItems: session.trustNotes,
      note: buildActionableNoticeModel(pageContent.supportSection.note)
    },
    faqSection: pageContent.faqSection,
    faqGroupId: faqGroup.id,
    faqs: faqGroup.items,
    relatedProgrammeSection: pageContent.relatedProgrammeSection
      ? {
          eyebrow: pageContent.relatedProgrammeSection.eyebrow,
          title: pageContent.relatedProgrammeSection.title,
          summary: pageContent.relatedProgrammeSection.summary
        }
      : null,
    relatedProgramme: relatedProgrammeCard,
    fallbackNotice,
    urgentNotice: {
      title: pageContent.urgentNoticeTitle,
      body: contactInfo.urgentGuidance.emergencyText,
      tone: "important" as const
    },
    ctaBand: {
      eyebrow: pageContent.ctaBand.eyebrow,
      title: pageContent.ctaBand.title,
      summary: pageContent.ctaBand.summary,
      badges: pageContent.ctaBand.badges ?? [],
      actions: pageContent.ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(pageContent.ctaBand.note)
    },
    structuredData: [
      buildEventSchema(session, {
        siteUrl: siteSettings.siteUrl,
        organizationName: siteSettings.legalName,
        imageUrl: absoluteImageUrl
      }),
      buildFaqPageStructuredData(faqGroup.items),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean)
  };
}

export function getSessionDetailStaticPaths() {
  return sessions.map((session) => ({
    params: {
      slug: session.slug
    }
  }));
}

export function getProgrammeDetailModel(slug: string) {
  const pageId = `programme-${slug}`;
  const programme = requireProgramme(slug);
  const pageContent = requireProgrammePageContent(pageId);

  const defaults = getProgrammePageDefaults();
  const state = buildProgrammeStateModel(programme);
  const linkedSessions = getProgrammeLinkedSessions(programme);
  const relatedSessions = linkedSessions.map(buildSessionCardModel);
  const primaryLinkedSession = linkedSessions[0] ?? null;
  const media = getMedia(programme.featuredMediaId);
  const faqGroup = pageContent.faqSection
    ? requireFaqGroup(pageContent.faqSection.groupId)
    : null;
  const heroPrimaryAction = pageContent.hero?.primaryAction
    ? resolveActionReference(pageContent.hero.primaryAction)
    : relatedSessions[0]
      ? createAction(
          defaults.primaryActionLabelWithSession,
          relatedSessions[0].href,
          "primary"
        )
      : createAction(
          defaults.primaryActionLabelWithoutSession,
          getPageRoute("contact"),
          "primary"
        );
  const heroSecondaryAction = pageContent.hero?.secondaryAction
    ? resolveActionReference(pageContent.hero.secondaryAction)
    : createAction(defaults.secondaryActionLabel, getPageRoute("programmes"), "surface");
  const heroBadges = Array.from(
    new Set([...(pageContent.hero?.badges ?? []), state.label])
  );
  const relatedSessionsSectionContent = pageContent.relatedSessionsSection;
  const relatedSessionsStateContent = relatedSessionsSectionContent as
    | {
        activeNotice?: {
          title?: string;
          body: string;
          tone: string;
          action?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
        fallbackNotice?: {
          title?: string;
          body: string;
          tone: string;
          action?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
        overviewNotice?: {
          title?: string;
          body: string;
          tone: string;
          action?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
        enquiryNotice?: {
          title?: string;
          body: string;
          tone: string;
          action?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
        emptyState?: {
          eyebrow: string;
          title: string;
          summary: string;
          primaryAction: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
          secondaryAction?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
      }
    | undefined;
  const relatedSessionsNotice = relatedSessionsSectionContent
    ? buildActionableNoticeModel(
        selectProgrammeLinkedOpportunityNotice({
          stateId: state.id,
          activeNotice: relatedSessionsStateContent?.activeNotice,
          fallbackNotice: relatedSessionsStateContent?.fallbackNotice,
          overviewNotice: relatedSessionsStateContent?.overviewNotice,
          enquiryNotice: relatedSessionsStateContent?.enquiryNotice
        }) ?? undefined
      )
    : null;
  const relatedSessionsEmptyState = relatedSessionsSectionContent
    ? buildInlineEmptyStateModel(relatedSessionsStateContent?.emptyState)
    : null;
  const audienceRoutesSectionContent = pageContent.audienceRoutesSection as
    | {
        eyebrow?: string;
        title: string;
        summary?: string;
        items: Array<{
          title: string;
          summary: string;
          iconAssetId: string;
          action: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
          tone?: string;
        }>;
      }
    | undefined;
  const pageCtaBand = pageContent.ctaBand as
    | {
        eyebrow: string;
        title: string;
        summary?: string;
        badges?: string[];
        actions: Array<{
          label: string;
          variant: string;
          routeId?: string;
          href?: string;
        }>;
        note?: {
          title?: string;
          body: string;
          tone: string;
          action?: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
        };
      }
    | undefined;
  const ctaBandActions = pageCtaBand?.actions?.length
    ? pageCtaBand.actions.map(resolveActionReference)
    : [
        state.linkedSession
          ? createAction(
              defaults.ctaBand.primaryActionLabelWithSession,
              state.linkedSession.href,
              "primary"
            )
          : createAction(
              defaults.ctaBand.primaryActionLabelWithoutSession,
              getPageRoute("contact"),
              "primary"
            ),
        ...(state.linkedSession
          ? [
              createAction(
                defaults.ctaBand.supportActionLabel,
                getPageRoute("contact"),
                "secondary"
              )
            ]
          : [
              createAction(
                defaults.ctaBand.browseSessionsActionLabel,
                getPageRoute("sessions"),
                "surface"
              )
            ]),
        createAction(
          defaults.ctaBand.secondaryActionLabel,
          getPageRoute("programmes"),
          "surface"
        )
      ];
  const absoluteImageUrl = requireValue(
    getMediaPublicUrl(media, siteSettings.siteUrl),
    `Missing public media URL for programme ${slug}.`
  );

  const meta = buildMeta(pageId, programme.seoDescription, {
    path: programme.route,
    title: `${programme.title} | ${siteSettings.siteName}`,
    summary: programme.summary,
    media
  });
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Programmes", href: getPageRoute("programmes") },
    { label: programme.title, href: programme.route }
  ];

  return {
    meta,
    breadcrumbs,
    hero: {
      eyebrow: defaults.heroEyebrow,
      title: pageContent.hero?.title ?? programme.title,
      summary: pageContent.hero?.summary ?? programme.summary,
      bullets: programme.outcomeBullets,
      media,
      disclosure: buildMediaDisclosure(media, "detail"),
      badges: heroBadges,
      supportingNote: pageContent.hero?.supportingNote,
      primaryAction: heroPrimaryAction,
      secondaryAction: heroSecondaryAction
    },
    atAGlanceSection: defaults.atAGlanceSection,
    atAGlance: {
      audienceSummary: programme.audienceSummary,
      audienceHighlights: programme.audienceHighlights,
      state,
      deliverySummary: programme.deliverySummary,
      trustNotes: programme.trustNotes
    },
    experienceSection: pageContent.experienceSection
      ? {
          eyebrow: pageContent.experienceSection.eyebrow,
          title: pageContent.experienceSection.title,
          summary: pageContent.experienceSection.summary,
          items: pageContent.experienceSection.items.map((item) => ({
            title: item.title,
            summary: item.summary,
            icon: getMedia(item.iconAssetId)
          }))
        }
      : null,
    audienceRoutesSection: audienceRoutesSectionContent
      ? {
          eyebrow: audienceRoutesSectionContent.eyebrow,
          title: audienceRoutesSectionContent.title,
          summary: audienceRoutesSectionContent.summary,
          items: audienceRoutesSectionContent.items.map((item) => ({
            title: item.title,
            summary: item.summary,
            icon: getMedia(item.iconAssetId),
            action: resolveActionReference(item.action),
            tone: item.tone as
              | "default"
              | "accent"
              | "soft"
              | "callout"
              | "muted"
              | undefined
          }))
        }
      : null,
    contentSection: defaults.contentSection,
    sections: programme.bodySections,
    relatedSessionsSection: {
      eyebrow:
        relatedSessionsSectionContent?.eyebrow ?? defaults.relatedSessionsSection.eyebrow,
      title:
        relatedSessionsSectionContent?.title ?? defaults.relatedSessionsSection.title,
      summary:
        relatedSessionsSectionContent?.summary ?? defaults.relatedSessionsSection.summary,
      panels: (relatedSessionsSectionContent?.panels ?? []).map((panel) => ({
        title: panel.title,
        summary: panel.body,
        tone: panel.tone as
          | "default"
          | "accent"
          | "soft"
          | "callout"
          | "muted"
          | undefined,
        icon: panel.iconAssetId ? getMedia(panel.iconAssetId) : undefined
      })),
      notice: relatedSessionsNotice,
      emptyState: relatedSessionsEmptyState
    },
    relatedSessions,
    trustSection: {
      eyebrow: defaults.trustSection.eyebrow,
      title: defaults.trustSection.title,
      summary: defaults.trustSection.summary,
      cards: programme.trustSignalIds.map((signalId) => {
        const signal = requireTrustSignal(signalId);

        return {
          title: signal.label,
          summary: signal.summary,
          icon: getMedia(signal.iconAssetId)
        };
      }),
      notes: programme.trustNotes
    },
    faqSection: pageContent.faqSection
      ? {
          eyebrow: pageContent.faqSection.eyebrow,
          title: pageContent.faqSection.title
        }
      : null,
    faqGroupId: faqGroup?.id ?? null,
    faqs: faqGroup?.items ?? [],
    evidenceNotice: buildNoticeModel(pageContent.evidenceNotice),
    ctaBand: {
      eyebrow: pageCtaBand?.eyebrow ?? defaults.ctaBand.eyebrow,
      title: pageCtaBand?.title ?? defaults.ctaBand.title,
      summary: pageCtaBand?.summary ?? defaults.ctaBand.summary,
      badges: pageCtaBand?.badges ?? defaults.ctaBand.badges,
      actions: ctaBandActions,
      note: buildActionableNoticeModel(pageCtaBand?.note)
    },
    structuredData: [
      buildWebPageStructuredData({
        meta,
        name: pageContent.hero?.title ?? programme.title,
        description: programme.seoDescription,
        hasPart: primaryLinkedSession
          ? [
              {
                "@type": "WebPage",
                name: primaryLinkedSession.title,
                url: `${siteSettings.siteUrl}${primaryLinkedSession.route}`
              }
            ]
          : undefined,
        about: buildServiceStructuredData({
          name: programme.title,
          description: programme.summary,
          includeContext: false
        }),
        mainEntity: {
          "@type": "Thing",
          name: programme.title
        },
        relatedLink: primaryLinkedSession
          ? [`${siteSettings.siteUrl}${primaryLinkedSession.route}`]
          : undefined,
        image: absoluteImageUrl
      }),
      buildServiceStructuredData({
        name: programme.title,
        description: programme.summary
      }),
      buildFaqPageStructuredData(faqGroup?.items ?? []),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    notice: requireValue(
      buildNoticeModel(defaults.migrationNotice),
      `Missing migration notice for programme ${slug}.`
    )
  };
}

export function getProgrammeDetailStaticPaths() {
  return programmes.map((programme) => ({
    params: {
      slug: programme.slug
    }
  }));
}

export function getContactPageModel() {
  const page = requirePage("contact");
  const pageContent = requireRoutePage("contact");
  const intro = requireValue(pageContent.intro, "Missing contact intro content.");
  const routesSection = requireValue(
    pageContent.routesSection,
    "Missing contact routes section."
  );
  const contactMethodsSection = requireValue(
    pageContent.contactMethodsSection as
      | {
          eyebrow?: string;
          title: string;
          summary?: string;
          cards: Array<{
            methodId: "email" | "phone" | "instagram" | "safeguarding";
            title: string;
            summary: string;
            bullets?: string[];
            tone?: string;
            actionLabel?: string;
          }>;
        }
      | undefined,
    "Missing contact methods section."
  );
  const locationSection = requireValue(
    pageContent.locationSection as
      | {
          eyebrow?: string;
          title: string;
          summary?: string;
          cards: Array<{
            title: string;
            body: string;
            tone?: string;
            action?: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          }>;
          note?: {
            title?: string;
            body: string;
            tone: string;
            action?: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          };
        }
      | undefined,
    "Missing contact location section."
  );
  const faqSection = requireValue(
    pageContent.faqSection,
    "Missing contact FAQ section content."
  );
  const faqGroup = requireFaqGroup(
    requireValue(faqSection.groupId, "Missing contact FAQ group id.")
  );
  const supportForm = buildSupportFormModel(
    requireValue(pageContent.formSurfaceId, "Missing contact form surface id.")
  );
  const routeCards = (pageContent.routeCards ?? []).map((card) =>
    buildInvolvementPathwayModel(requireInvolvementRoute(card.routeId))
  );
  const contactMethods = contactMethodsSection.cards.map(buildContactMethodCardModel);
  const location = buildContactLocationSectionModel(locationSection);
  const contactLaunchSurfaceId =
    contactRouteState.phone.state === "available" &&
    contactRouteState.location.mapState === "embedded"
      ? "contact-launch-ready"
      : "contact-launch-partial";
  const launchContactNote = buildResilienceNoticeModel(contactLaunchSurfaceId);
  const locationFallbackPanel =
    contactRouteState.location.mapState !== "embedded" ||
    contactRouteState.location.venueState === "shared-on-enquiry"
      ? buildResiliencePanelModel("contact-location-withheld")
      : null;
  const safeguardingRoute = getPageRoute(contactInfo.urgentGuidance.safeguardingRouteId);
  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      ...buildContactPageStructuredData({
        meta,
        breadcrumbs
      }),
      buildFaqPageStructuredData(faqGroup.items)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    routesSection: {
      eyebrow: routesSection.eyebrow,
      title: routesSection.title,
      summary: routesSection.summary
    },
    routeCards,
    contactMethodsSection: {
      eyebrow: contactMethodsSection.eyebrow,
      title: contactMethodsSection.title,
      summary: contactMethodsSection.summary,
      cards: contactMethods
    },
    locationSection: location,
    locationFallbackPanel,
    faqSection: {
      eyebrow: faqSection.eyebrow,
      title: faqSection.title,
      summary: faqSection.summary
    },
    faqGroupId: faqGroup.id,
    faqs: faqGroup.items,
    contactState: {
      email: contactRouteState.email.state,
      phone: contactRouteState.phone.state,
      social: contactRouteState.social.state,
      map: contactRouteState.location.mapState,
      formTransport: "secure" as const
    },
    launchContactSurfaceId: contactLaunchSurfaceId,
    launchContactNote,
    surfaceId: supportForm.surfaceId,
    organizationName: supportForm.organizationName,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    defaultReasonId: supportForm.defaultReasonId,
    reasonFieldLabel: supportForm.reasonFieldLabel,
    reasonSelectPlaceholder: supportForm.reasonSelectPlaceholder,
    submitLabel: supportForm.submitLabel,
    urgentNotice: {
      title: requireValue(
        pageContent.urgentNoticeTitle,
        "Missing contact urgent notice title."
      ),
      body: contactInfo.urgentGuidance.emergencyText,
      tone: "important" as const,
      action: createAction("Read safeguarding", safeguardingRoute, "text")
    }
  };
}

export function getGetInvolvedPageModel() {
  const page = requirePage("get-involved");
  const pageContent = requireRoutePage("get-involved");
  const intro = requireValue(pageContent.intro, "Missing get-involved intro content.");
  const media = getMedia(
    requireValue(intro.mediaId, "Missing get-involved intro media.")
  );
  const faqSection = requireValue(
    pageContent.faqSection,
    "Missing get-involved FAQ section."
  );
  const faqGroup = requireFaqGroup(
    requireValue(faqSection.groupId, "Missing get-involved FAQ group id.")
  );
  const routesSection = requireValue(
    pageContent.routesSection,
    "Missing get-involved routes section."
  );
  const processSection = requireValue(
    pageContent.processSection,
    "Missing get-involved process section."
  );
  const spotlightSection = requireValue(
    pageContent.spotlightSection as
      | {
          eyebrow?: string;
          title: string;
          summary?: string;
          emptyTitle: string;
          emptySummary: string;
          fallbackAction: {
            label: string;
            variant: string;
            routeId?: string;
            href?: string;
          };
          supportPanel: {
            eyebrow?: string;
            title: string;
            body: string;
            bullets?: string[];
            action: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          };
        }
      | undefined,
    "Missing get-involved spotlight section."
  );
  const supportForm = buildSupportFormModel(
    requireValue(pageContent.formSurfaceId, "Missing get-involved form surface id.")
  );
  const sessionItems = [...sessions]
    .sort((left, right) =>
      left.schedule.startTime.localeCompare(right.schedule.startTime)
    )
    .map(buildSessionHubCardModel);
  const sessionState = buildSessionHubStateModel(sessionItems);
  const opportunityItems = editorialFeed.publicItems.filter(
    (item: EditorialFeedItem) => item.updateType === "opportunity"
  );
  const opportunitySpotlight = selectInvolvementOpportunitySpotlight(opportunityItems);
  const pathwayCards = (pageContent.routeCards ?? []).map((card) => {
    const route = requireInvolvementRoute(card.routeId);

    return buildInvolvementPathwayModel(route, {
      sessionAvailability: sessionState.availability as
        | "available"
        | "mixed"
        | "unavailable",
      liveCount: sessionState.liveCount,
      opportunityItem: opportunitySpotlight
    });
  });
  const featuredPathway = requireValue(
    pathwayCards.find((card) => card.id === "join-session"),
    "Missing featured join-session pathway."
  );
  const secondaryPathways = pathwayCards.filter((card) => card.id !== "join-session");
  const ctaBand = requireValue(pageContent.ctaBand, "Missing get-involved CTA band.");
  const normalizedProcessSteps = processSection.steps.map((step) =>
    typeof step === "string" ? { title: step, body: "" } : step
  );

  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      ...buildCollectionPageStructuredData({
        meta,
        breadcrumbs,
        itemList: [featuredPathway, ...secondaryPathways].map((pathway) => ({
          href: pathway.actions[0]?.href ?? page.route,
          name: pathway.title
        }))
      }),
      buildFaqPageStructuredData(faqGroup.items)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    media,
    disclosure: buildMediaDisclosure(media, "hero"),
    routesSection: {
      eyebrow: routesSection.eyebrow,
      title: routesSection.title,
      summary: routesSection.summary
    },
    featuredPathway,
    pathwayCards: secondaryPathways,
    processSection: {
      eyebrow: processSection.eyebrow,
      title: processSection.title,
      summary: processSection.summary,
      steps: normalizedProcessSteps
    },
    launchNotice: buildNoticeModel(pageContent.launchNotice),
    spotlightSection: buildInvolvementOpportunitySpotlightModel(
      spotlightSection,
      opportunitySpotlight
    ),
    faqSection: {
      eyebrow: faqSection.eyebrow,
      title: faqSection.title,
      summary: faqSection.summary
    },
    faqGroupId: faqGroup.id,
    faqs: faqGroup.items,
    surfaceId: supportForm.surfaceId,
    organizationName: supportForm.organizationName,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    ctaBand: {
      eyebrow: ctaBand.eyebrow,
      title: ctaBand.title,
      summary: ctaBand.summary,
      badges: ctaBand.badges ?? [],
      actions: ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(ctaBand.note)
    }
  };
}

function buildSafeguardingFormModel() {
  const surfaceId = requireValue(
    safeguardingRouteState.secureConcernForm.surfaceId,
    "Missing safeguarding concern form surface id."
  );
  const supportForm = buildSupportFormModel(surfaceId);

  return {
    formId: "safeguarding-concern",
    surfaceId: supportForm.surfaceId,
    formEyebrow: supportForm.eyebrow,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    organizationName: supportForm.organizationName,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    showUpdatesOptIn: supportForm.showUpdatesOptIn,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    defaultReasonId: supportForm.defaultReasonId,
    reasonFieldLabel: supportForm.reasonFieldLabel,
    reasonSelectPlaceholder: supportForm.reasonSelectPlaceholder,
    reasonFieldMode: supportForm.reasonFieldMode as "select" | "hidden",
    submitLabel: supportForm.submitLabel
  };
}

function createSafeguardingPanelModel(panel: SafeguardingPanelModel) {
  return panel;
}

function buildSafeguardingSharedPanels() {
  return {
    concern: createSafeguardingPanelModel({
      title: "Public safeguarding contact",
      summary: safeguardingRouteState.publicConcernRoute.summary,
      detail: `${safeguardingRouteState.publicConcernRoute.label}: ${safeguardingRouteState.publicConcernRoute.email}`,
      statusLabel: safeguardingRouteState.publicConcernRoute.statusLabel,
      statusTone:
        safeguardingRouteState.publicConcernRoute.namedLeadState === "published"
          ? "success"
          : "meta",
      bullets: [
        safeguardingRouteState.publicConcernRoute.responseBoundary,
        safeguardingRouteState.publicConcernRoute.handoffNote
      ],
      actions: [
        createAction(
          "Email the safeguarding inbox",
          safeguardingRouteState.publicConcernRoute.mailtoHref,
          "text"
        )
      ]
    }),
    policy: createSafeguardingPanelModel({
      title: safeguardingRouteState.policyDocument.title,
      summary: safeguardingRouteState.policyDocument.summary,
      statusLabel: safeguardingRouteState.policyDocument.statusLabel,
      statusTone:
        safeguardingRouteState.policyDocument.state === "available" ? "success" : "meta",
      bullets: [],
      actions: safeguardingRouteState.policyDocument.href
        ? [
            createAction(
              "Read the safeguarding policy",
              safeguardingRouteState.policyDocument.href,
              "surface"
            )
          ]
        : []
    }),
    training: createSafeguardingPanelModel({
      title: "Training and vetting statement",
      summary: safeguardingRouteState.vettingAndTraining.summary,
      statusLabel: safeguardingRouteState.vettingAndTraining.statusLabel,
      statusTone: "soft",
      bullets: safeguardingRouteState.vettingAndTraining.bullets,
      actions: []
    }),
    preparation: createSafeguardingPanelModel({
      title: "Before you send a concern",
      summary:
        "A short factual message is enough to start the safeguarding route properly.",
      statusLabel: "Send what you know now",
      statusTone: "accent",
      bullets: safeguardingRouteState.preparationChecklist,
      actions: []
    }),
    generalContact: createSafeguardingPanelModel({
      title: safeguardingRouteState.generalContactBoundary.title,
      summary: safeguardingRouteState.generalContactBoundary.body,
      statusLabel: "Ordinary contact kept separate",
      statusTone: "accent",
      bullets: [],
      actions: [createAction("Use general contact", getPageRoute("contact"), "surface")]
    })
  };
}

function buildSafeguardingProofBoundaryModel() {
  return {
    eyebrow: "Trust boundary",
    title: safeguardingRouteState.proofBoundary.title,
    summary: safeguardingRouteState.proofBoundary.summary,
    publishNow: safeguardingRouteState.proofBoundary.publishNow,
    awaitingConfirmation: safeguardingRouteState.proofBoundary.awaitingConfirmation,
    withheldUntilVerified: safeguardingRouteState.proofBoundary.withheldUntilVerified
  };
}

export function getSafeguardingHubPageModel() {
  const page = requirePage("safeguarding");
  const pageContent = requireRoutePage("safeguarding");
  const intro = requireValue(pageContent.intro, "Missing safeguarding intro content.");
  const supportForm = buildSafeguardingFormModel();
  const panels = buildSafeguardingSharedPanels();
  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    emergencyNotice: {
      title: safeguardingRouteState.immediateDanger.title,
      body: `${safeguardingRouteState.immediateDanger.message} ${safeguardingRouteState.immediateDanger.summary}`,
      tone: "important" as const
    },
    routeCards: (safeguardingRouteState.routes as SafeguardingRouteCardSource[]).map(
      (route) => ({
        title: route.title,
        summary: route.summary,
        audienceLabel: route.audienceLabel,
        appliesTo: route.appliesTo,
        signals: route.signals,
        actions: [
          createAction(
            `Read ${route.title.toLowerCase()}`,
            getPageRoute(route.pageId),
            "primary"
          )
        ]
      })
    ),
    formNotice: {
      title: safeguardingRouteState.secureConcernForm.statusLabel,
      body: `${safeguardingRouteState.secureConcernForm.summary} ${safeguardingRouteState.secureConcernForm.boundaryNote}`,
      tone: "info" as const
    },
    publicConcernPanel: panels.concern,
    statePanels: [
      panels.preparation,
      panels.policy,
      panels.training,
      panels.generalContact
    ],
    proofBoundary: buildSafeguardingProofBoundaryModel(),
    formId: supportForm.formId,
    surfaceId: supportForm.surfaceId,
    formEyebrow: supportForm.formEyebrow,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    organizationName: supportForm.organizationName,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    showUpdatesOptIn: supportForm.showUpdatesOptIn,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    defaultReasonId: supportForm.defaultReasonId,
    reasonFieldLabel: supportForm.reasonFieldLabel,
    reasonSelectPlaceholder: supportForm.reasonSelectPlaceholder,
    reasonFieldMode: supportForm.reasonFieldMode,
    submitLabel: supportForm.submitLabel
  };
}

export function getSafeguardingDetailPageModel(branchId: "child" | "adult") {
  const branchState = getSafeguardingBranchState(safeguardingInfo, branchId);
  const page = requirePage(branchState.pageId);
  const pageContent = requireRoutePage(page.id);
  const intro = requireValue(
    pageContent.intro,
    `Missing safeguarding intro for ${page.id}.`
  );
  const supportForm = buildSafeguardingFormModel();
  const panels = buildSafeguardingSharedPanels();
  const alternatePage = requirePage(branchState.alternatePageId);
  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    emergencyNotice: {
      title: safeguardingRouteState.immediateDanger.title,
      body: `${safeguardingRouteState.immediateDanger.message} ${safeguardingRouteState.immediateDanger.summary}`,
      tone: "important" as const
    },
    branchPanel: {
      title: branchState.title,
      summary: branchState.branch.summary,
      detail: branchState.summary,
      statusLabel: branchState.audienceLabel,
      statusTone: "accent" as const,
      bullets: branchState.branch.appliesTo,
      actions: []
    },
    guide: {
      title: branchState.branch.escalationTitle,
      summary: branchState.branch.escalationSummary,
      steps: branchState.branch.steps,
      preparationTitle: branchState.branch.preparationTitle,
      preparationItems: branchState.branch.preparationItems,
      limitationsTitle: branchState.branch.limitationsTitle,
      limitations: branchState.branch.limitations,
      noteTitle: branchState.branch.concernNoteTitle,
      noteBody: branchState.branch.concernNoteBody,
      noteAction: {
        label: `Read ${alternatePage.title.toLowerCase()}`,
        href: getPageRoute(alternatePage.id),
        variant: "text" as const
      }
    },
    sidebarPanels: [panels.concern, panels.policy, panels.generalContact],
    footerPanels: [panels.training],
    proofBoundary: buildSafeguardingProofBoundaryModel(),
    formId: supportForm.formId,
    surfaceId: supportForm.surfaceId,
    formEyebrow: supportForm.formEyebrow,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    organizationName: supportForm.organizationName,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    showUpdatesOptIn: supportForm.showUpdatesOptIn,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    defaultReasonId: supportForm.defaultReasonId,
    reasonFieldLabel: supportForm.reasonFieldLabel,
    reasonSelectPlaceholder: supportForm.reasonSelectPlaceholder,
    reasonFieldMode: supportForm.reasonFieldMode,
    submitLabel: supportForm.submitLabel
  };
}

export function getSafeguardingPageModel() {
  return getSafeguardingHubPageModel();
}

export function getEditorialDetailModel(slug: string) {
  const item = requireEditorialItem(slug);
  const media = item.mediaId ? getMedia(item.mediaId) : undefined;
  const detailHref = buildEditorialDetailHref(item);
  const detailSections = buildEditorialNarrativeSections(item);
  const relatedItems = buildEditorialRelatedItems(item);
  const factItems = buildEditorialFactItems(item);
  const lifecycleNotice = buildEditorialLifecycleNotice(item);
  const proofNotice = buildActionableNoticeModel(item.detail.proofNotice);
  const relatedSection =
    item.detail.relatedSection && relatedItems.length > 0
      ? {
          eyebrow: item.detail.relatedSection.eyebrow,
          title: item.detail.relatedSection.title,
          summary: item.detail.relatedSection.summary
        }
      : null;
  const meta = buildMeta("events-updates", item.detail.intro.summary ?? item.summary, {
    path: detailHref,
    title: `${item.detail.intro.title} | ${siteSettings.siteName}`,
    summary: item.detail.supportingText ?? item.summary,
    media,
    ogType: "article",
    indexable: item.indexVisible
  });
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Events & Updates", href: getPageRoute("events-updates") },
    { label: item.detail.intro.title, href: detailHref }
  ];
  const imageUrl = media ? getMediaPublicUrl(media, siteSettings.siteUrl) : null;
  const editorialStructuredData =
    item.updateType === "event" && item.eventDate
      ? buildEditorialEventStructuredData({
          meta,
          name: item.detail.intro.title,
          description: item.detail.intro.summary ?? item.summary,
          startDate: item.eventDate,
          endDate: item.endDate,
          eventStatus:
            item.temporalState === "cancelled"
              ? "https://schema.org/EventCancelled"
              : item.temporalState === "postponed"
                ? "https://schema.org/EventPostponed"
                : "https://schema.org/EventScheduled",
          locationLabel: item.locationLabel,
          image: imageUrl ?? undefined
        })
      : item.updateType === "event"
        ? buildWebPageStructuredData({
            meta
          })
        : buildArticleStructuredData({
            meta,
            headline: item.detail.intro.title,
            description: item.detail.intro.summary ?? item.summary,
            datePublished: item.publishDate,
            expires: item.endDate,
            articleSection: item.typeLabel,
            image: imageUrl ?? undefined
          });

  return {
    template: item.detailTemplate,
    meta,
    breadcrumbs,
    eyebrow: item.detail.intro.eyebrow,
    title: item.detail.intro.title,
    summary: item.detail.intro.summary ?? item.summary,
    supportingText: item.detail.intro.supportingText ?? null,
    badges: [...new Set([...(item.detail.intro.badges ?? []), item.typeLabel])],
    actions: [
      createAction(
        item.actionLabel ?? "Use the related route",
        buildEditorialHandoffHref(item),
        "primary"
      ),
      ...(item.detail.secondaryAction
        ? [resolveActionReference(item.detail.secondaryAction)]
        : [])
    ],
    media,
    disclosure: buildMediaDisclosure(media, "detail"),
    metaLabel: item.metaLabel,
    metaRows: item.metaRows,
    lifecycleLabel: item.lifecycleLabel,
    lifecycleNotice,
    proofNotice,
    factSection: {
      eyebrow: item.updateType === "event" ? "Current public details" : item.typeLabel,
      title:
        item.updateType === "event"
          ? "Keep the practical detail limited to what is confirmed."
          : "Keep the update useful without turning it into a generic article.",
      summary:
        item.updateType === "event"
          ? "Event pages should show date, time, location, and status only when they are ready to share."
          : "Update and opportunity pages should stay readable, time-aware, and tied to the next practical route."
    },
    factItems,
    sections: detailSections,
    relatedSection,
    relatedItems,
    ctaBand: {
      eyebrow: item.detail.ctaBand.eyebrow,
      title: item.detail.ctaBand.title,
      summary: item.detail.ctaBand.summary,
      badges: item.detail.ctaBand.badges ?? [],
      actions: item.detail.ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(item.detail.ctaBand.note)
    },
    structuredData: [
      editorialStructuredData,
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean)
  };
}

export function getEditorialDetailStaticPaths() {
  return editorialFeed.detailItems.map((item: EditorialFeedItem) => ({
    params: {
      slug: item.slug
    }
  }));
}

export function getEventsUpdatesIndexModel() {
  const page = requirePage("events-updates");
  const pageContent = requireRoutePage("events-updates");
  const intro = requireValue(pageContent.intro, "Missing events updates intro content.");
  const overviewPanels = requireValue(
    pageContent.overviewPanels,
    "Missing events updates overview panels."
  );
  const ctaBand = requireValue(pageContent.ctaBand, "Missing events updates CTA band.");
  const allItemsCount = editorialFeed.publicItems.length;
  const featuredItem = editorialFeed.featuredItem
    ? buildEditorialItemModel(editorialFeed.featuredItem)
    : null;
  const feedItems = (
    featuredItem ? editorialFeed.feedItems : editorialFeed.publicItems
  ).map(buildEditorialItemModel);

  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: buildCollectionPageStructuredData({
      meta,
      breadcrumbs,
      itemList: editorialFeed.publicItems.map((item: EditorialFeedItem) => ({
        href: buildEditorialDetailHref(item),
        name: item.title
      }))
    }),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    overviewPanels,
    notice: requireValue(
      buildNoticeModel(pageContent.notice),
      "Missing events updates notice."
    ),
    hasPublicItems: allItemsCount > 0,
    featuredSection: updatesFeedContent.index.featuredSection,
    featuredItem,
    feedSection: updatesFeedContent.index.feedSection,
    filterLabel: updatesFeedContent.index.filterLabel,
    filterEmptyState: buildResiliencePanelModel("events-filter-empty"),
    categories: [
      {
        id: "all",
        label: updatesFeedContent.index.allLabel,
        count: allItemsCount,
        hasItems: allItemsCount > 0
      },
      ...editorialFeed.categories
    ],
    items: feedItems,
    emptyState: buildResiliencePanelModel("events-feed-empty"),
    archiveNotice: buildNoticeModel(updatesFeedContent.index.archiveNotice),
    ctaBand: {
      eyebrow: ctaBand.eyebrow,
      title: ctaBand.title,
      summary: ctaBand.summary,
      badges: ctaBand.badges ?? [],
      actions: ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(ctaBand.note)
    }
  };
}

export function getVolunteerPageModel() {
  const page = requirePage("volunteer");
  const pageContent = requireRoutePage("volunteer");
  const intro = requireValue(pageContent.intro, "Missing volunteer intro content.");
  const media = getMedia(requireValue(intro.mediaId, "Missing volunteer intro media."));
  const pathwaysSection = requireValue(
    pageContent.pathwaysSection as
      | {
          eyebrow?: string;
          title: string;
          summary?: string;
          items: Array<{
            eyebrow?: string;
            title: string;
            summary: string;
            bullets?: string[];
            note?: string;
            iconAssetId: string;
            action?: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          }>;
          note?: {
            title?: string;
            body: string;
            tone: string;
            action?: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          };
        }
      | undefined,
    "Missing volunteer pathways section."
  );
  const processSection = requireValue(
    pageContent.processSection,
    "Missing volunteer process section."
  );
  const faqSection = requireValue(
    pageContent.faqSection,
    "Missing volunteer FAQ section."
  );
  const faqGroup = requireFaqGroup(
    requireValue(faqSection.groupId, "Missing volunteer FAQ group id.")
  );
  const supportForm = buildSupportFormModel(
    requireValue(pageContent.formSurfaceId, "Missing volunteer form surface id.")
  );
  const ctaBand = requireValue(pageContent.ctaBand, "Missing volunteer CTA band.");
  const normalizedProcessSteps = processSection.steps.map((step) =>
    typeof step === "string" ? { title: step, body: "" } : step
  );

  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildFaqPageStructuredData(faqGroup.items),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    media,
    disclosure: buildMediaDisclosure(media, "hero"),
    notice: requireValue(
      buildNoticeModel(pageContent.notice),
      "Missing volunteer route notice."
    ),
    pathwaysSection: {
      eyebrow: pathwaysSection.eyebrow,
      title: pathwaysSection.title,
      summary: pathwaysSection.summary,
      items: buildInvolvementRoleItems(pathwaysSection.items),
      note: buildActionableNoticeModel(pathwaysSection.note)
    },
    supportSection: buildInvolvementInfoSectionModel(
      pageContent.supportSection as
        | {
            eyebrow?: string;
            title: string;
            summary?: string;
            items: Array<{
              title: string;
              body: string;
              tone?: string;
              iconAssetId?: string;
            }>;
            note?: {
              title?: string;
              body: string;
              tone: string;
              action?: {
                label: string;
                variant: string;
                routeId?: string;
                href?: string;
              };
            };
          }
        | undefined,
      "Missing volunteer support section."
    ),
    processSection: {
      eyebrow: processSection.eyebrow ?? "",
      title: processSection.title,
      summary: processSection.summary,
      steps: normalizedProcessSteps
    },
    screeningSection: buildInvolvementInfoSectionModel(
      pageContent.screeningSection as
        | {
            eyebrow?: string;
            title: string;
            summary?: string;
            items: Array<{
              title: string;
              body: string;
              tone?: string;
              iconAssetId?: string;
            }>;
            note?: {
              title?: string;
              body: string;
              tone: string;
              action?: {
                label: string;
                variant: string;
                routeId?: string;
                href?: string;
              };
            };
          }
        | undefined,
      "Missing volunteer screening section."
    ),
    timeCommitmentSection: buildInvolvementInfoSectionModel(
      pageContent.timeCommitmentSection as
        | {
            eyebrow?: string;
            title: string;
            summary?: string;
            items: Array<{
              title: string;
              body: string;
              tone?: string;
              iconAssetId?: string;
            }>;
            note?: {
              title?: string;
              body: string;
              tone: string;
              action?: {
                label: string;
                variant: string;
                routeId?: string;
                href?: string;
              };
            };
          }
        | undefined,
      "Missing volunteer time-commitment section."
    ),
    faqSection: {
      eyebrow: faqSection.eyebrow,
      title: faqSection.title,
      summary: faqSection.summary
    },
    faqGroupId: faqGroup.id,
    faqs: faqGroup.items,
    sidebarNotice: requireValue(
      buildNoticeModel(pageContent.sidebarNotice),
      "Missing volunteer sidebar notice."
    ),
    volunteerFormId: "volunteer-enquiry",
    surfaceId: supportForm.surfaceId,
    formEyebrow: supportForm.eyebrow,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    organizationName: supportForm.organizationName,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    defaultReasonId: supportForm.defaultReasonId,
    reasonFieldLabel: supportForm.reasonFieldLabel,
    reasonSelectPlaceholder: supportForm.reasonSelectPlaceholder,
    submitLabel: supportForm.submitLabel,
    ctaBand: {
      eyebrow: ctaBand.eyebrow,
      title: ctaBand.title,
      summary: ctaBand.summary,
      badges: ctaBand.badges ?? [],
      actions: ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(ctaBand.note)
    }
  };
}

export function getPartnerPageModel() {
  const page = requirePage("partner");
  const pageContent = requireRoutePage("partner");
  const intro = requireValue(pageContent.intro, "Missing partner intro.");
  const audienceSection = requireValue(
    pageContent.audienceSection,
    "Missing partner audience section."
  );
  const pathwaysSection = requireValue(
    pageContent.pathwaysSection as
      | {
          eyebrow?: string;
          title: string;
          summary?: string;
          items: Array<{
            eyebrow?: string;
            title: string;
            summary: string;
            bullets?: string[];
            note?: string;
            iconAssetId: string;
            action?: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          }>;
          note?: {
            title?: string;
            body: string;
            tone: string;
            action?: {
              label: string;
              variant: string;
              routeId?: string;
              href?: string;
            };
          };
        }
      | undefined,
    "Missing partner collaboration section."
  );
  const processSection = requireValue(
    pageContent.processSection,
    "Missing partner process section."
  );
  const faqSection = requireValue(pageContent.faqSection, "Missing partner FAQ section.");
  const faqGroup = requireFaqGroup(
    requireValue(faqSection.groupId, "Missing partner FAQ group id.")
  );
  const supportForm = buildSupportFormModel(
    requireValue(pageContent.formSurfaceId, "Missing partner form surface id.")
  );
  const ctaBand = requireValue(pageContent.ctaBand, "Missing partner CTA band.");
  const media = getMedia(
    requireValue(intro.mediaId, "Missing partner intro media reference.")
  );

  const meta = buildMeta(page.id, pageContent.metaDescription);
  const breadcrumbs = buildBreadcrumbs(page.title, page.route);

  return {
    meta,
    structuredData: [
      buildWebPageStructuredData({
        meta
      }),
      buildFaqPageStructuredData(faqGroup.items),
      buildBreadcrumbStructuredData(breadcrumbs)
    ].filter(Boolean),
    breadcrumbs,
    eyebrow: intro.eyebrow,
    title: intro.title,
    summary: intro.summary,
    supportingText: intro.supportingText,
    badges: intro.badges ?? [],
    actions: (intro.actionReferences ?? []).map(resolveActionReference),
    media,
    disclosure: buildMediaDisclosure(media, "hero"),
    notice: requireValue(
      buildNoticeModel(pageContent.notice),
      "Missing partner route notice."
    ),
    audienceSection: {
      eyebrow: audienceSection.eyebrow,
      title: audienceSection.title,
      summary: audienceSection.summary,
      items: audienceSection.items.map((item) => ({
        title: item.title,
        summary: item.summary,
        action: item.action ? resolveActionReference(item.action) : undefined
      }))
    },
    pathwaysSection: {
      eyebrow: pathwaysSection.eyebrow,
      title: pathwaysSection.title,
      summary: pathwaysSection.summary,
      items: buildInvolvementRoleItems(pathwaysSection.items),
      note: buildActionableNoticeModel(pathwaysSection.note)
    },
    supportSection: buildInvolvementInfoSectionModel(
      pageContent.supportSection as
        | {
            eyebrow?: string;
            title: string;
            summary?: string;
            items: Array<{
              title: string;
              body: string;
              tone?: string;
              iconAssetId?: string;
            }>;
            note?: {
              title?: string;
              body: string;
              tone: string;
              action?: {
                label: string;
                variant: string;
                routeId?: string;
                href?: string;
              };
            };
          }
        | undefined,
      "Missing partner support section."
    ),
    processSection: {
      eyebrow: processSection.eyebrow ?? "",
      title: processSection.title,
      summary: processSection.summary,
      steps: processSection.steps
    },
    proofBoundary: buildProofBoundaryModel(
      pageContent.proofBoundary as
        | {
            eyebrow?: string;
            title: string;
            summary?: string;
            publishNow: string[];
            awaitingConfirmation: string[];
            withheldUntilVerified: string[];
          }
        | undefined,
      "Missing partner proof boundary."
    ),
    faqSection: {
      eyebrow: faqSection.eyebrow,
      title: faqSection.title,
      summary: faqSection.summary
    },
    faqGroupId: faqGroup.id,
    faqs: faqGroup.items,
    sidebarNotice: requireValue(
      buildNoticeModel(pageContent.sidebarNotice),
      "Missing partner sidebar notice."
    ),
    partnerFormId: "partner-enquiry",
    surfaceId: supportForm.surfaceId,
    formEyebrow: supportForm.eyebrow,
    formHeading: supportForm.formHeading,
    formIntro: supportForm.formIntro,
    organizationName: supportForm.organizationName,
    privacyNote: supportForm.privacyNote,
    privacyHighlights: supportForm.privacyHighlights,
    privacyNoticeTitle: supportForm.privacyNoticeTitle,
    privacyNoticeActionLabel: supportForm.privacyNoticeActionLabel,
    messageHelper: supportForm.messageHelper,
    updatesOptInLabel: supportForm.updatesOptInLabel,
    emailFallbackPrefix: supportForm.emailFallbackPrefix,
    noScriptNote: supportForm.noScriptNote,
    invalidStatusMessage: supportForm.invalidStatusMessage,
    submittingStatusMessage: supportForm.submittingStatusMessage,
    email: supportForm.email,
    reasons: supportForm.reasons,
    successMessage: supportForm.successMessage,
    defaultReasonId: supportForm.defaultReasonId,
    reasonFieldLabel: supportForm.reasonFieldLabel,
    reasonSelectPlaceholder: supportForm.reasonSelectPlaceholder,
    submitLabel: supportForm.submitLabel,
    ctaBand: {
      eyebrow: ctaBand.eyebrow,
      title: ctaBand.title,
      summary: ctaBand.summary,
      badges: ctaBand.badges ?? [],
      actions: ctaBand.actions.map(resolveActionReference),
      note: buildActionableNoticeModel(ctaBand.note)
    }
  };
}

export function getLegalPlaceholderModel(pageId: string) {
  const routePage = requireRoutePage(pageId);
  const legalPage = requireValue(
    getLegalPageById(pageId),
    `Missing legal page record for ${pageId}.`
  );
  const model = buildEmptyStateModel(pageId);

  return {
    ...model,
    meta: buildMeta(pageId, routePage.metaDescription || legalPage.summary)
  };
}

export function getPageById(pageId: string) {
  return loadPageById(pageId);
}

export function getSessionBySlug(slug: string) {
  return loadSessionBySlug(slug);
}
