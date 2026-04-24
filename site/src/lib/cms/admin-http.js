/**
 * @param {number} status
 * @param {BodyInit | null} [body]
 * @param {HeadersInit} [extraHeaders]
 */
export function buildAdminNoStoreResponse(status, body = null, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}

/**
 * @param {string} location
 * @param {HeadersInit} [extraHeaders]
 */
export function buildAdminRedirectResponse(location, extraHeaders = {}) {
  return new Response(null, {
    status: 303,
    headers: {
      Location: location,
      "Cache-Control": "no-store",
      ...extraHeaders
    }
  });
}
