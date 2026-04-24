import type { APIRoute } from "astro";

import {
  completeAdminMfaChallenge,
  getAdminPendingMfaChallenge,
  isTrustedAdminOriginRequest,
  setAdminSessionCookies
} from "../../../lib/cms/admin-auth.js";
import {
  buildAdminNoStoreResponse,
  buildAdminRedirectResponse
} from "../../../lib/cms/admin-http.js";
import {
  buildAdminLoginHref,
  resolveSafeAdminReturnTo
} from "../../../lib/cms/admin-session.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  requestBodyLimits
} from "../../../lib/security/request-guards.js";

export const prerender = false;

function buildMfaRedirect(returnTo: string, state: string) {
  const href = new URL("/admin/login/mfa/", "https://www.encouragingyou.co.uk");

  href.searchParams.set("returnTo", returnTo);
  href.searchParams.set("state", state);

  return `${href.pathname}${href.search}`;
}

export const POST: APIRoute = async ({ request, cookies }) => {
  if (
    !isTrustedAdminOriginRequest({
      requestUrl: request.url,
      headers: request.headers
    })
  ) {
    return buildAdminNoStoreResponse(403);
  }

  if (!hasAllowedContentType(request.headers, allowedRequestContentTypes.adminForm)) {
    return buildAdminNoStoreResponse(415);
  }

  if (!isBodySizeWithinLimit(request.headers, requestBodyLimits.adminForm)) {
    return buildAdminNoStoreResponse(413);
  }

  const challenge = await getAdminPendingMfaChallenge({
    requestUrl: request.url,
    headers: request.headers,
    cookies
  });
  const formData = await request.formData();
  const returnTo = resolveSafeAdminReturnTo(formData.get("returnTo"));

  if (!challenge) {
    return buildAdminRedirectResponse(buildAdminLoginHref(returnTo));
  }

  const result = await completeAdminMfaChallenge(
    {
      pendingToken: challenge.token,
      code: formData.get("code"),
      headers: request.headers
    },
    {
      env: globalThis.process?.env
    }
  );

  if (!result.ok || !result.sessionToken) {
    return buildAdminRedirectResponse(buildMfaRedirect(returnTo, result.state));
  }

  setAdminSessionCookies({
    cookies,
    requestUrl: request.url,
    headers: request.headers,
    sessionToken: result.sessionToken,
    env: globalThis.process?.env
  });

  return buildAdminRedirectResponse(returnTo);
};

export const GET: APIRoute = async () =>
  buildAdminNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });
