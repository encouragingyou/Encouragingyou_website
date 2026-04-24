import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";
import { fillSupportForm, submitSupportForm } from "../support/forms.mjs";
import { readMatchingAnalyticsCount } from "../support/storage.mjs";

test("page views, CTA clicks, and successful enquiries are captured as aggregate analytics", async ({
  page
}) => {
  const homePageViewsBefore = await readMatchingAnalyticsCount(
    (entry) => entry.eventName === "page_view" && entry.dimensions.pageId === "home"
  );
  const homeCtaBefore = await readMatchingAnalyticsCount(
    (entry) =>
      entry.eventName === "cta_click" &&
      entry.dimensions.pageId === "home" &&
      entry.dimensions.destinationFamily === "sessions"
  );
  const contactSubmitBefore = await readMatchingAnalyticsCount(
    (entry) =>
      entry.eventName === "form_submitted" &&
      entry.dimensions.pageId === "contact" &&
      entry.dimensions.surfaceId === "support-general"
  );

  await gotoRoute(page, "/");
  await expect
    .poll(async () =>
      readMatchingAnalyticsCount(
        (entry) => entry.eventName === "page_view" && entry.dimensions.pageId === "home"
      )
    )
    .toBeGreaterThan(homePageViewsBefore);

  await page.getByRole("link", { name: "Join a session" }).first().click();
  await expect(page).toHaveURL(/\/sessions\/$/u);
  await expect
    .poll(async () =>
      readMatchingAnalyticsCount(
        (entry) =>
          entry.eventName === "cta_click" &&
          entry.dimensions.pageId === "home" &&
          entry.dimensions.destinationFamily === "sessions"
      )
    )
    .toBeGreaterThan(homeCtaBefore);

  await gotoRoute(page, "/contact/");
  await fillSupportForm(page, {
    name: "Alex",
    email: "alex@example.com",
    reason: "general",
    message: "I would like to understand the best first step before I travel."
  });
  await submitSupportForm(page);
  await expect
    .poll(async () =>
      readMatchingAnalyticsCount(
        (entry) =>
          entry.eventName === "form_submitted" &&
          entry.dimensions.pageId === "contact" &&
          entry.dimensions.surfaceId === "support-general"
      )
    )
    .toBeGreaterThan(contactSubmitBefore);
});

test("cookie-route objection disables further measurement for the browser session", async ({
  page
}) => {
  const analyticsRequests = [];

  page.on("request", (request) => {
    if (request.url().endsWith("/api/analytics/")) {
      analyticsRequests.push(request.url());
    }
  });

  await gotoRoute(page, "/cookies/");
  const preferenceChangesBefore = await readMatchingAnalyticsCount(
    (entry) =>
      entry.eventName === "analytics_preference_changed" &&
      entry.dimensions.preferenceState === "objected"
  );

  await page.getByRole("button", { name: "Turn off anonymous analytics" }).click();
  await expect(
    page.getByText("Anonymous service-improvement analytics are off on this device.")
  ).toBeVisible();
  await expect
    .poll(async () =>
      readMatchingAnalyticsCount(
        (entry) =>
          entry.eventName === "analytics_preference_changed" &&
          entry.dimensions.preferenceState === "objected"
      )
    )
    .toBeGreaterThan(preferenceChangesBefore);

  await gotoRoute(page, "/");
  await expect(page.locator("html")).toHaveAttribute(
    "data-analytics-collection",
    "false"
  );
  await page.getByRole("link", { name: "Join a session" }).first().click();
  await expect(page).toHaveURL(/\/sessions\/$/u);
  expect(analyticsRequests).toHaveLength(0);
});
