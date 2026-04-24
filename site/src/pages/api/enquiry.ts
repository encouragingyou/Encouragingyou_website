import type { APIRoute } from "astro";

import { resolveEnquiryDeliveryMode } from "../../lib/forms/enquiry-contract.js";
import {
  processEnquirySubmission,
  wantsJsonResponse
} from "../../lib/server/enquiry-service.js";
import {
  allowedRequestContentTypes,
  hasAllowedContentType,
  isBodySizeWithinLimit,
  requestBodyLimits
} from "../../lib/security/request-guards.js";

export const prerender = false;

function buildRedirectResponse(location: string) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store"
    }
  });
}

function buildEmailOnlyResponse(request: Request) {
  const body = {
    ok: false,
    state: "error",
    code: "delivery-disabled",
    tone: "error",
    message:
      "This deployment accepts new enquiries by email only. Use the email link on the page."
  };

  if (!wantsJsonResponse(request)) {
    return new Response(body.message, {
      status: 503,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  return Response.json(body, {
    status: 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!hasAllowedContentType(request.headers, allowedRequestContentTypes.enquiry)) {
    return new Response("Unsupported media type", {
      status: 415,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  if (resolveEnquiryDeliveryMode() !== "secure") {
    return buildEmailOnlyResponse(request);
  }

  if (!isBodySizeWithinLimit(request.headers, requestBodyLimits.enquiry)) {
    return new Response("Request too large", {
      status: 413,
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  const formData = await request.formData();
  const result = await processEnquirySubmission({
    requestUrl: request.url,
    headers: request.headers,
    formData
  });

  if (!wantsJsonResponse(request)) {
    return buildRedirectResponse(result.redirectUrl);
  }

  const responseStatus = result.ok || result.state === "error" ? result.status : 200;

  return Response.json(
    {
      ok: result.ok,
      state: result.state,
      code: result.code,
      tone: result.tone,
      message: result.message,
      referenceId: "referenceId" in result ? (result.referenceId ?? null) : null,
      fieldErrors: "fieldErrors" in result ? (result.fieldErrors ?? {}) : {}
    },
    {
      status: responseStatus,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
};

export const GET: APIRoute = async () =>
  new Response("Method not allowed", {
    status: 405,
    headers: {
      Allow: "POST",
      "Cache-Control": "no-store"
    }
  });
