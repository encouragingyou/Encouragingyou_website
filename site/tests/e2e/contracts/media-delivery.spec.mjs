import { assertImageLoaded, gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("homepage hero media loads and keeps the AI illustration disclosure visible", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/");

  await assertImageLoaded(page.locator(".home-hero img").first());
  await expect(
    page.locator(".home-hero [data-disclosure-variant='prominent']").first()
  ).toBeVisible();
  await expect(
    page.locator(".site-footer [data-disclosure-variant='sitewide']").first()
  ).toBeVisible();

  void pageIssues;
});

test("programme cards load their shared illustration media", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/programmes/");

  const programmeCardImages = page.locator(".programme-pillar-card__media img");

  await expect(programmeCardImages).toHaveCount(4);
  await assertImageLoaded(programmeCardImages.first());

  void pageIssues;
});

test("session summaries load the wayfinding icon assets", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/");

  const sessionIcons = page.locator(".session-card__icon");

  await expect(sessionIcons).toHaveCount(2);
  await assertImageLoaded(sessionIcons.first());
  await assertImageLoaded(sessionIcons.nth(1));

  void pageIssues;
});

test("get involved route renders both illustration and icon media through the shared system", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/get-involved/");

  await assertImageLoaded(page.locator(".page-intro__media img").first());
  await assertImageLoaded(page.locator(".card-panel__icon").first());

  void pageIssues;
});
