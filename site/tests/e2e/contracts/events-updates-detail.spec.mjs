import { assertNoHorizontalOverflow, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("event detail pages keep lifecycle guidance, practical details, and route handoffs distinct", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/events-updates/");
  await page.locator("main").getByRole("link", { name: "View event details" }).click();
  await expect(page).toHaveURL(/\/events-updates\/community-events-and-workshops\/$/u);
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", { level: 1, name: "Community events and workshops" })
  ).toBeVisible();
  await expect(page.locator(".editorial-detail-hero__media")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toContainText(
    "Events & Updates"
  );
  await expect(
    main.getByText("Dates still to be confirmed", { exact: true })
  ).toBeVisible();
  await expect(
    main.getByText("Time shared when confirmed", { exact: true })
  ).toBeVisible();
  await expect(main.getByText("Rochdale", { exact: true })).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Ask about community events" }).first()
  ).toBeVisible();
  await expect(
    main.getByRole("link", { name: "Browse live sessions" }).first()
  ).toBeVisible();

  void pageIssues;
});

test("update detail pages stay editorial while handing people into the live route", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/events-updates/live-support-stays-on-sessions/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Live Saturday support stays on the Sessions route"
    })
  ).toBeVisible();
  await expect(page.locator(".editorial-detail-hero__media")).toHaveCount(0);
  await expect(
    main.getByText("Published when guidance is ready", { exact: true })
  ).toBeVisible();
  await expect(
    main.getByRole("link", { name: "See live sessions" }).first()
  ).toBeVisible();

  await main.getByRole("link", { name: "See live sessions" }).first().click();
  await expect(page).toHaveURL(/\/sessions\/$/u);

  void pageIssues;
});

test("opportunity detail pages can carry media and then hand off to the dedicated hub", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/events-updates/volunteer-partner-or-refer-someone/");
  await assertNoHorizontalOverflow(page);

  const main = page.locator("main");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Volunteer, partner, or refer someone through one clear route"
    })
  ).toBeVisible();
  await expect(page.locator(".editorial-detail-hero__media")).toHaveCount(1);
  await expect(
    page.locator(
      ".editorial-detail-hero__media [data-notice-id='ai-illustration'][data-disclosure-variant='prominent']"
    )
  ).toBeVisible();
  await expect(
    main.locator(".badge").filter({ hasText: "Open now" }).first()
  ).toBeVisible();

  await main.getByRole("link", { name: "See ways to get involved" }).first().click();
  await expect(page).toHaveURL(/\/get-involved\/$/u);

  void pageIssues;
});
