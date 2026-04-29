import {
  assertLandmarkOrder,
  assertImageLoaded,
  assertNoHorizontalOverflow,
  assertShellLandmarks,
  assertSingleH1,
  gotoRoute
} from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import { coreRouteContracts, shellRoutes } from "../support/routes.mjs";

for (const route of coreRouteContracts) {
  test(`${route.path} serves a valid structural shell`, async ({ page, pageIssues }) => {
    await gotoRoute(page, route.path);
    await expect(page).toHaveTitle(route.title);
    await assertShellLandmarks(page);
    await assertLandmarkOrder(page);
    await assertSingleH1(page, route.h1);

    void pageIssues;
  });
}

test("primary shell destinations resolve without 404s", async ({
  request,
  page,
  pageIssues
}) => {
  for (const route of shellRoutes) {
    const response = await request.get(route);

    expect(response.ok(), `Expected ${route} to resolve`).toBeTruthy();
  }

  await gotoRoute(page, "/");
  const headerLinks = page.getByRole("navigation", { name: "Primary" }).getByRole("link");
  const footerLinks = page.getByRole("contentinfo").getByRole("link");
  const skipLinks = page.locator(".skip-links .skip-link");

  await expect(headerLinks).toHaveCount(8);
  await expect(skipLinks).toHaveCount(3);
  await expect(footerLinks).toHaveCount(18);
  await expect(page.getByRole("link", { name: "Sessions" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "CV help" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Youth club" }).first()).toBeVisible();
  await expect(
    page.getByRole("contentinfo").getByRole("link", { name: "Privacy" })
  ).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Utility" }).first()).toBeVisible();
  await expect(page.locator(".site-header__brand .brand-mark__icon")).toHaveAttribute(
    "src",
    /\/brand\/encouragingyou-mark\.png$/u
  );
  await expect(page.locator(".site-footer__brand .brand-mark__icon")).toHaveAttribute(
    "src",
    /\/brand\/encouragingyou-mark\.png$/u
  );
  await assertImageLoaded(page.locator(".site-header__brand .brand-mark__icon"));
  await assertImageLoaded(page.locator(".site-footer__brand .brand-mark__icon"));
  await assertNoHorizontalOverflow(page);

  void pageIssues;
});
