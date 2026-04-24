import { defineMiddleware } from "astro:middleware";

import {
  scheduleCalendarDownloadAnalytics,
  schedulePageAnalytics
} from "./lib/analytics/server.js";
import {
  buildAdminLoginHref,
  isAdminAuthPagePath,
  isAdminPublicApiPath,
  resolveAdminSession,
  resolveSafeAdminReturnTo
} from "./lib/cms/admin-session.js";
import {
  getDeploymentHeaders,
  resolveDeploymentContext
} from "./lib/deployment/context.js";
import { cachePolicy, resolveHtmlCacheControl } from "./lib/performance/policies.js";
import { getSecurityHeaders } from "./lib/security/policy.js";

function isStaticAssetRequest(pathname: string) {
  return (
    pathname.startsWith("/_astro/") ||
    pathname.startsWith("/fonts/") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/") ||
    pathname.startsWith("/social/") ||
    pathname.startsWith("/calendar/") ||
    /\.[a-z0-9]+$/iu.test(pathname)
  );
}

function buildSurfaceBoundaryResponse(status = 404) {
  return new Response("Not Found", {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive"
    }
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  const requestHeaders = context.isPrerendered ? new Headers() : context.request.headers;
  const requestCookies = context.isPrerendered
    ? ""
    : (requestHeaders.get("cookie") ?? "");
  const pathname = context.url.pathname;
  const isAdminPageRequest = pathname.startsWith("/admin/");
  const isAdminApiRequest = pathname.startsWith("/api/admin/");
  const isAdminRequest = isAdminPageRequest || isAdminApiRequest;
  const isHealthRequest = pathname === "/api/health/";
  const isDiscoveryArtifactRequest =
    pathname === "/robots.txt" || pathname === "/sitemap.xml";

  context.locals.deployment = resolveDeploymentContext();
  context.locals.requestHeaders = context.isPrerendered ? undefined : requestHeaders;
  context.locals.requestCookies = requestCookies;

  if (!context.isPrerendered && isAdminRequest) {
    context.locals.admin = await resolveAdminSession({
      requestUrl: context.request.url,
      headers: requestHeaders,
      cookies: context.cookies
    });
  } else {
    context.locals.admin = undefined;
  }

  if (!context.isPrerendered) {
    const deploymentSurface = context.locals.deployment.surface;

    if (deploymentSurface === "public" && isAdminRequest) {
      return buildSurfaceBoundaryResponse(404);
    }

    if (deploymentSurface === "admin") {
      if (pathname === "/") {
        return context.redirect("/admin/");
      }

      if (
        !isAdminRequest &&
        !isHealthRequest &&
        !isDiscoveryArtifactRequest &&
        !isStaticAssetRequest(pathname)
      ) {
        return buildSurfaceBoundaryResponse(404);
      }

      if (pathname.startsWith("/api/") && !isHealthRequest && !isAdminApiRequest) {
        return buildSurfaceBoundaryResponse(404);
      }
    }
  }

  if (!context.isPrerendered && isAdminPageRequest) {
    const adminSession = context.locals.admin;

    if (isAdminAuthPagePath(pathname)) {
      if (adminSession?.authenticated) {
        return context.redirect(
          resolveSafeAdminReturnTo(context.url.searchParams.get("returnTo"))
        );
      }
    } else if (!adminSession?.authenticated) {
      return context.redirect(buildAdminLoginHref(pathname));
    }
  }

  if (!context.isPrerendered && isAdminApiRequest) {
    const adminSession = context.locals.admin;

    if (!isAdminPublicApiPath(pathname) && !adminSession?.authenticated) {
      return Response.json(
        {
          ok: false,
          state: adminSession?.reason ?? "unauthenticated"
        },
        {
          status:
            adminSession?.reason === "portal-disabled" ||
            adminSession?.reason === "crypto-config-missing"
              ? 503
              : 401,
          headers: {
            "Cache-Control": "no-store"
          }
        }
      );
    }
  }

  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";
  const html = contentType.includes("text/html") ? await response.clone().text() : "";

  for (const [headerName, headerValue] of Object.entries(
    getSecurityHeaders({
      contentType,
      html,
      requestUrl: context.request.url,
      headers: requestHeaders,
      isDevRuntime: import.meta.env.DEV
    })
  )) {
    response.headers.set(headerName, headerValue);
  }

  for (const [headerName, headerValue] of Object.entries(
    getDeploymentHeaders(context.locals.deployment)
  )) {
    response.headers.set(headerName, headerValue);
  }

  if (context.url.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", cachePolicy.api.sensitive);
  }

  if (isAdminRequest) {
    response.headers.set("Cache-Control", cachePolicy.api.sensitive);
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }

  if (contentType.includes("text/html")) {
    response.headers.set(
      "Cache-Control",
      isAdminRequest
        ? cachePolicy.api.sensitive
        : resolveHtmlCacheControl(context.url.pathname)
    );

    if (isAdminRequest || !context.locals.deployment.searchIndexingAllowed) {
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
  }

  if (!["GET", "HEAD"].includes(context.request.method)) {
    return response;
  }

  if (!context.isPrerendered && context.request.method === "GET" && !isAdminRequest) {
    schedulePageAnalytics({
      pathname: context.url.pathname,
      requestUrl: context.request.url,
      headers: requestHeaders,
      cookies: context.cookies,
      response
    });
    scheduleCalendarDownloadAnalytics({
      pathname: context.url.pathname,
      requestUrl: context.request.url,
      headers: requestHeaders,
      cookies: context.cookies,
      response
    });
  }

  return response;
});
