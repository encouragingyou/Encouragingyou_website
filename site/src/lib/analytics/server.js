import {
  resolveAnalyticsMode,
  resolveAnalyticsPageId,
  resolveAnalyticsRouteFamily,
  sanitizeAnalyticsEvent,
  normalizeAnalyticsPath
} from "./contract.js";
import { resolveAnalyticsPreferenceState } from "./preferences.js";
import { safeRecordAnalyticsEvent } from "./store.js";

function resolveRequestOrigin(requestUrl, headers) {
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host");

  if (host) {
    const protocol = (
      headers.get("x-forwarded-proto") ?? new URL(requestUrl).protocol
    ).replace(/:$/u, "");

    return `${protocol}://${host}`;
  }

  return new URL(requestUrl).origin;
}

function parseReferrer(requestUrl, headers) {
  const referrer = headers.get("referer");

  if (!referrer) {
    return {
      entryType: "direct",
      sourceFamily: undefined,
      referrerPath: null
    };
  }

  try {
    const referrerUrl = new URL(referrer);

    if (referrerUrl.origin !== resolveRequestOrigin(requestUrl, headers)) {
      return {
        entryType: "external",
        sourceFamily: undefined,
        referrerPath: null
      };
    }

    const referrerPath = normalizeAnalyticsPath(referrerUrl.pathname);
    const sourcePageId = resolveAnalyticsPageId(referrerPath);

    return {
      entryType: "internal",
      sourceFamily: resolveAnalyticsRouteFamily(sourcePageId, referrerPath),
      referrerPath
    };
  } catch {
    return {
      entryType: "unknown",
      sourceFamily: undefined,
      referrerPath: null
    };
  }
}

function shouldCollectForRequest({ cookies, headers, pageId, pathname }) {
  return resolveAnalyticsPreferenceState({
    cookies,
    headers,
    pageId,
    pathname
  }).collectionAllowed;
}

export function buildPageViewEvent({ pathname, requestUrl, headers }) {
  const pageId = resolveAnalyticsPageId(pathname);
  const routeFamily = resolveAnalyticsRouteFamily(pageId, pathname);
  const referrerState = parseReferrer(requestUrl, headers);

  return sanitizeAnalyticsEvent({
    eventName: "page_view",
    pageId,
    routeFamily,
    entryType: referrerState.entryType,
    sourceFamily: referrerState.sourceFamily
  });
}

export function buildCalendarDownloadEvent({ pathname, requestUrl, headers }) {
  const referrerState = parseReferrer(requestUrl, headers);
  const sourcePageId = referrerState.referrerPath
    ? resolveAnalyticsPageId(referrerState.referrerPath)
    : "unknown";
  const calendarId =
    pathname
      .split("/")
      .pop()
      ?.replace(/\.ics$/u, "") ?? "unknown";
  const routeFamily =
    sourcePageId !== "unknown"
      ? resolveAnalyticsRouteFamily(sourcePageId, referrerState.referrerPath ?? "/")
      : "unknown";

  return sanitizeAnalyticsEvent({
    eventName: "calendar_download_requested",
    pageId: sourcePageId,
    routeFamily,
    calendarId,
    sourceFamily: referrerState.sourceFamily
  });
}

export function buildFormSubmittedEvent({ originPath, surfaceId }) {
  const pageId = resolveAnalyticsPageId(originPath);
  const routeFamily = resolveAnalyticsRouteFamily(pageId, originPath);

  if (routeFamily === "safeguarding") {
    return null;
  }

  return sanitizeAnalyticsEvent({
    eventName: "form_submitted",
    pageId,
    routeFamily,
    surfaceId
  });
}

export function buildAnalyticsPreferenceChangedEvent({
  preferenceState,
  pathname = "/cookies/"
}) {
  const pageId = resolveAnalyticsPageId(pathname);

  return sanitizeAnalyticsEvent({
    eventName: "analytics_preference_changed",
    pageId,
    routeFamily: resolveAnalyticsRouteFamily(pageId, pathname),
    preferenceState,
    surface: "legal-control",
    mode: resolveAnalyticsMode()
  });
}

export async function recordServerAnalyticsEvent(event, options) {
  if (!event) {
    return false;
  }

  return safeRecordAnalyticsEvent(
    {
      eventName: event.eventName,
      ...event.dimensions
    },
    options
  );
}

export function schedulePageAnalytics({
  pathname,
  requestUrl,
  headers,
  cookies,
  response
}) {
  const contentType = response.headers.get("content-type") ?? "";
  const pageId = resolveAnalyticsPageId(pathname);

  if (
    response.status >= 400 ||
    !contentType.includes("text/html") ||
    !shouldCollectForRequest({ cookies, headers, pageId, pathname })
  ) {
    return;
  }

  void recordServerAnalyticsEvent(
    buildPageViewEvent({
      pathname,
      requestUrl,
      headers
    })
  );
}

export function scheduleCalendarDownloadAnalytics({
  pathname,
  requestUrl,
  headers,
  cookies,
  response
}) {
  if (
    response.status >= 400 ||
    !pathname.startsWith("/calendar/") ||
    !shouldCollectForRequest({ cookies, headers, pathname })
  ) {
    return;
  }

  void recordServerAnalyticsEvent(
    buildCalendarDownloadEvent({
      pathname,
      requestUrl,
      headers
    })
  );
}
