import { createHash } from "node:crypto";

export const securityPolicyVersion = "2026-04-24";

const INLINE_SCRIPT_PATTERN = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/giu;

const permissionsPolicy = [
  "camera=()",
  "geolocation=()",
  "microphone=()",
  "payment=()",
  "usb=()"
].join(", ");

export function isSecureTransport(requestUrl, headers) {
  const protocol = (
    headers.get("x-forwarded-proto") ?? new URL(requestUrl).protocol
  ).replace(/:$/u, "");

  return protocol === "https";
}

export function extractInlineScriptHashes(html = "") {
  INLINE_SCRIPT_PATTERN.lastIndex = 0;
  const hashes = new Set();
  let match = INLINE_SCRIPT_PATTERN.exec(html);

  while (match) {
    const scriptBody = match[1];

    if (scriptBody.length > 0) {
      const hash = createHash("sha256").update(scriptBody).digest("base64");

      hashes.add(`'sha256-${hash}'`);
    }

    match = INLINE_SCRIPT_PATTERN.exec(html);
  }

  INLINE_SCRIPT_PATTERN.lastIndex = 0;

  return [...hashes].sort();
}

export function serializeJsonForScript(value) {
  return JSON.stringify(value).replace(/</gu, "\\u003C").replace(/-->/gu, "--\\u003E");
}

export function buildContentSecurityPolicy({ html = "", requestUrl, headers }) {
  const scriptHashes = extractInlineScriptHashes(html);
  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "img-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    `script-src 'self'${scriptHashes.length > 0 ? ` ${scriptHashes.join(" ")}` : ""}`,
    "script-src-attr 'none'",
    "style-src 'self'",
    "style-src-attr 'none'"
  ];

  if (isSecureTransport(requestUrl, headers)) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

export function getSecurityHeaders({
  contentType = "",
  html = "",
  requestUrl,
  headers,
  isDevRuntime = false
}) {
  const securityHeaders = {
    "Cross-Origin-Opener-Policy": "same-origin",
    "Origin-Agent-Cluster": "?1",
    "Permissions-Policy": permissionsPolicy,
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-Permitted-Cross-Domain-Policies": "none"
  };

  if (isSecureTransport(requestUrl, headers)) {
    securityHeaders["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  if (!isDevRuntime && contentType.includes("text/html")) {
    securityHeaders["Content-Security-Policy"] = buildContentSecurityPolicy({
      html,
      requestUrl,
      headers
    });
  }

  return securityHeaders;
}
