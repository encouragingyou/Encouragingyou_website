import { gotoRoute } from "../support/assertions.mjs";
import { expect, test } from "../support/fixtures.mjs";

test("session detail pages expose server-rendered structured event data", async ({
  page,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/cv-support/");

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((nodes) => nodes.map((node) => node.textContent).filter(Boolean));
  const eventData = structuredData
    .map((entry) => JSON.parse(entry))
    .find((entry) => entry["@type"] === "Event");

  expect(
    eventData,
    "Expected an Event JSON-LD payload on the session detail page"
  ).toBeTruthy();
  expect(eventData.name).toBe("CV Support Session");
  expect(eventData.eventStatus).toBe("https://schema.org/EventScheduled");
  expect(eventData.eventSchedule.repeatFrequency).toBe("P1W");
  expect(eventData.eventSchedule.byDay).toEqual(["https://schema.org/Saturday"]);
  expect(eventData.location.address.addressLocality).toBe("Rochdale");

  void pageIssues;
});

test("generated calendar feeds stay aligned with the session detail route", async ({
  page,
  request,
  pageIssues
}) => {
  await gotoRoute(page, "/sessions/youth-club/");

  const calendarHref = await page
    .getByRole("link", { name: "Add to calendar" })
    .first()
    .getAttribute("href");

  const response = await request.get(calendarHref);
  const body = await response.text();

  expect(response.ok()).toBeTruthy();
  expect(response.headers()["content-type"] ?? "").toContain("text/calendar");
  expect(body).toContain("UID:encouragingyou-youth-club@encouragingyou.co.uk");
  expect(body).toContain("RRULE:FREQ=WEEKLY;BYDAY=SA");
  expect(body).toContain("SUMMARY:Youth Club Session");

  void pageIssues;
});
