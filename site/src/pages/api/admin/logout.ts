import type { APIRoute } from "astro";

import { logoutAdminSession, verifyAdminCsrf } from "../../../lib/cms/admin-auth.js";
import {
  buildAdminNoStoreResponse,
  buildAdminRedirectResponse
} from "../../../lib/cms/admin-http.js";
import { buildAdminLoginHref } from "../../../lib/cms/admin-session.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  requestBodyLimits
} from "../../../lib/security/request-guards.js";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  if (!hasAllowedContentType(request.headers, allowedRequestContentTypes.adminForm)) {
    return buildAdminNoStoreResponse(415);
  }

  if (!isBodySizeWithinLimit(request.headers, requestBodyLimits.adminForm)) {
    return buildAdminNoStoreResponse(413);
  }

  const formData = await request.formData();

  if (!verifyAdminCsrf(locals.admin, formData.get("_csrf"))) {
    return buildAdminNoStoreResponse(403);
  }

  await logoutAdminSession(
    {
      requestUrl: request.url,
      headers: request.headers,
      cookies,
      adminSession: locals.admin
    },
    {
      env: globalThis.process?.env
    }
  );

  return buildAdminRedirectResponse(
    buildAdminLoginHref("/admin/") + "&state=logged-out",
    {
      "Clear-Site-Data": '"cache"'
    }
  );
};

export const GET: APIRoute = async () =>
  buildAdminNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });
