import type { APIRoute } from "astro";

import {
  isTrustedAdminOriginRequest,
  performAdminWorkflowAction,
  verifyAdminCsrf
} from "../../../lib/cms/admin-auth.js";
import { buildAdminNoStoreResponse } from "../../../lib/cms/admin-http.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  parseJsonRequestWithinLimit,
  requestBodyLimits
} from "../../../lib/security/request-guards.js";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  if (
    !isTrustedAdminOriginRequest({
      requestUrl: request.url,
      headers: request.headers
    })
  ) {
    return buildAdminNoStoreResponse(403);
  }

  if (!hasAllowedContentType(request.headers, allowedRequestContentTypes.adminJson)) {
    return buildAdminNoStoreResponse(415);
  }

  if (!isBodySizeWithinLimit(request.headers, requestBodyLimits.adminJson)) {
    return buildAdminNoStoreResponse(413);
  }

  const payload = await parseJsonRequestWithinLimit(request, requestBodyLimits.adminJson);

  if (!payload.ok || !payload.payload) {
    return buildAdminNoStoreResponse(400);
  }

  if (
    !verifyAdminCsrf(
      locals.admin,
      request.headers.get("x-admin-csrf-token") ?? payload.payload._csrf
    )
  ) {
    return buildAdminNoStoreResponse(403);
  }

  const result = await performAdminWorkflowAction(
    {
      adminSession: locals.admin,
      action: payload.payload.action,
      documentId: payload.payload.documentId,
      documentTitle: payload.payload.documentTitle,
      changedFields: Array.isArray(payload.payload.changedFields)
        ? payload.payload.changedFields
        : [],
      note: payload.payload.note ?? "",
      headers: request.headers
    },
    {
      env: globalThis.process?.env
    }
  );

  return Response.json(result, {
    status: result.status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
};

export const GET: APIRoute = async () =>
  buildAdminNoStoreResponse(405, "Method not allowed", {
    Allow: "POST"
  });
