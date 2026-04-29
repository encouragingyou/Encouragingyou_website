import { assertCalendarFile, gotoRoute, openPrimaryNavIfNeeded } from "./assertions.mjs";
import { expect } from "./fixtures.mjs";

export function getSessionCard(page, title) {
  return page.locator(".session-card").filter({
    has: page.getByRole("heading", { name: title })
  });
}

export function getInvolvementCard(page, title) {
  return page.locator(".involvement-pathway-card").filter({
    has: page.getByRole("heading", { name: title })
  });
}

export function getProgrammeCard(page, title) {
  return page.locator(".programme-pillar-card").filter({
    has: page.getByRole("heading", { name: title })
  });
}

export async function activateWithKeyboard(locator, key = "Enter") {
  await locator.focus();
  await expect(locator).toBeFocused();
  await locator.press(key);
}

export async function openPrimaryRoute(page, routeLabel) {
  await openPrimaryNavIfNeeded(page);
  await page
    .getByRole("navigation", { name: "Primary" })
    .getByRole("link", { name: routeLabel })
    .click();
}

export async function openSessionsHubFromHome(page) {
  await gotoRoute(page, "/");
  await page
    .locator("main")
    .getByRole("link", { exact: true, name: "Join a session" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/sessions\/$/u);
}

export async function openSessionDetail(page, title) {
  const card = getSessionCard(page, title);

  await card.getByRole("link", { name: "See details" }).click();
}

export async function verifyCalendarDownload(page, request) {
  const calendarHref = await page
    .getByRole("link", { name: "Add to calendar" })
    .first()
    .getAttribute("href");

  await assertCalendarFile(request, calendarHref);
}

export async function expectContextualContactState(
  page,
  { backLinkName, contextText, reasonValue }
) {
  await expect(page.locator("#support-reason")).toHaveValue(reasonValue);
  await expect(
    page.locator("main").getByRole("link", { name: "Privacy Notice" }).first()
  ).toBeVisible();

  if (contextText) {
    await expect(page.getByText(contextText)).toBeVisible();
  }

  if (backLinkName) {
    await expect(
      page.locator("main").getByRole("link", { name: backLinkName }).first()
    ).toBeVisible();
  }
}

export async function followFooterLegalLink(page, label, expectedUrlPattern) {
  await page.getByRole("contentinfo").getByRole("link", { name: label }).click();

  if (expectedUrlPattern) {
    await expect(page).toHaveURL(expectedUrlPattern);
  }
}

export async function turnOffAnonymousAnalytics(page) {
  await page.getByRole("button", { name: "Turn off anonymous analytics" }).click();
  await expect(
    page.getByText("Anonymous service-improvement analytics are off on this device.")
  ).toBeVisible();
}

export async function expectAnalyticsPreferenceCookie(page, expectedValue) {
  const cookie = (await page.context().cookies()).find(
    (entry) => entry.name === "ey_analytics_pref"
  );

  if (expectedValue === null) {
    expect(cookie).toBeUndefined();
    return;
  }

  expect(cookie?.value).toBe(expectedValue);
}
