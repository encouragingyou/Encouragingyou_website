import { Buffer } from "node:buffer";

export const requestBodyLimits = {
  adminForm: 16_384,
  adminJson: 16_384,
  enquiry: 16_384,
  analyticsEvent: 4_096,
  analyticsPreference: 2_048
};

export const allowedRequestContentTypes = {
  adminForm: ["application/x-www-form-urlencoded", "multipart/form-data"],
  adminJson: ["application/json"],
  enquiry: ["application/x-www-form-urlencoded", "multipart/form-data"],
  analyticsEvent: ["application/json"],
  analyticsPreference: ["application/x-www-form-urlencoded"]
};

export function normalizeContentType(headers) {
  return (headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
}

export function hasAllowedContentType(headers, allowedContentTypes = []) {
  const contentType = normalizeContentType(headers);

  return contentType !== "" && allowedContentTypes.includes(contentType);
}

export function isBodySizeWithinLimit(headers, maxBytes) {
  const contentLength = headers.get("content-length");

  if (!contentLength) {
    return true;
  }

  const parsedLength = Number(contentLength);

  return Number.isFinite(parsedLength) && parsedLength >= 0 && parsedLength <= maxBytes;
}

export async function parseJsonRequestWithinLimit(request, maxBytes) {
  const body = await request.text();

  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    return {
      ok: false,
      error: "request-too-large",
      payload: null
    };
  }

  if (!body.trim()) {
    return {
      ok: false,
      error: "invalid-json",
      payload: null
    };
  }

  try {
    return {
      ok: true,
      error: "",
      payload: JSON.parse(body)
    };
  } catch {
    return {
      ok: false,
      error: "invalid-json",
      payload: null
    };
  }
}

export function getRequestOrigin(requestUrl, headers) {
  const forwardedHost = headers.get("x-forwarded-host");
  const host = forwardedHost ?? headers.get("host");

  if (host) {
    const protocol = (
      headers.get("x-forwarded-proto") ?? new URL(requestUrl).protocol
    ).replace(/:$/u, "");

    return `${protocol}://${host}`;
  }

  return new URL(requestUrl).origin;
}

function matchesRequestHost(candidateUrl, headers) {
  const requestHost = headers.get("x-forwarded-host") ?? headers.get("host");

  if (!requestHost) {
    return false;
  }

  try {
    return new URL(candidateUrl).host === requestHost;
  } catch {
    return false;
  }
}

export function isTrustedSameOriginRequest({ requestUrl, headers }) {
  const requestOrigin = getRequestOrigin(requestUrl, headers);
  const origin = headers.get("origin");

  if (origin) {
    return origin === requestOrigin || matchesRequestHost(origin, headers);
  }

  const referer = headers.get("referer");

  if (referer) {
    try {
      return (
        new URL(referer).origin === requestOrigin || matchesRequestHost(referer, headers)
      );
    } catch {
      return false;
    }
  }

  const fetchSite = headers.get("sec-fetch-site");

  if (!fetchSite) {
    return true;
  }

  return ["same-origin", "same-site", "none"].includes(fetchSite);
}
