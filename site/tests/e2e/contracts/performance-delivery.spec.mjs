import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("home route preloads the owned font and uses curated public hero derivatives", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  const fontPreload = page.locator('head link[rel="preload"][as="font"]').first();
  const heroPicture = page.locator(".home-hero__media picture").first();
  const heroImage = heroPicture.locator("img").first();

  await expect(fontPreload).toHaveAttribute(
    "href",
    "/fonts/atkinson-hyperlegible-next-latin-wght-normal.woff2"
  );
  await expect(heroPicture.locator('source[type="image/avif"]').first()).toHaveAttribute(
    "srcset",
    /\/images\/hero-800\.avif 800w/u
  );
  await expect(heroImage).toHaveAttribute("src", "/images/hero-1200.webp");
  await expect(heroImage).toHaveAttribute("fetchpriority", "high");

  void pageIssues;
});

test("programme routes load public images and icons without prototype or Astro image URLs", async ({
  page,
  pageIssues
}) => {
  const imageRequests = [];

  page.on("requestfinished", (request) => {
    if (request.resourceType() === "image") {
      imageRequests.push(new URL(request.url()).pathname);
    }
  });

  await gotoRoute(page, "/programmes/community-friendship/");

  const cardImage = page.locator("img[src^='/images/']").first();
  const relatedIcon = page.locator("img[src^='/icons/']").first();

  await expect(cardImage).toHaveAttribute("src", /\/images\/community-friendship-/u);
  await expect(relatedIcon).toHaveAttribute("src", /\/icons\/.+\.webp/u);
  await expect(page.locator('head link[href="/assets/css/styles.css"]')).toHaveCount(0);
  await expect(page.locator('script[src="/assets/js/site.js"]')).toHaveCount(0);

  expect(imageRequests.some((pathname) => pathname.startsWith("/_astro/"))).toBeFalsy();
  expect(imageRequests.some((pathname) => pathname.startsWith("/images/"))).toBeTruthy();

  void pageIssues;
});
