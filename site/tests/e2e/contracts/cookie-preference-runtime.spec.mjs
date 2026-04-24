import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("first visit stays banner-free and analytics preference changes apply on next navigation", async ({
  browser,
  pageIssues
}) => {
  const context = await browser.newContext();
  const homePage = await context.newPage();
  const cookiesPage = await context.newPage();

  await gotoRoute(homePage, "/");
  await expect(homePage.getByRole("dialog")).toHaveCount(0);
  await expect(homePage.getByRole("button", { name: /accept/i })).toHaveCount(0);
  await expect(homePage.getByRole("button", { name: /reject/i })).toHaveCount(0);
  await expect(homePage.getByRole("button", { name: /customi[sz]e/i })).toHaveCount(0);
  await expect(homePage.locator("html")).toHaveAttribute(
    "data-analytics-collection",
    "true"
  );

  const initialPreferenceCookie = (await context.cookies()).find(
    (entry) => entry.name === "ey_analytics_pref"
  );
  expect(initialPreferenceCookie).toBeUndefined();

  await gotoRoute(cookiesPage, "/cookies/");
  await expect(
    cookiesPage.getByRole("heading", {
      level: 2,
      name: "Control the live anonymous measurement layer."
    })
  ).toBeVisible();
  await expect(
    cookiesPage.getByText("Anonymous service-improvement analytics are active.")
  ).toBeVisible();

  await cookiesPage.getByRole("button", { name: "Turn off anonymous analytics" }).click();
  await expect(
    cookiesPage.getByText("Anonymous service-improvement analytics are off on this device.")
  ).toBeVisible();
  await expect(cookiesPage).toHaveURL(/analyticsPreference=objected/u);

  const objectedCookie = (await context.cookies()).find(
    (entry) => entry.name === "ey_analytics_pref"
  );
  expect(objectedCookie?.value).toBe("objected");

  await expect(homePage.locator("html")).toHaveAttribute(
    "data-analytics-collection",
    "true"
  );

  await gotoRoute(homePage, "/");
  await expect(homePage.locator("html")).toHaveAttribute(
    "data-analytics-collection",
    "false"
  );

  await context.close();

  void pageIssues;
});
