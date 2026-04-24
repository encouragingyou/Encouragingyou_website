import {
  ANALYTICS_PREFERENCE_COOKIE,
  resolveAnalyticsMode,
  resolveAnalyticsPageId,
  resolveAnalyticsRouteFamily,
  shouldTrackAnalyticsPage
} from "./contract.js";

/**
 * @typedef {{ get(name: string): { value?: string } | undefined }} CookieReader
 */

function getCookieValue(cookieStore, cookieName) {
  if (!cookieStore) {
    return null;
  }

  if (typeof cookieStore.get === "function") {
    return cookieStore.get(cookieName)?.value ?? null;
  }

  const cookieHeader =
    typeof cookieStore === "string"
      ? cookieStore
      : (cookieStore.get?.("cookie") ?? cookieStore.cookie ?? "");

  for (const entry of cookieHeader.split(";")) {
    const [name, ...rest] = entry.trim().split("=");

    if (name === cookieName) {
      return decodeURIComponent(rest.join("=") || "");
    }
  }

  return null;
}

function hasBrowserPrivacySignal(headers) {
  if (!headers) {
    return false;
  }

  return headers.get("sec-gpc") === "1" || headers.get("dnt") === "1";
}

/**
 * @param {{
 *   cookies?: CookieReader | Headers | string | null;
 *   headers?: Headers | null;
 *   pageId?: string;
 *   pathname?: string;
 * }} [options]
 * @returns {{
 *   mode: "off" | "statistical" | "consent";
 *   pageId: string;
 *   routeFamily: string;
 *   state: string;
 *   source: string;
 *   collectionAllowed: boolean;
 *   routeAllowed: boolean;
 * }}
 */
export function resolveAnalyticsPreferenceState({
  cookies = null,
  headers = null,
  pageId = "unknown",
  pathname = "/"
} = {}) {
  const mode = resolveAnalyticsMode();
  const resolvedPageId = pageId === "unknown" ? resolveAnalyticsPageId(pathname) : pageId;
  const routeFamily = resolveAnalyticsRouteFamily(resolvedPageId, pathname);
  const routeAllowed = shouldTrackAnalyticsPage(resolvedPageId);
  const cookieValue = getCookieValue(cookies, ANALYTICS_PREFERENCE_COOKIE);
  const browserSignal = hasBrowserPrivacySignal(headers);

  if (mode === "off") {
    return {
      mode,
      pageId: resolvedPageId,
      routeFamily,
      state: "disabled",
      source: "runtime",
      collectionAllowed: false,
      routeAllowed
    };
  }

  if (!routeAllowed) {
    return {
      mode,
      pageId: resolvedPageId,
      routeFamily,
      state: "route-excluded",
      source: "route",
      collectionAllowed: false,
      routeAllowed
    };
  }

  if (browserSignal) {
    return {
      mode,
      pageId: resolvedPageId,
      routeFamily,
      state: "browser-privacy-signal",
      source: "browser",
      collectionAllowed: false,
      routeAllowed
    };
  }

  if (mode === "statistical") {
    return {
      mode,
      pageId: resolvedPageId,
      routeFamily,
      state: cookieValue === "objected" ? "objected" : "active",
      source: cookieValue === "objected" ? "cookie" : "default",
      collectionAllowed: cookieValue !== "objected",
      routeAllowed
    };
  }

  if (cookieValue === "accepted") {
    return {
      mode,
      pageId: resolvedPageId,
      routeFamily,
      state: "accepted",
      source: "cookie",
      collectionAllowed: true,
      routeAllowed
    };
  }

  if (cookieValue === "rejected") {
    return {
      mode,
      pageId: resolvedPageId,
      routeFamily,
      state: "rejected",
      source: "cookie",
      collectionAllowed: false,
      routeAllowed
    };
  }

  return {
    mode,
    pageId: resolvedPageId,
    routeFamily,
    state: "pending",
    source: "default",
    collectionAllowed: false,
    routeAllowed
  };
}

/**
 * @param {{ mode: "off" | "statistical" | "consent"; action: string; currentState: string }} options
 */
export function buildAnalyticsPreferenceCookieValue({ mode, action, currentState }) {
  if (mode === "statistical") {
    if (action === "object") {
      return "objected";
    }

    if (action === "resume") {
      return null;
    }

    return currentState === "objected" ? "objected" : null;
  }

  if (mode === "consent") {
    if (action === "accept") {
      return "accepted";
    }

    if (action === "reject") {
      return "rejected";
    }

    if (action === "withdraw") {
      return null;
    }
  }

  return null;
}

/**
 * @param {"off" | "statistical" | "consent"} mode
 * @param {string} action
 */
export function isValidAnalyticsPreferenceAction(mode, action) {
  if (mode === "statistical") {
    return ["object", "resume"].includes(action);
  }

  if (mode === "consent") {
    return ["accept", "reject", "withdraw"].includes(action);
  }

  return false;
}
