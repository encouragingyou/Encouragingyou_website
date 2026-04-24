import {
  ANALYTICS_EVENT_ENDPOINT_PATH,
  deriveAnalyticsContactMethod,
  deriveAnalyticsDestinationFamily,
  deriveAnalyticsDestinationType,
  sanitizeAnalyticsEvent
} from "./contract.js";

const CLICK_DEDUPE_WINDOW_MS = 900;
const FORM_EVENT_DEDUPE_WINDOW_MS = 1_200;

function readRuntimeState(documentRef) {
  const root = documentRef.documentElement;

  return {
    mode: root.dataset.analyticsMode ?? "off",
    pageId: root.dataset.analyticsPageId ?? "unknown",
    routeFamily: root.dataset.analyticsRouteFamily ?? "unknown",
    collectionAllowed: root.dataset.analyticsCollection === "true",
    origin: documentRef.defaultView?.location?.origin ?? ""
  };
}

function buildTracker() {
  return {
    lastSentAt: new Map(),
    formStarted: new Set()
  };
}

function shouldSkipDuplicate(state, key, windowMs) {
  const now = Date.now();
  const previous = state.lastSentAt.get(key) ?? 0;

  if (now - previous < windowMs) {
    return true;
  }

  state.lastSentAt.set(key, now);
  return false;
}

function deliver(payload) {
  const sanitized = sanitizeAnalyticsEvent(payload);

  if (!sanitized) {
    return;
  }

  const body = JSON.stringify({
    eventName: sanitized.eventName,
    ...sanitized.dimensions
  });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });

      navigator.sendBeacon(ANALYTICS_EVENT_ENDPOINT_PATH, blob);
      return;
    }
  } catch {
    // Fall through to fetch.
  }

  fetch(ANALYTICS_EVENT_ENDPOINT_PATH, {
    method: "POST",
    mode: "same-origin",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body,
    keepalive: true
  }).catch(() => {});
}

function resolveClickSurface(element) {
  if (element.closest("[data-analytics-surface]")) {
    return element
      .closest("[data-analytics-surface]")
      ?.getAttribute("data-analytics-surface");
  }

  if (element.closest(".site-header")) {
    return "header";
  }

  if (element.closest(".site-footer")) {
    return "footer";
  }

  if (element.closest(".home-hero")) {
    return "hero";
  }

  if (element.closest(".page-intro")) {
    return "page-intro";
  }

  if (element.closest(".support-panel")) {
    return "support-panel";
  }

  if (element.closest(".card-panel")) {
    return "card";
  }

  if (element.closest(".notice-block, .privacy-notice-callout")) {
    return "notice";
  }

  if (element.closest("nav")) {
    return "navigation";
  }

  return "content";
}

function resolveButtonVariant(element) {
  if (element.classList.contains("button--secondary")) {
    return "secondary";
  }

  if (element.classList.contains("button--surface")) {
    return "surface";
  }

  if (element.classList.contains("button--text")) {
    return "text";
  }

  return "primary";
}

function isTrackedCtaLink(anchor) {
  return (
    anchor.classList.contains("button") && !anchor.hasAttribute("data-analytics-ignore")
  );
}

function isExternalContactLink(anchor, origin) {
  const href = anchor.getAttribute("href") ?? "";
  const destinationType = deriveAnalyticsDestinationType(href, origin);

  return (
    destinationType === "mailto" ||
    destinationType === "tel" ||
    /instagram\.com/iu.test(href)
  );
}

function attachClickTracking(documentRef, runtime, tracker) {
  documentRef.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const anchor = event.target.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      const href = anchor.getAttribute("href") ?? "";
      const surface = resolveClickSurface(anchor) ?? "unknown";

      if (isExternalContactLink(anchor, runtime.origin)) {
        const method = deriveAnalyticsContactMethod(href);
        const dedupeKey = [
          "external_contact_intent",
          runtime.pageId,
          surface,
          method
        ].join(":");

        if (shouldSkipDuplicate(tracker, dedupeKey, CLICK_DEDUPE_WINDOW_MS)) {
          return;
        }

        deliver({
          eventName: "external_contact_intent",
          pageId: runtime.pageId,
          routeFamily: runtime.routeFamily,
          surface,
          method
        });
        return;
      }

      if (!isTrackedCtaLink(anchor)) {
        return;
      }

      const destinationType = deriveAnalyticsDestinationType(href, runtime.origin);
      const destinationFamily = deriveAnalyticsDestinationFamily(href, runtime.origin);

      if (
        !destinationType ||
        (destinationFamily === "unknown" && destinationType !== "external-url")
      ) {
        return;
      }

      const dedupeKey = [
        "cta_click",
        runtime.pageId,
        surface,
        destinationFamily,
        destinationType
      ].join(":");

      if (shouldSkipDuplicate(tracker, dedupeKey, CLICK_DEDUPE_WINDOW_MS)) {
        return;
      }

      deliver({
        eventName: "cta_click",
        pageId: runtime.pageId,
        routeFamily: runtime.routeFamily,
        surface,
        destinationFamily,
        destinationType,
        variant: resolveButtonVariant(anchor)
      });
    },
    { capture: true }
  );
}

export function createAnalyticsClient(documentRef = document) {
  const runtime = readRuntimeState(documentRef);
  const tracker = buildTracker();

  if (!runtime.collectionAllowed) {
    return {
      enabled: false,
      trackFormStart() {},
      trackFormValidationFailure() {}
    };
  }

  attachClickTracking(documentRef, runtime, tracker);

  return {
    enabled: true,
    trackFormStart(surfaceId) {
      const dedupeKey = `${runtime.pageId}:${surfaceId}`;

      if (tracker.formStarted.has(dedupeKey)) {
        return;
      }

      tracker.formStarted.add(dedupeKey);

      deliver({
        eventName: "form_start",
        pageId: runtime.pageId,
        routeFamily: runtime.routeFamily,
        surfaceId
      });
    },
    trackFormValidationFailure(surfaceId, errorCategory) {
      const dedupeKey = [
        "form_validation_failed",
        runtime.pageId,
        surfaceId,
        errorCategory
      ].join(":");

      if (shouldSkipDuplicate(tracker, dedupeKey, FORM_EVENT_DEDUPE_WINDOW_MS)) {
        return;
      }

      deliver({
        eventName: "form_validation_failed",
        pageId: runtime.pageId,
        routeFamily: runtime.routeFamily,
        surfaceId,
        errorCategory
      });
    }
  };
}
