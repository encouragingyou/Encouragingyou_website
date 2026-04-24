import type { APIRoute } from "astro";

import {
  ANALYTICS_PREFERENCE_COOKIE,
  ANALYTICS_PREFERENCE_COOKIE_MAX_AGE,
  ANALYTICS_PREFERENCE_ENDPOINT_PATH,
  resolveAnalyticsMode
} from "../../lib/analytics/contract.js";
import {
  buildAnalyticsPreferenceCookieValue,
  isValidAnalyticsPreferenceAction,
  resolveAnalyticsPreferenceState
} from "../../lib/analytics/preferences.js";
import {
  buildAnalyticsPreferenceChangedEvent,
  recordServerAnalyticsEvent
} from "../../lib/analytics/server.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  isTrustedSameOriginRequest,
  requestBodyLimits
} from "../../lib/security/request-guards.js";

export const prerender = false;

const DEFAULT_RETURN_PATH = "/cookies/#analytics-preferences";

function buildRedirectResponse(location: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store"
    }
  });
}

function buildNoStoreResponse(
  status: number,
  body: BodyInit | null = null,
  extraHeaders: HeadersInit = {}
) {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

function resolveReturnPath(formData: FormData) {
  const requestedPath = `${formData.get("returnTo") ?? ""}`.trim();

  if (!requestedPath.startsWith("/")) {
    return DEFAULT_RETURN_PATH;
  }

  return requestedPath;
}

function appendStatus(returnPath: string, state: string) {
  const href = new URL(returnPath, "https://www.encouragingyou.co.uk");

  href.searchParams.set("analyticsPreference", state);

  if (!href.hash) {
    href.hash = "analytics-preferences";
  }

  return `${href.pathname}${href.search}${href.hash}`;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (
    !isTrustedSameOriginRequest({ requestUrl: request.url, headers: request.headers })
  ) {
    return buildNoStoreResponse(403);
  }

  if (
    !hasAllowedContentType(
      request.headers,
      allowedRequestContentTypes.analyticsPreference
    )
  ) {
    return buildNoStoreResponse(415);
  }

  if (!isBodySizeWithinLimit(request.headers, requestBodyLimits.analyticsPreference)) {
    return buildNoStoreResponse(413);
  }

  const formData = await request.formData();
  const returnPath = resolveReturnPath(formData);
  const mode = resolveAnalyticsMode();
  const action = `${formData.get("action") ?? ""}`.trim();
  const preferenceState = resolveAnalyticsPreferenceState({
    cookies,
    headers: request.headers,
    pathname: "/cookies/"
  });

  if (!isValidAnalyticsPreferenceAction(mode, action)) {
    return buildRedirectResponse(appendStatus(returnPath, "invalid"));
  }

  const cookieValue = buildAnalyticsPreferenceCookieValue({
    mode,
    action,
    currentState: preferenceState.state
  });
  const nextState =
    mode === "statistical"
      ? action === "object"
        ? "objected"
        : "active"
      : action === "accept"
        ? "accepted"
        : action === "reject"
          ? "rejected"
          : "withdrawn";

  if (cookieValue) {
    cookies.set(ANALYTICS_PREFERENCE_COOKIE, cookieValue, {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: new URL(request.url).protocol === "https:",
      maxAge: ANALYTICS_PREFERENCE_COOKIE_MAX_AGE
    });
  } else {
    cookies.delete(ANALYTICS_PREFERENCE_COOKIE, {
      path: "/"
    });
  }

  void recordServerAnalyticsEvent(
    buildAnalyticsPreferenceChangedEvent({
      preferenceState: nextState
    })
  );

  return buildRedirectResponse(appendStatus(returnPath, nextState));
};

export const GET: APIRoute = async () =>
  buildNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });

export { ANALYTICS_PREFERENCE_ENDPOINT_PATH };
