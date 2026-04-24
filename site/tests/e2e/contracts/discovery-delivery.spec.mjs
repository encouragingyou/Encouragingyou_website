import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

async function getStructuredDataEntries(page) {
  const payloads = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent).filter(Boolean));

  return payloads.flatMap((payload) => {
    const parsed = JSON.parse(payload);

    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

test("robots and sitemap stay aligned with the canonical-only discovery policy", async ({
  request
}) => {
  const [robotsResponse, sitemapResponse] = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml")
  ]);

  const robotsBody = await robotsResponse.text();
  const sitemapBody = await sitemapResponse.text();

  expect(robotsResponse.ok()).toBeTruthy();
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(robotsBody).toContain("Disallow: /api/");
  expect(robotsBody).toContain("Disallow: /system/");
  expect(robotsBody).toContain("Sitemap: https://www.encouragingyou.co.uk/sitemap.xml");
  expect(sitemapBody).toContain("https://www.encouragingyou.co.uk/programmes/");
  expect(sitemapBody).toContain(
    "https://www.encouragingyou.co.uk/events-updates/live-support-stays-on-sessions/"
  );
  expect(sitemapBody).not.toContain("https://www.encouragingyou.co.uk/privacy/");
  expect(sitemapBody).not.toContain(
    "https://www.encouragingyou.co.uk/system/components/"
  );
});

test("home route exposes Organization and WebSite schema alongside the route-family social image", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const entries = await getStructuredDataEntries(page);

  expect(entries.some((entry) => entry["@type"] === "Organization")).toBeTruthy();
  expect(entries.some((entry) => entry["@type"] === "WebSite")).toBeTruthy();
  await expect(page.locator("head meta[property='og:image']")).toHaveAttribute(
    "content",
    "https://www.encouragingyou.co.uk/social/home.png"
  );

  void pageIssues;
});

test("programme detail pages expose Service and BreadcrumbList schema from the shared builders", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/community-friendship/");

  const entries = await getStructuredDataEntries(page);

  expect(entries.some((entry) => entry["@type"] === "Service")).toBeTruthy();
  expect(entries.some((entry) => entry["@type"] === "BreadcrumbList")).toBeTruthy();

  void pageIssues;
});

test("contact route exposes ContactPage and FAQPage schema from visible route content", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/contact/");

  const entries = await getStructuredDataEntries(page);

  expect(entries.some((entry) => entry["@type"] === "ContactPage")).toBeTruthy();
  expect(entries.some((entry) => entry["@type"] === "FAQPage")).toBeTruthy();

  void pageIssues;
});
