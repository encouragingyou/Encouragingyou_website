import { expect, test } from "../support/fixtures.mjs";

const baseOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173")
  .origin;

test("HTML routes expose the hardened browser policy set", async ({
  page,
  pageIssues
}) => {
  const response = await page.goto("/contact/", { waitUntil: "domcontentloaded" });

  expect(response?.ok(), "Expected /contact/ to load successfully").toBeTruthy();

  const headers = response?.headers() ?? {};

  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("form-action 'self'");
  expect(headers["content-security-policy"]).toContain("style-src 'self'");
  expect(headers["content-security-policy"]).toContain("style-src-attr 'none'");
  expect(headers["content-security-policy"]).toContain("script-src 'self'");
  expect(headers["content-security-policy"]).toMatch(/'sha256-[^']+'/u);
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");

  await expect(page.locator("html")).toHaveAttribute("data-js", "enabled");

  void pageIssues;
});

test("public APIs reject cross-origin and oversized analytics payloads", async ({
  request
}) => {
  const crossOriginAnalytics = await request.post("/api/analytics/", {
    headers: {
      "Content-Type": "application/json",
      Origin: "https://malicious.example"
    },
    data: {
      eventName: "page_view",
      pageId: "home",
      routeFamily: "home",
      entryType: "direct"
    }
  });
  expect(crossOriginAnalytics.status()).toBe(403);

  const oversizedAnalytics = await request.post("/api/analytics/", {
    headers: {
      "Content-Type": "application/json",
      Origin: baseOrigin,
      Referer: `${baseOrigin}/cookies/`
    },
    data: {
      eventName: "page_view",
      pageId: "home",
      routeFamily: "home",
      entryType: "direct",
      filler: "x".repeat(8_000)
    }
  });
  expect(oversizedAnalytics.status()).toBe(413);
});
