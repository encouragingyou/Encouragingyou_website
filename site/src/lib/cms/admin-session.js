import { adminCan, validateAdminSessionRequest } from "./admin-auth.js";

const DEFAULT_ADMIN_RETURN_PATH = "/admin/";

export const adminPublicPagePaths = new Set(["/admin/login/", "/admin/login/mfa/"]);

export const adminPublicApiPaths = new Set([
  "/api/admin/login/",
  "/api/admin/login-mfa/",
  "/api/admin/activate/"
]);

export function isAdminAuthPagePath(pathname) {
  return adminPublicPagePaths.has(pathname) || pathname.startsWith("/admin/activate/");
}

export function isAdminPublicApiPath(pathname) {
  return adminPublicApiPaths.has(pathname);
}

export function resolveSafeAdminReturnTo(value) {
  const requestedValue = `${value ?? ""}`.trim();

  if (!requestedValue.startsWith("/admin/")) {
    return DEFAULT_ADMIN_RETURN_PATH;
  }

  return requestedValue;
}

export function buildAdminLoginHref(returnTo = DEFAULT_ADMIN_RETURN_PATH) {
  const href = new URL("/admin/login/", "https://www.encouragingyou.co.uk");

  href.searchParams.set("returnTo", resolveSafeAdminReturnTo(returnTo));

  return `${href.pathname}${href.search}`;
}

export async function resolveAdminSession({ requestUrl, headers, cookies, ...options }) {
  return validateAdminSessionRequest({
    requestUrl,
    headers,
    cookies,
    ...options
  });
}

export { adminCan };
