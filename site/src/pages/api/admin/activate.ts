import type { APIRoute } from "astro";

import {
  activateAdminInvitation,
  isTrustedAdminOriginRequest,
  setAdminSessionCookies
} from "../../../lib/cms/admin-auth.js";
import { buildAdminNoStoreResponse } from "../../../lib/cms/admin-http.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  requestBodyLimits
} from "../../../lib/security/request-guards.js";

export const prerender = false;

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
  const invitationToken = `${formData.get("invitationToken") ?? ""}`.trim();

  if (
    `${formData.get("password") ?? ""}` !== `${formData.get("passwordConfirm") ?? ""}`
  ) {
    return Response.json(
      {
        ok: false,
        state: "password-mismatch"
      },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const result = await activateAdminInvitation(
    {
      invitationToken,
      displayName: formData.get("displayName"),
      password: formData.get("password"),
      totpSecret: formData.get("totpSecret"),
      totpCode: formData.get("totpCode"),
      headers: request.headers
    },
    {
      env: globalThis.process?.env
    }
  );

  if (!result.ok || !result.sessionToken) {
    return Response.json(result, {
      status: 400,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  setAdminSessionCookies({
    cookies,
    requestUrl: request.url,
    headers: request.headers,
    sessionToken: result.sessionToken,
    env: globalThis.process?.env
  });

  return Response.json(
    {
      ok: true,
      state: result.state,
      recoveryCodes: result.recoveryCodes,
      redirectTo: "/admin/"
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
};

export const GET: APIRoute = async () =>
  buildAdminNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });
