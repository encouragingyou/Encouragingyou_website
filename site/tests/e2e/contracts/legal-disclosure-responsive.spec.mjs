import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import { viewportMatrix } from "../support/viewports.mjs";

const trustRouteMatrix = [
  {
    path: "/",
    selectors: [
      ".home-hero [data-disclosure-variant='prominent']",
      ".site-footer [data-disclosure-variant='sitewide']"
    ]
  },
  {
    path: "/programmes/",
    selectors: [
      ".programme-pillar-card [data-disclosure-variant='compact']",
      ".site-footer [data-disclosure-variant='sitewide']"
    ]
  },
  {
    path: "/sessions/",
    selectors: [".trust-link-row", ".site-footer [data-disclosure-variant='sitewide']"]
  },
  {
    path: "/about/",
    selectors: [
      "[data-notice-id='ai-illustration'][data-disclosure-variant='prominent']",
      ".proof-boundary"
    ]
  },
  {
    path: "/volunteer/",
    selectors: [
      "[data-notice-id='ai-illustration'][data-disclosure-context='hero']",
      ".privacy-notice-callout"
    ]
  },
  {
    path: "/partner/",
    selectors: [
      "[data-notice-id='ai-illustration'][data-disclosure-context='hero']",
      ".privacy-notice-callout"
    ]
  },
  {
    path: "/contact/",
    selectors: [
      ".privacy-notice-callout",
      ".site-footer [data-disclosure-variant='sitewide']"
    ]
  },
  {
    path: "/cookies/",
    selectors: [".site-footer [data-disclosure-variant='sitewide']"]
  },
  {
    path: "/accessibility/",
    selectors: [".site-footer [data-disclosure-variant='sitewide']"]
  },
  {
    path: "/terms/",
    selectors: [".site-footer [data-disclosure-variant='sitewide']"]
  }
];

for (const viewport of viewportMatrix) {
  test(`@trust trust and legal surfaces stay readable at ${viewport.name}`, async ({
    page,
    pageIssues
  }) => {
    await page.setViewportSize(viewport.size);

    for (const route of trustRouteMatrix) {
      await gotoRoute(page, route.path);
      await assertNoHorizontalOverflow(page);

      for (const selector of route.selectors) {
        const locator = page.locator(selector).first();

        await locator.scrollIntoViewIfNeeded();
        await expect(locator).toBeVisible();
      }
    }

    void pageIssues;
  });
}

test.describe("@trust reduced motion trust surfaces", () => {
  test.use({ reducedMotion: "reduce" });

  test("disclosure and legal entry points remain stable when motion is reduced", async ({
    page,
    pageIssues
  }) => {
    await gotoRoute(page, "/");
    await expect(
      page.locator(".home-hero [data-disclosure-variant='prominent']").first()
    ).toBeVisible();

    await gotoRoute(page, "/cookies/");
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "How this site uses cookies and other storage or access technologies."
      })
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(
      page.locator(".site-footer [data-disclosure-variant='sitewide']").first()
    ).toBeVisible();

    void pageIssues;
  });
});
