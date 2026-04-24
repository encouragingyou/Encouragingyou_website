import test from "node:test";
import assert from "node:assert/strict";

import {
  buildContentSecurityPolicy,
  extractInlineScriptHashes,
  getSecurityHeaders,
  serializeJsonForScript
} from "../src/lib/security/policy.js";

test("structured data serialization escapes closing tags before inline rendering", () => {
  const serialized = serializeJsonForScript({
    label: "</script><script>alert('xss')</script>"
  });

  assert.doesNotMatch(serialized, /<\/script>/u);
  assert.match(serialized, /\\u003C\/script>/u);
});

test("CSP hashes are derived from the actual inline script bodies", () => {
  const html = [
    "<!doctype html>",
    "<html>",
    "<head>",
    '<script type="application/ld+json">{"@context":"https://schema.org"}</script>',
    '<script>document.documentElement.dataset.js = "enabled";</script>',
    "</head>",
    "<body></body>",
    "</html>"
  ].join("");
  const hashes = extractInlineScriptHashes(html);
  const csp = buildContentSecurityPolicy({
    html,
    requestUrl: "https://www.encouragingyou.co.uk/",
    headers: new Headers()
  });

  assert.equal(hashes.length, 2);
  assert.match(csp, /default-src 'self'/u);
  assert.match(csp, /style-src 'self'/u);
  assert.match(csp, /style-src-attr 'none'/u);
  assert.match(csp, /script-src-attr 'none'/u);

  for (const hash of hashes) {
    assert.match(csp, new RegExp(hash.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"), "u"));
  }
});

test("security headers add HSTS only for secure transport and keep CSP on HTML only", () => {
  const secureHeaders = getSecurityHeaders({
    contentType: "text/html; charset=utf-8",
    html: "<script>console.log('ok')</script>",
    requestUrl: "https://www.encouragingyou.co.uk/contact/",
    headers: new Headers()
  });
  const previewHeaders = getSecurityHeaders({
    contentType: "application/json",
    html: "",
    requestUrl: "http://127.0.0.1:4173/api/analytics/",
    headers: new Headers()
  });

  assert.match(secureHeaders["Strict-Transport-Security"], /max-age=31536000/u);
  assert.ok(secureHeaders["Content-Security-Policy"]);
  assert.equal(previewHeaders["Strict-Transport-Security"], undefined);
  assert.equal(previewHeaders["Content-Security-Policy"], undefined);
});
