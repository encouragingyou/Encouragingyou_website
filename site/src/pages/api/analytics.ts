import type { APIRoute } from "astro";

import { resolveAnalyticsPreferenceState } from "../../lib/analytics/preferences.js";
import { safeRecordAnalyticsEvent } from "../../lib/analytics/store.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  isTrustedSameOriginRequest,
  parseJsonRequestWithinLimit,
  requestBodyLimits
} from "../../lib/security/request-guards.js";

export const prerender = false;

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

export const POST: APIRoute = async ({ request, cookies }) => {
  if (
    !isTrustedSameOriginRequest({ requestUrl: request.url, headers: request.headers })
  ) {
    return buildNoStoreResponse(403);
  }

  if (
    !hasAllowedContentType(request.headers, allowedRequestContentTypes.analyticsEvent)
  ) {
    return buildNoStoreResponse(415);
  }

  if (!isBodySizeWithinLimit(request.headers, requestBodyLimits.analyticsEvent)) {
    return buildNoStoreResponse(413);
  }

  const analyticsState = resolveAnalyticsPreferenceState({
    cookies,
    headers: request.headers
  });

  if (!analyticsState.collectionAllowed) {
    return buildNoStoreResponse(204);
  }

  const parsedBody = await parseJsonRequestWithinLimit(
    request,
    requestBodyLimits.analyticsEvent
  );

  if (!parsedBody.ok) {
    return buildNoStoreResponse(parsedBody.error === "request-too-large" ? 413 : 400);
  }

  void safeRecordAnalyticsEvent(parsedBody.payload);

  return buildNoStoreResponse(202);
};

export const GET: APIRoute = async () =>
  buildNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });
