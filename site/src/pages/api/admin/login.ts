import type { APIRoute } from "astro";

import {
  authenticateAdminPassword,
  isTrustedAdminOriginRequest,
  setAdminSessionCookies
} from "../../../lib/cms/admin-auth.js";
import {
  buildAdminRedirectResponse,
  buildAdminNoStoreResponse
} from "../../../lib/cms/admin-http.js";
import { resolveSafeAdminReturnTo } from "../../../lib/cms/admin-session.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  requestBodyLimits
} from "../../../lib/security/request-guards.js";

export const prerender = false;

function buildLoginRedirect(returnTo: string, state: string) {
  const href = new URL("/admin/login/", "https://www.encouragingyou.co.uk");

  href.searchParams.set("returnTo", returnTo);
  href.searchParams.set("state", state);

  return `${href.pathname}${href.search}`;
}

function buildMfaRedirect(returnTo: string) {
  const href = new URL("/admin/login/mfa/", "https://www.encouragingyou.co.uk");

  href.searchParams.set("returnTo", returnTo);

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

  const formData = await request.formData();
  const returnTo = resolveSafeAdminReturnTo(formData.get("returnTo"));
  const result = await authenticateAdminPassword(
    {
      email: formData.get("email"),
      password: formData.get("password"),
      headers: request.headers
    },
    {
      env: globalThis.process?.env
    }
  );

  if (!result.ok || !result.pendingToken) {
    return buildAdminRedirectResponse(buildLoginRedirect(returnTo, result.state));
  }

  setAdminSessionCookies({
    cookies,
    requestUrl: request.url,
    headers: request.headers,
    pendingToken: result.pendingToken,
    env: globalThis.process?.env
  });

  return buildAdminRedirectResponse(buildMfaRedirect(returnTo));
};

export const GET: APIRoute = async () =>
  buildAdminNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });
