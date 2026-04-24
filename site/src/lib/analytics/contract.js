import formSurfaces from "../../content/formSurfaces/default.json" with { type: "json" };
import pageDefinitions from "../../content/pageDefinitions/launch.json" with { type: "json" };
import cvSupport from "../../content/sessions/cv-support.json" with { type: "json" };
import youthClub from "../../content/sessions/youth-club.json" with { type: "json" };
import { resolveDeploymentChannel } from "../deployment/context.js";

export const ANALYTICS_EVENT_ENDPOINT_PATH = "/api/analytics/";
export const ANALYTICS_PREFERENCE_ENDPOINT_PATH = "/api/analytics-preference/";
export const ANALYTICS_PREFERENCE_COOKIE = "ey_analytics_pref";
export const ANALYTICS_RUNTIME_VERSION = "2026-04-24";
export const ANALYTICS_STORAGE_VERSION = "2026-04-24";
export const ANALYTICS_PREFERENCE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

const pageRecords = [
  ...pageDefinitions.launchPages,
  ...pageDefinitions.placeholderPages,
  ...pageDefinitions.phaseTwoPages
];

const knownPageIds = new Set(pageRecords.map((page) => page.id));
const knownPageRoutes = new Map(
  pageRecords.map((page) => [normalizeAnalyticsPath(page.route), page.id])
);

const knownFormSurfaceIds = new Set(formSurfaces.surfaces.map((surface) => surface.id));
const knownCalendarIds = new Set([cvSupport.slug, youthClub.slug]);

export const analyticsModes = ["off", "statistical", "consent"];
export const analyticsRouteFamilies = [
  "home",
  "about",
  "programmes",
  "sessions",
  "get-involved",
  "contact",
  "updates",
  "trust",
  "safeguarding",
  "not-found",
  "unknown"
];
export const analyticsEntryTypes = ["direct", "internal", "external", "unknown"];
export const analyticsSurfaceIds = [
  "header",
  "footer",
  "hero",
  "page-intro",
  "support-panel",
  "card",
  "notice",
  "content",
  "navigation",
  "legal-control",
  "unknown"
];
export const analyticsDestinationTypes = [
  "internal-route",
  "mailto",
  "tel",
  "external-url"
];
export const analyticsButtonVariants = ["primary", "secondary", "surface", "text"];
export const analyticsContactMethods = ["email", "phone", "instagram", "external"];
export const analyticsValidationCategories = [
  "name",
  "email",
  "reason",
  "message",
  "multi-field",
  "unknown"
];
export const analyticsPreferenceStates = [
  "active",
  "objected",
  "accepted",
  "rejected",
  "withdrawn"
];
export const analyticsBlockedPageIds = new Set([
  "safeguarding",
  "safeguarding-child",
  "safeguarding-adult",
  "not-found",
  "component-preview"
]);

const analyticsEventSpecs = {
  page_view: {
    required: ["pageId", "routeFamily", "entryType"],
    optional: ["sourceFamily"]
  },
  cta_click: {
    required: [
      "pageId",
      "routeFamily",
      "surface",
      "destinationFamily",
      "destinationType",
      "variant"
    ],
    optional: []
  },
  external_contact_intent: {
    required: ["pageId", "routeFamily", "surface", "method"],
    optional: []
  },
  form_start: {
    required: ["pageId", "routeFamily", "surfaceId"],
    optional: []
  },
  form_validation_failed: {
    required: ["pageId", "routeFamily", "surfaceId", "errorCategory"],
    optional: []
  },
  form_submitted: {
    required: ["pageId", "routeFamily", "surfaceId"],
    optional: []
  },
  calendar_download_requested: {
    required: ["pageId", "routeFamily", "calendarId"],
    optional: ["sourceFamily"]
  },
  analytics_preference_changed: {
    required: ["pageId", "routeFamily", "preferenceState", "surface"],
    optional: ["mode"]
  }
};

function normalizeValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isAllowedString(value, allowlist, { permitUnknown = false } = {}) {
  if (!value) {
    return false;
  }

  if (allowlist.includes(value)) {
    return true;
  }

  return permitUnknown && value === "unknown";
}

function isKnownPageId(value) {
  return knownPageIds.has(value) || value === "unknown";
}

function isKnownFormSurfaceId(value) {
  return knownFormSurfaceIds.has(value);
}

function isKnownCalendarId(value) {
  return knownCalendarIds.has(value) || value === "unknown";
}

function isSafeEventProperty(key, value) {
  switch (key) {
    case "pageId":
      return isKnownPageId(value);
    case "routeFamily":
    case "sourceFamily":
    case "destinationFamily":
      return isAllowedString(value, analyticsRouteFamilies, { permitUnknown: true });
    case "entryType":
      return isAllowedString(value, analyticsEntryTypes);
    case "surface":
      return isAllowedString(value, analyticsSurfaceIds, { permitUnknown: true });
    case "destinationType":
      return isAllowedString(value, analyticsDestinationTypes);
    case "variant":
      return isAllowedString(value, analyticsButtonVariants);
    case "method":
      return isAllowedString(value, analyticsContactMethods);
    case "surfaceId":
      return isKnownFormSurfaceId(value);
    case "errorCategory":
      return isAllowedString(value, analyticsValidationCategories);
    case "calendarId":
      return isKnownCalendarId(value);
    case "preferenceState":
      return isAllowedString(value, analyticsPreferenceStates);
    case "mode":
      return isAllowedString(value, analyticsModes);
    default:
      return false;
  }
}

export function normalizeAnalyticsPath(pathname = "/") {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

/**
 * @param {string | undefined} [value]
 * @param {{ deploymentChannel?: "local" | "ci" | "preview" | "production" }} [options]
 * @returns {"off" | "statistical" | "consent"}
 */
export function resolveAnalyticsMode(
  value = globalThis.process?.env?.ANALYTICS_MODE,
  options = {}
) {
  const deploymentChannel = resolveDeploymentChannel(options);

  if (deploymentChannel === "preview" || deploymentChannel === "ci") {
    return "off";
  }

  return analyticsModes.includes(value) ? value : "statistical";
}

export function resolveAnalyticsPageId(pathname = "/") {
  return knownPageRoutes.get(normalizeAnalyticsPath(pathname)) ?? "unknown";
}

export function resolveAnalyticsRouteFamily(pageId = "unknown", pathname = "/") {
  const resolvedPageId = pageId === "unknown" ? resolveAnalyticsPageId(pathname) : pageId;

  if (resolvedPageId === "home") {
    return "home";
  }

  if (resolvedPageId === "about") {
    return "about";
  }

  if (resolvedPageId === "programmes" || resolvedPageId.startsWith("programme-")) {
    return "programmes";
  }

  if (resolvedPageId === "sessions" || resolvedPageId.startsWith("session-")) {
    return "sessions";
  }

  if (["get-involved", "volunteer", "partner"].includes(resolvedPageId)) {
    return "get-involved";
  }

  if (resolvedPageId === "contact") {
    return "contact";
  }

  if (
    resolvedPageId === "events-updates" ||
    normalizeAnalyticsPath(pathname).startsWith("/events-updates/")
  ) {
    return "updates";
  }

  if (["privacy", "cookies", "accessibility", "terms"].includes(resolvedPageId)) {
    return "trust";
  }

  if (resolvedPageId.startsWith("safeguarding")) {
    return "safeguarding";
  }

  if (resolvedPageId === "not-found") {
    return "not-found";
  }

  return "unknown";
}

export function shouldTrackAnalyticsPage(pageId = "unknown") {
  return !analyticsBlockedPageIds.has(pageId);
}

export function deriveAnalyticsDestinationType(href = "", requestOrigin = "") {
  if (!href) {
    return null;
  }

  if (href.startsWith("mailto:")) {
    return "mailto";
  }

  if (href.startsWith("tel:")) {
    return "tel";
  }

  try {
    const resolvedUrl = new URL(
      href,
      requestOrigin || "https://www.encouragingyou.co.uk"
    );

    if (requestOrigin && resolvedUrl.origin === requestOrigin) {
      return "internal-route";
    }

    return "external-url";
  } catch {
    return null;
  }
}

export function deriveAnalyticsDestinationFamily(href = "", requestOrigin = "") {
  const destinationType = deriveAnalyticsDestinationType(href, requestOrigin);

  if (!destinationType) {
    return "unknown";
  }

  if (destinationType === "mailto" || destinationType === "tel") {
    return "contact";
  }

  if (destinationType === "external-url") {
    return "unknown";
  }

  try {
    const resolvedUrl = new URL(
      href,
      requestOrigin || "https://www.encouragingyou.co.uk"
    );

    return resolveAnalyticsRouteFamily("unknown", resolvedUrl.pathname);
  } catch {
    return "unknown";
  }
}

export function deriveAnalyticsContactMethod(href = "") {
  if (href.startsWith("mailto:")) {
    return "email";
  }

  if (href.startsWith("tel:")) {
    return "phone";
  }

  if (/instagram\.com/iu.test(href)) {
    return "instagram";
  }

  return "external";
}

export function sanitizeAnalyticsEvent(payload) {
  const eventName = normalizeValue(payload?.eventName);
  const spec = analyticsEventSpecs[eventName];

  if (!spec) {
    return null;
  }

  const allowedKeys = new Set(["eventName", ...spec.required, ...spec.optional]);
  const dimensions = {};

  for (const key of Object.keys(payload ?? {})) {
    if (!allowedKeys.has(key)) {
      return null;
    }
  }

  for (const key of [...spec.required, ...spec.optional]) {
    const value = normalizeValue(payload?.[key]);

    if (!value) {
      continue;
    }

    if (!isSafeEventProperty(key, value)) {
      return null;
    }

    dimensions[key] = value;
  }

  for (const key of spec.required) {
    if (!dimensions[key]) {
      return null;
    }
  }

  return {
    eventName,
    dimensions
  };
}

export function getAnalyticsEventCatalog() {
  return analyticsEventSpecs;
}
